package websocket

import (
	"encoding/json"
)

// JSON-RPC 2.0 specification constants
const (
	JSONRPCVersion = "2.0"
)

// Error codes
const (
	ParseError     = -32700
	InvalidRequest = -32600
	MethodNotFound = -32601
	InvalidParams  = -32602
	InternalError  = -32603
)

// RPCRequest represents a JSON-RPC 2.0 request
type RPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
	ID      interface{}     `json:"id,omitempty"`
}

// RPCResponse represents a JSON-RPC 2.0 response
type RPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
	ID      interface{} `json:"id"`
}

// RPCError represents a JSON-RPC 2.0 error
type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// RPCNotification represents a JSON-RPC 2.0 notification (no ID, no response expected)
type RPCNotification struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params,omitempty"`
}

// Chat method names
const (
	MethodSendMessage        = "chat.sendMessage"
	MethodGetMessages        = "chat.getMessages"
	MethodGetConversations   = "chat.getConversations"
	MethodCreateConversation = "chat.createConversation"
	MethodMarkRead           = "chat.markRead"
	MethodTyping             = "chat.typing"
	MethodJoinConversation   = "chat.joinConversation"
	MethodLeaveConversation  = "chat.leaveConversation"
)

// Server -> Client notification methods
const (
	NotifyNewMessage  = "chat.newMessage"
	NotifyUserTyping  = "chat.userTyping"
	NotifyPresence    = "chat.presence"
	NotifyReadReceipt = "chat.readReceipt"
)

// SendMessageParams represents parameters for chat.sendMessage
type SendMessageParams struct {
	ConversationID string       `json:"conversation_id"`
	Text           string       `json:"text"`
	Attachments    []Attachment `json:"attachments,omitempty"`
}

// Attachment represents a file attachment
type Attachment struct {
	URL      string `json:"url"`
	FileName string `json:"file_name"`
	FileType string `json:"file_type"`
	FileSize int64  `json:"file_size"`
}

// GetMessagesParams represents parameters for chat.getMessages
type GetMessagesParams struct {
	ConversationID string `json:"conversation_id"`
	Limit          int    `json:"limit,omitempty"`
	Offset         int    `json:"offset,omitempty"`
}

// GetConversationsParams represents parameters for chat.getConversations
type GetConversationsParams struct {
	Limit  int `json:"limit,omitempty"`
	Offset int `json:"offset,omitempty"`
}

// CreateConversationParams represents parameters for chat.createConversation
type CreateConversationParams struct {
	ParticipantID  string `json:"participant_id"`
	ContractID     string `json:"contract_id,omitempty"`
	JobID          string `json:"job_id,omitempty"`
	InitialMessage string `json:"initial_message,omitempty"`
}

// MarkReadParams represents parameters for chat.markRead
type MarkReadParams struct {
	ConversationID string `json:"conversation_id"`
}

// TypingParams represents parameters for chat.typing
type TypingParams struct {
	ConversationID string `json:"conversation_id"`
	IsTyping       bool   `json:"is_typing"`
}

// JoinConversationParams represents parameters for chat.joinConversation
type JoinConversationParams struct {
	ConversationID string `json:"conversation_id"`
}

// LeaveConversationParams represents parameters for chat.leaveConversation
type LeaveConversationParams struct {
	ConversationID string `json:"conversation_id"`
}

// NewMessageNotification represents the payload for chat.newMessage notification
type NewMessageNotification struct {
	Message interface{} `json:"message"`
}

// TypingNotification represents the payload for chat.userTyping notification
type TypingNotification struct {
	ConversationID string `json:"conversation_id"`
	UserID         string `json:"user_id"`
	Username       string `json:"username"`
	IsTyping       bool   `json:"is_typing"`
}

// PresenceNotification represents the payload for chat.presence notification
type PresenceNotification struct {
	UserID   string `json:"user_id"`
	IsOnline bool   `json:"is_online"`
}

// ReadReceiptNotification represents the payload for chat.readReceipt notification
type ReadReceiptNotification struct {
	ConversationID string `json:"conversation_id"`
	UserID         string `json:"user_id"`
	ReadAt         string `json:"read_at"`
}

// ParseRequest parses a JSON-RPC request from raw bytes
func ParseRequest(data []byte) (*RPCRequest, error) {
	var req RPCRequest
	if err := json.Unmarshal(data, &req); err != nil {
		return nil, err
	}
	return &req, nil
}

// NewResponse creates a successful JSON-RPC response
func NewResponse(id interface{}, result interface{}) *RPCResponse {
	return &RPCResponse{
		JSONRPC: JSONRPCVersion,
		Result:  result,
		ID:      id,
	}
}

// NewErrorResponse creates an error JSON-RPC response
func NewErrorResponse(id interface{}, code int, message string, data interface{}) *RPCResponse {
	return &RPCResponse{
		JSONRPC: JSONRPCVersion,
		Error: &RPCError{
			Code:    code,
			Message: message,
			Data:    data,
		},
		ID: id,
	}
}

// NewNotification creates a JSON-RPC notification
func NewNotification(method string, params interface{}) *RPCNotification {
	return &RPCNotification{
		JSONRPC: JSONRPCVersion,
		Method:  method,
		Params:  params,
	}
}

// MarshalResponse marshals an RPC response to JSON
func MarshalResponse(resp *RPCResponse) ([]byte, error) {
	return json.Marshal(resp)
}

// MarshalNotification marshals an RPC notification to JSON
func MarshalNotification(notif *RPCNotification) ([]byte, error) {
	return json.Marshal(notif)
}

// Standard error responses
func ParseErrorResponse(id interface{}) *RPCResponse {
	return NewErrorResponse(id, ParseError, "Parse error", nil)
}

func InvalidRequestResponse(id interface{}) *RPCResponse {
	return NewErrorResponse(id, InvalidRequest, "Invalid Request", nil)
}

func MethodNotFoundResponse(id interface{}, method string) *RPCResponse {
	return NewErrorResponse(id, MethodNotFound, "Method not found", method)
}

func InvalidParamsResponse(id interface{}, details string) *RPCResponse {
	return NewErrorResponse(id, InvalidParams, "Invalid params", details)
}

func InternalErrorResponse(id interface{}, details string) *RPCResponse {
	return NewErrorResponse(id, InternalError, "Internal error", details)
}
