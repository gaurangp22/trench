package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/middleware"
	"github.com/trenchjob/backend/internal/service"
	ws "github.com/trenchjob/backend/internal/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development, restrict in production
		return true
	},
}

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct {
	hub            *ws.Hub
	messageService *service.MessageService
	userService    *service.AuthService
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(hub *ws.Hub, messageService *service.MessageService, userService *service.AuthService) *WebSocketHandler {
	return &WebSocketHandler{
		hub:            hub,
		messageService: messageService,
		userService:    userService,
	}
}

// HandleWebSocket handles WebSocket upgrade and connection
func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Get user from context (JWT middleware should have set this)
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create client and start pumps
	client := ws.NewClient(h.hub, conn, claims.UserID, h.handleMessage)
	client.Start()

	log.Printf("WebSocket client connected: user=%s", claims.UserID)
}

// handleMessage processes incoming JSON-RPC messages
func (h *WebSocketHandler) handleMessage(client *ws.Client, message []byte) {
	req, err := ws.ParseRequest(message)
	if err != nil {
		resp := ws.ParseErrorResponse(nil)
		data, _ := ws.MarshalResponse(resp)
		client.Send(data)
		return
	}

	// Validate JSON-RPC version
	if req.JSONRPC != ws.JSONRPCVersion {
		resp := ws.InvalidRequestResponse(req.ID)
		data, _ := ws.MarshalResponse(resp)
		client.Send(data)
		return
	}

	// Route to appropriate handler
	ctx := context.Background()
	var resp *ws.RPCResponse

	switch req.Method {
	case ws.MethodSendMessage:
		resp = h.handleSendMessage(ctx, client, req)
	case ws.MethodGetMessages:
		resp = h.handleGetMessages(ctx, client, req)
	case ws.MethodGetConversations:
		resp = h.handleGetConversations(ctx, client, req)
	case ws.MethodCreateConversation:
		resp = h.handleCreateConversation(ctx, client, req)
	case ws.MethodMarkRead:
		resp = h.handleMarkRead(ctx, client, req)
	case ws.MethodTyping:
		resp = h.handleTyping(ctx, client, req)
	case ws.MethodJoinConversation:
		resp = h.handleJoinConversation(ctx, client, req)
	case ws.MethodLeaveConversation:
		resp = h.handleLeaveConversation(ctx, client, req)
	default:
		resp = ws.MethodNotFoundResponse(req.ID, req.Method)
	}

	if resp != nil && req.ID != nil {
		data, _ := ws.MarshalResponse(resp)
		client.Send(data)
	}
}

// handleSendMessage handles chat.sendMessage
func (h *WebSocketHandler) handleSendMessage(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.SendMessageParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" || params.Text == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id and text are required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	// Convert attachments to domain format
	var attachments []domain.MessageAttachment
	for _, att := range params.Attachments {
		attachments = append(attachments, domain.MessageAttachment{
			FileName:      att.FileName,
			FileURL:       att.URL,
			FileType:      &att.FileType,
			FileSizeBytes: &att.FileSize,
		})
	}

	// Send message using service
	sendReq := &service.SendMessageRequest{
		ConversationID: conversationID,
		MessageText:    params.Text,
		MessageType:    domain.MessageTypeText,
	}

	message, err := h.messageService.SendMessageWithAttachments(ctx, client.UserID(), sendReq, attachments)
	if err != nil {
		return ws.InternalErrorResponse(req.ID, err.Error())
	}

	// Broadcast to other participants
	notification := ws.NewNotification(ws.NotifyNewMessage, ws.NewMessageNotification{
		Message: message,
	})
	notifData, _ := ws.MarshalNotification(notification)
	h.hub.BroadcastToConversation(conversationID, client.UserID(), notifData, true)

	return ws.NewResponse(req.ID, message)
}

// handleGetMessages handles chat.getMessages
func (h *WebSocketHandler) handleGetMessages(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.GetMessagesParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id is required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 50
	}

	messages, total, err := h.messageService.GetMessages(ctx, conversationID, client.UserID(), limit, params.Offset)
	if err != nil {
		return ws.InternalErrorResponse(req.ID, err.Error())
	}

	return ws.NewResponse(req.ID, map[string]interface{}{
		"messages": messages,
		"total":    total,
	})
}

