package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/repository"
)

type MessageService struct {
	conversationRepo repository.ConversationRepository
	messageRepo      repository.MessageRepository
	userRepo         repository.UserRepository
	contractRepo     repository.ContractRepository
	profileRepo      repository.ProfileRepository
}

func NewMessageService(
	conversationRepo repository.ConversationRepository,
	messageRepo repository.MessageRepository,
	userRepo repository.UserRepository,
	contractRepo repository.ContractRepository,
	profileRepo repository.ProfileRepository,
) *MessageService {
	return &MessageService{
		conversationRepo: conversationRepo,
		messageRepo:      messageRepo,
		userRepo:         userRepo,
		contractRepo:     contractRepo,
		profileRepo:      profileRepo,
	}
}

// ConversationResponse represents a conversation with enriched data
type ConversationResponse struct {
	ID           uuid.UUID              `json:"id"`
	Participants []ParticipantInfo      `json:"participants"`
	LastMessage  *MessageResponse       `json:"last_message,omitempty"`
	UnreadCount  int                    `json:"unread_count"`
	Context      *ConversationContext   `json:"context,omitempty"`
	UpdatedAt    time.Time              `json:"updated_at"`
	CreatedAt    time.Time              `json:"created_at"`
}

type ParticipantInfo struct {
	UserID    uuid.UUID `json:"user_id"`
	Username  string    `json:"username"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	IsOnline  bool      `json:"is_online"`
}

type ConversationContext struct {
	Type       string          `json:"type"` // "contract", "job", "proposal"
	ID         uuid.UUID       `json:"id"`
	Title      string          `json:"title"`
	Status     string          `json:"status,omitempty"`
	AmountSOL  *string         `json:"amount_sol,omitempty"`
}

type MessageResponse struct {
	ID             uuid.UUID `json:"id"`
	ConversationID uuid.UUID `json:"conversation_id"`
	SenderID       uuid.UUID `json:"sender_id"`
	SenderUsername string    `json:"sender_username"`
	SenderAvatar   *string   `json:"sender_avatar,omitempty"`
	MessageText    string    `json:"message_text"`
	MessageType    string    `json:"message_type"`
	IsEdited       bool      `json:"is_edited"`
	CreatedAt      time.Time `json:"created_at"`
}

// SendMessageRequest represents a request to send a message
type SendMessageRequest struct {
	ConversationID uuid.UUID `json:"conversation_id"`
	MessageText    string    `json:"message_text"`
	MessageType    string    `json:"message_type,omitempty"`
}

// MessageResponseWithAttachments includes attachment info
type MessageResponseWithAttachments struct {
	ID             uuid.UUID             `json:"id"`
	ConversationID uuid.UUID             `json:"conversation_id"`
	SenderID       uuid.UUID             `json:"sender_id"`
	SenderUsername string                `json:"sender_username"`
	SenderAvatar   *string               `json:"sender_avatar,omitempty"`
	MessageText    string                `json:"message_text"`
	MessageType    string                `json:"message_type"`
	IsEdited       bool                  `json:"is_edited"`
	Attachments    []AttachmentResponse  `json:"attachments,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
}