// handleGetConversations handles chat.getConversations
func (h *WebSocketHandler) handleGetConversations(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.GetConversationsParams
	if req.Params != nil {
		json.Unmarshal(req.Params, &params)
	}

	limit := params.Limit
	if limit <= 0 {
		limit = 20
	}

	conversations, total, err := h.messageService.GetConversations(ctx, client.UserID(), limit, params.Offset)
	if err != nil {
		return ws.InternalErrorResponse(req.ID, err.Error())
	}

	// Enrich with online status
	for i := range conversations {
		for j := range conversations[i].Participants {
			userID, _ := uuid.Parse(conversations[i].Participants[j].UserID.String())
			conversations[i].Participants[j].IsOnline = h.hub.IsUserOnline(userID)
		}
	}

	return ws.NewResponse(req.ID, map[string]interface{}{
		"conversations": conversations,
		"total":         total,
	})
}

// handleCreateConversation handles chat.createConversation
func (h *WebSocketHandler) handleCreateConversation(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.CreateConversationParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ParticipantID == "" {
		return ws.InvalidParamsResponse(req.ID, "participant_id is required")
	}

	participantID, err := uuid.Parse(params.ParticipantID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid participant_id")
	}

	createReq := &service.CreateConversationRequest{
		ParticipantID:  participantID,
		InitialMessage: params.InitialMessage,
	}

	if params.ContractID != "" {
		contractID, err := uuid.Parse(params.ContractID)
		if err == nil {
			createReq.ContractID = &contractID
		}
	}

	if params.JobID != "" {
		jobID, err := uuid.Parse(params.JobID)
		if err == nil {
			createReq.JobID = &jobID
		}
	}

	conversation, err := h.messageService.CreateConversation(ctx, client.UserID(), createReq)
	if err != nil {
		return ws.InternalErrorResponse(req.ID, err.Error())
	}

	return ws.NewResponse(req.ID, conversation)
}

// handleMarkRead handles chat.markRead
func (h *WebSocketHandler) handleMarkRead(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.MarkReadParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id is required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	// Mark as read (GetConversation already does this)
	_, err = h.messageService.GetConversation(ctx, conversationID, client.UserID())
	if err != nil {
		return ws.InternalErrorResponse(req.ID, err.Error())
	}

	// Notify other participants about read receipt
	notification := ws.NewNotification(ws.NotifyReadReceipt, ws.ReadReceiptNotification{
		ConversationID: params.ConversationID,
		UserID:         client.UserID().String(),
		ReadAt:         time.Now().UTC().Format(time.RFC3339),
	})
	notifData, _ := ws.MarshalNotification(notification)
	h.hub.BroadcastToConversation(conversationID, client.UserID(), notifData, true)

	return ws.NewResponse(req.ID, map[string]bool{"success": true})
}

// handleTyping handles chat.typing
func (h *WebSocketHandler) handleTyping(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.TypingParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id is required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	// Broadcast typing status to other participants
	notification := ws.NewNotification(ws.NotifyUserTyping, ws.TypingNotification{
		ConversationID: params.ConversationID,
		UserID:         client.UserID().String(),
		IsTyping:       params.IsTyping,
	})
	notifData, _ := ws.MarshalNotification(notification)
	h.hub.BroadcastToConversation(conversationID, client.UserID(), notifData, true)

	return ws.NewResponse(req.ID, map[string]bool{"success": true})
}

// handleJoinConversation handles chat.joinConversation
func (h *WebSocketHandler) handleJoinConversation(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.JoinConversationParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id is required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	// Verify user is a participant in this conversation
	conv, err := h.messageService.GetConversation(ctx, conversationID, client.UserID())
	if err != nil {
		return ws.InternalErrorResponse(req.ID, "conversation not found or access denied")
	}

	// Add client to conversation's broadcast list
	h.hub.JoinConversation(client, conversationID)

	return ws.NewResponse(req.ID, map[string]interface{}{
		"success":      true,
		"conversation": conv,
	})
}

// handleLeaveConversation handles chat.leaveConversation
func (h *WebSocketHandler) handleLeaveConversation(ctx context.Context, client *ws.Client, req *ws.RPCRequest) *ws.RPCResponse {
	var params ws.LeaveConversationParams
	if err := json.Unmarshal(req.Params, &params); err != nil {
		return ws.InvalidParamsResponse(req.ID, err.Error())
	}

	if params.ConversationID == "" {
		return ws.InvalidParamsResponse(req.ID, "conversation_id is required")
	}

	conversationID, err := uuid.Parse(params.ConversationID)
	if err != nil {
		return ws.InvalidParamsResponse(req.ID, "invalid conversation_id")
	}

	// Remove client from conversation's broadcast list
	h.hub.LeaveConversation(client, conversationID)

	return ws.NewResponse(req.ID, map[string]bool{"success": true})
}