// AttachmentResponse represents an attachment in the response
type AttachmentResponse struct {
	ID        uuid.UUID `json:"id"`
	FileName  string    `json:"file_name"`
	FileURL   string    `json:"file_url"`
	FileType  *string   `json:"file_type,omitempty"`
	FileSize  *int64    `json:"file_size,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// CreateConversationRequest represents a request to create a conversation
type CreateConversationRequest struct {
	ParticipantID uuid.UUID  `json:"participant_id"`
	ContractID    *uuid.UUID `json:"contract_id,omitempty"`
	JobID         *uuid.UUID `json:"job_id,omitempty"`
	InitialMessage string    `json:"initial_message,omitempty"`
}

// GetConversations returns all conversations for a user
func (s *MessageService) GetConversations(ctx context.Context, userID uuid.UUID, limit, offset int) ([]ConversationResponse, int, error) {
	if limit <= 0 {
		limit = 20
	}

	conversations, total, err := s.conversationRepo.GetByUserID(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, apperrors.NewInternal(err)
	}

	var responses []ConversationResponse
	for _, conv := range conversations {
		resp, err := s.enrichConversation(ctx, &conv, userID)
		if err != nil {
			continue // Skip on error
		}
		responses = append(responses, *resp)
	}

	return responses, total, nil
}

// GetConversation returns a single conversation with messages
func (s *MessageService) GetConversation(ctx context.Context, conversationID, userID uuid.UUID) (*ConversationResponse, error) {
	conv, err := s.conversationRepo.GetByID(ctx, conversationID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.NewNotFound("conversation not found")
		}
		return nil, apperrors.NewInternal(err)
	}

	// Verify user is participant (we'd need to add IsParticipant check)
	// For now, we'll proceed

	// Mark as read
	s.conversationRepo.UpdateLastRead(ctx, conversationID, userID)

	return s.enrichConversation(ctx, conv, userID)
}

// GetMessages returns messages for a conversation
func (s *MessageService) GetMessages(ctx context.Context, conversationID, userID uuid.UUID, limit, offset int) ([]MessageResponse, int, error) {
	if limit <= 0 {
		limit = 50
	}

	messages, total, err := s.messageRepo.GetByConversationID(ctx, conversationID, limit, offset)
	if err != nil {
		return nil, 0, apperrors.NewInternal(err)
	}

	// Mark as read
	s.conversationRepo.UpdateLastRead(ctx, conversationID, userID)

	var responses []MessageResponse
	for _, msg := range messages {
		resp := s.toMessageResponse(&msg)
		// Enrich with sender info
		user, err := s.userRepo.GetByID(ctx, msg.SenderID)
		if err == nil {
			resp.SenderUsername = user.Username
		}
		profile, err := s.profileRepo.GetByUserID(ctx, msg.SenderID)
		if err == nil && profile != nil {
			resp.SenderAvatar = profile.AvatarURL
		}
		responses = append(responses, resp)
	}

	return responses, total, nil
}

// SendMessage sends a message in a conversation
func (s *MessageService) SendMessage(ctx context.Context, userID uuid.UUID, req *SendMessageRequest) (*MessageResponse, error) {
	if req.MessageText == "" {
		return nil, apperrors.NewBadRequest("message text is required")
	}

	// Verify conversation exists
	conv, err := s.conversationRepo.GetByID(ctx, req.ConversationID)
	if err != nil {
		return nil, apperrors.NewNotFound("conversation not found")
	}

	// Create message
	msgType := req.MessageType
	if msgType == "" {
		msgType = domain.MessageTypeText
	}

	message := &domain.Message{
		ConversationID: conv.ID,
		SenderID:       userID,
		MessageText:    req.MessageText,
		MessageType:    msgType,
	}

	if err := s.messageRepo.Create(ctx, message); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Enrich response
	resp := s.toMessageResponse(message)
	user, err := s.userRepo.GetByID(ctx, userID)
	if err == nil {
		resp.SenderUsername = user.Username
	}
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err == nil && profile != nil {
		resp.SenderAvatar = profile.AvatarURL
	}

	return &resp, nil
}

// SendMessageWithAttachments sends a message with optional file attachments
func (s *MessageService) SendMessageWithAttachments(ctx context.Context, userID uuid.UUID, req *SendMessageRequest, attachments []domain.MessageAttachment) (*MessageResponseWithAttachments, error) {
	if req.MessageText == "" && len(attachments) == 0 {
		return nil, apperrors.NewBadRequest("message text or attachments required")
	}

	// Verify conversation exists
	conv, err := s.conversationRepo.GetByID(ctx, req.ConversationID)
	if err != nil {
		return nil, apperrors.NewNotFound("conversation not found")
	}

	// Verify user is a participant
	isParticipant, err := s.conversationRepo.IsParticipant(ctx, conv.ID, userID)
	if err != nil || !isParticipant {
		return nil, apperrors.NewForbidden("you are not a participant in this conversation")
	}

	// Create message
	msgType := req.MessageType
	if msgType == "" {
		msgType = domain.MessageTypeText
	}

	message := &domain.Message{
		ConversationID: conv.ID,
		SenderID:       userID,
		MessageText:    req.MessageText,
		MessageType:    msgType,
	}

	if err := s.messageRepo.Create(ctx, message); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Create attachments
	var attachmentResponses []AttachmentResponse
	for _, att := range attachments {
		att.MessageID = message.ID
		if err := s.messageRepo.CreateAttachment(ctx, &att); err != nil {
			// Log but don't fail the message
			continue
		}
		attachmentResponses = append(attachmentResponses, AttachmentResponse{
			ID:        att.ID,
			FileName:  att.FileName,
			FileURL:   att.FileURL,
			FileType:  att.FileType,
			FileSize:  att.FileSizeBytes,
			CreatedAt: att.CreatedAt,
		})
	}

	// Build response
	resp := &MessageResponseWithAttachments{
		ID:             message.ID,
		ConversationID: message.ConversationID,
		SenderID:       message.SenderID,
		MessageText:    message.MessageText,
		MessageType:    message.MessageType,
		IsEdited:       message.IsEdited,
		Attachments:    attachmentResponses,
		CreatedAt:      message.CreatedAt,
	}

	// Enrich with sender info
	user, err := s.userRepo.GetByID(ctx, userID)
	if err == nil {
		resp.SenderUsername = user.Username
	}
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err == nil && profile != nil {
		resp.SenderAvatar = profile.AvatarURL
	}

	return resp, nil
}

// CreateConversation creates a new conversation
func (s *MessageService) CreateConversation(ctx context.Context, userID uuid.UUID, req *CreateConversationRequest) (*ConversationResponse, error) {
	// Verify participant exists
	_, err := s.userRepo.GetByID(ctx, req.ParticipantID)
	if err != nil {
		return nil, apperrors.NewNotFound("participant not found")
	}

	// Create conversation
	conv := &domain.Conversation{
		JobID:      req.JobID,
		ContractID: req.ContractID,
	}

	if err := s.conversationRepo.Create(ctx, conv); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Add participants
	s.conversationRepo.AddParticipant(ctx, conv.ID, userID)
	s.conversationRepo.AddParticipant(ctx, conv.ID, req.ParticipantID)

	// Send initial message if provided
	if req.InitialMessage != "" {
		msg := &domain.Message{
			ConversationID: conv.ID,
			SenderID:       userID,
			MessageText:    req.InitialMessage,
			MessageType:    domain.MessageTypeText,
		}
		s.messageRepo.Create(ctx, msg)
	}

	return s.enrichConversation(ctx, conv, userID)
}

// GetOrCreateContractConversation gets or creates a conversation for a contract
func (s *MessageService) GetOrCreateContractConversation(ctx context.Context, contractID, userID uuid.UUID) (*ConversationResponse, error) {
	// Get contract to find participants
	contract, err := s.contractRepo.GetByID(ctx, contractID)
	if err != nil {
		return nil, apperrors.NewNotFound("contract not found")
	}

	// Verify user is part of contract
	if contract.ClientID != userID && contract.FreelancerID != userID {
		return nil, apperrors.NewForbidden("you are not part of this contract")
	}

	// Try to get existing conversation
	conv, err := s.conversationRepo.GetByContractID(ctx, contractID)
	if err == nil {
		return s.enrichConversation(ctx, conv, userID)
	}

	// Create new conversation
	conv = &domain.Conversation{
		ContractID: &contractID,
	}

	if err := s.conversationRepo.Create(ctx, conv); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Add participants
	s.conversationRepo.AddParticipant(ctx, conv.ID, contract.ClientID)
	s.conversationRepo.AddParticipant(ctx, conv.ID, contract.FreelancerID)

	// Send system message
	msg := &domain.Message{
		ConversationID: conv.ID,
		SenderID:       userID,
		MessageText:    "Conversation started for contract: " + contract.Title,
		MessageType:    domain.MessageTypeSystem,
	}
	s.messageRepo.Create(ctx, msg)

	return s.enrichConversation(ctx, conv, userID)
}

// GetUnreadCount returns total unread messages for a user
func (s *MessageService) GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	count, err := s.messageRepo.GetUnreadCount(ctx, userID)
	if err != nil {
		return 0, apperrors.NewInternal(err)
	}
	return count, nil
}

// Helper to enrich conversation with additional data
func (s *MessageService) enrichConversation(ctx context.Context, conv *domain.Conversation, currentUserID uuid.UUID) (*ConversationResponse, error) {
	resp := &ConversationResponse{
		ID:        conv.ID,
		UpdatedAt: conv.UpdatedAt,
		CreatedAt: conv.CreatedAt,
	}

	// Get participants
	participants, _ := s.conversationRepo.GetParticipants(ctx, conv.ID)
	for _, p := range participants {
		info := ParticipantInfo{
			UserID:   p.UserID,
			IsOnline: false, // TODO: implement online status
		}
		user, err := s.userRepo.GetByID(ctx, p.UserID)
		if err == nil {
			info.Username = user.Username
		}
		profile, err := s.profileRepo.GetByUserID(ctx, p.UserID)
		if err == nil && profile != nil {
			info.AvatarURL = profile.AvatarURL
		}
		resp.Participants = append(resp.Participants, info)
	}

	// Get last message
	lastMsg, err := s.messageRepo.GetLastMessage(ctx, conv.ID)
	if err == nil && lastMsg != nil {
		msgResp := s.toMessageResponse(lastMsg)
		resp.LastMessage = &msgResp
	}

	// Get unread count for current user
	resp.UnreadCount = 0 // TODO: implement per-conversation unread count

	// Get context (contract/job info)
	if conv.ContractID != nil {
		contract, err := s.contractRepo.GetByID(ctx, *conv.ContractID)
		if err == nil {
			amountStr := contract.TotalAmountSOL.String()
			resp.Context = &ConversationContext{
				Type:      "contract",
				ID:        contract.ID,
				Title:     contract.Title,
				Status:    contract.Status,
				AmountSOL: &amountStr,
			}
		}
	}

	return resp, nil
}

func (s *MessageService) toMessageResponse(msg *domain.Message) MessageResponse {
	return MessageResponse{
		ID:             msg.ID,
		ConversationID: msg.ConversationID,
		SenderID:       msg.SenderID,
		MessageText:    msg.MessageText,
		MessageType:    msg.MessageType,
		IsEdited:       msg.IsEdited,
		CreatedAt:      msg.CreatedAt,
	}
}

// Add missing methods to repository interface
func (s *MessageService) GetParticipants(ctx context.Context, conversationID uuid.UUID) ([]domain.ConversationParticipant, error) {
	return s.conversationRepo.GetParticipants(ctx, conversationID)
}

func (s *MessageService) GetLastMessage(ctx context.Context, conversationID uuid.UUID) (*domain.Message, error) {
	return s.messageRepo.GetLastMessage(ctx, conversationID)
}

func (s *MessageService) GetMessageUnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.messageRepo.GetUnreadCount(ctx, userID)
}
