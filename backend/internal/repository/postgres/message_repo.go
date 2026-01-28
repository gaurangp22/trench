package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
)

type ConversationRepository struct {
	db *pgxpool.Pool
}

func NewConversationRepository(db *pgxpool.Pool) *ConversationRepository {
	return &ConversationRepository{db: db}
}

func (r *ConversationRepository) Create(ctx context.Context, conversation *domain.Conversation) error {
	query := `
		INSERT INTO conversations (
			id, job_id, proposal_id, contract_id, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)`

	conversation.ID = uuid.New()
	conversation.CreatedAt = time.Now()
	conversation.UpdatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		conversation.ID, conversation.JobID, conversation.ProposalID,
		conversation.ContractID, conversation.CreatedAt, conversation.UpdatedAt,
	)

	return err
}

func (r *ConversationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Conversation, error) {
	query := `
		SELECT id, job_id, proposal_id, contract_id, created_at, updated_at
		FROM conversations
		WHERE id = $1`

	conversation := &domain.Conversation{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&conversation.ID, &conversation.JobID, &conversation.ProposalID,
		&conversation.ContractID, &conversation.CreatedAt, &conversation.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return conversation, err
}

func (r *ConversationRepository) GetByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Conversation, int, error) {
	// First get count
	countQuery := `
		SELECT COUNT(DISTINCT c.id)
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.user_id = $1`

	var total int
	err := r.db.QueryRow(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get conversations with last message info
	query := `
		SELECT c.id, c.job_id, c.proposal_id, c.contract_id, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.user_id = $1
		ORDER BY c.updated_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var conversations []domain.Conversation
	for rows.Next() {
		var conv domain.Conversation
		if err := rows.Scan(
			&conv.ID, &conv.JobID, &conv.ProposalID,
			&conv.ContractID, &conv.CreatedAt, &conv.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		conversations = append(conversations, conv)
	}

	return conversations, total, rows.Err()
}

func (r *ConversationRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) (*domain.Conversation, error) {
	query := `
		SELECT id, job_id, proposal_id, contract_id, created_at, updated_at
		FROM conversations
		WHERE contract_id = $1`

	conversation := &domain.Conversation{}
	err := r.db.QueryRow(ctx, query, contractID).Scan(
		&conversation.ID, &conversation.JobID, &conversation.ProposalID,
		&conversation.ContractID, &conversation.CreatedAt, &conversation.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return conversation, err
}

func (r *ConversationRepository) AddParticipant(ctx context.Context, conversationID, userID uuid.UUID) error {
	query := `
		INSERT INTO conversation_participants (conversation_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (conversation_id, user_id) DO NOTHING`

	_, err := r.db.Exec(ctx, query, conversationID, userID)
	return err
}

func (r *ConversationRepository) GetParticipants(ctx context.Context, conversationID uuid.UUID) ([]domain.ConversationParticipant, error) {
	query := `
		SELECT cp.conversation_id, cp.user_id, cp.last_read_at, cp.is_muted,
			   u.username, u.email
		FROM conversation_participants cp
		JOIN users u ON cp.user_id = u.id
		WHERE cp.conversation_id = $1`

	rows, err := r.db.Query(ctx, query, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var participants []domain.ConversationParticipant
	for rows.Next() {
		var p domain.ConversationParticipant
		var username, email string
		if err := rows.Scan(
			&p.ConversationID, &p.UserID, &p.LastReadAt, &p.IsMuted,
			&username, &email,
		); err != nil {
			return nil, err
		}
		participants = append(participants, p)
	}

	return participants, rows.Err()
}

func (r *ConversationRepository) UpdateLastRead(ctx context.Context, conversationID, userID uuid.UUID) error {
	query := `
		UPDATE conversation_participants
		SET last_read_at = $3
		WHERE conversation_id = $1 AND user_id = $2`

	_, err := r.db.Exec(ctx, query, conversationID, userID, time.Now())
	return err
}

func (r *ConversationRepository) IsParticipant(ctx context.Context, conversationID, userID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2)`
	var exists bool
	err := r.db.QueryRow(ctx, query, conversationID, userID).Scan(&exists)
	return exists, err
}

// Helper to find or create conversation for a contract
func (r *ConversationRepository) FindOrCreateForContract(ctx context.Context, contractID, clientID, freelancerID uuid.UUID) (*domain.Conversation, error) {
	// Try to find existing
	conv, err := r.GetByContractID(ctx, contractID)
	if err == nil {
		return conv, nil
	}

	if !errors.Is(err, apperrors.ErrNotFound) {
		return nil, err
	}

	// Create new conversation
	conv = &domain.Conversation{
		ContractID: &contractID,
	}

	if err := r.Create(ctx, conv); err != nil {
		return nil, err
	}

	// Add participants
	r.AddParticipant(ctx, conv.ID, clientID)
	r.AddParticipant(ctx, conv.ID, freelancerID)

	return conv, nil
}

// Search conversations
func (r *ConversationRepository) Search(ctx context.Context, userID uuid.UUID, query string, limit, offset int) ([]domain.Conversation, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT DISTINCT c.id, c.job_id, c.proposal_id, c.contract_id, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id`

	countQuery := `
		SELECT COUNT(DISTINCT c.id)
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id`

	// User must be participant
	conditions = append(conditions, fmt.Sprintf("cp.user_id = $%d", argNum))
	args = append(args, userID)
	argNum++

	// Text search on related entities
	if query != "" {
		baseQuery += ` LEFT JOIN contracts ct ON c.contract_id = ct.id
		              LEFT JOIN jobs j ON c.job_id = j.id`
		countQuery += ` LEFT JOIN contracts ct ON c.contract_id = ct.id
		               LEFT JOIN jobs j ON c.job_id = j.id`
		conditions = append(conditions, fmt.Sprintf(`(
			ct.title ILIKE $%d OR
			j.title ILIKE $%d
		)`, argNum, argNum))
		args = append(args, "%"+query+"%")
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	var total int
	err := r.db.QueryRow(ctx, countQuery+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Add ordering and pagination
	fullQuery := baseQuery + whereClause + fmt.Sprintf(` ORDER BY c.updated_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fullQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var conversations []domain.Conversation
	for rows.Next() {
		var conv domain.Conversation
		if err := rows.Scan(
			&conv.ID, &conv.JobID, &conv.ProposalID,
			&conv.ContractID, &conv.CreatedAt, &conv.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		conversations = append(conversations, conv)
	}

	return conversations, total, rows.Err()
}

// MessageRepository implementation
type MessageRepository struct {
	db *pgxpool.Pool
}

func NewMessageRepository(db *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, message *domain.Message) error {
	query := `
		INSERT INTO messages (
			id, conversation_id, sender_id, message_text, message_type,
			is_edited, edited_at, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		)`

	message.ID = uuid.New()
	message.CreatedAt = time.Now()
	if message.MessageType == "" {
		message.MessageType = domain.MessageTypeText
	}

	_, err := r.db.Exec(ctx, query,
		message.ID, message.ConversationID, message.SenderID, message.MessageText,
		message.MessageType, message.IsEdited, message.EditedAt, message.CreatedAt,
	)

	if err == nil {
		// Update conversation updated_at
		r.db.Exec(ctx, `UPDATE conversations SET updated_at = $2 WHERE id = $1`,
			message.ConversationID, time.Now())
	}

	return err
}

func (r *MessageRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.message_text, m.message_type,
			   m.is_edited, m.edited_at, m.created_at,
			   u.username as sender_username
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.id = $1`

	message := &domain.Message{}
	var senderUsername string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&message.ID, &message.ConversationID, &message.SenderID, &message.MessageText,
		&message.MessageType, &message.IsEdited, &message.EditedAt, &message.CreatedAt,
		&senderUsername,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return message, err
}

func (r *MessageRepository) GetByConversationID(ctx context.Context, conversationID uuid.UUID, limit, offset int) ([]domain.Message, int, error) {
	countQuery := `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, conversationID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.message_text, m.message_type,
			   m.is_edited, m.edited_at, m.created_at,
			   u.username as sender_username
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, conversationID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var messages []domain.Message
	for rows.Next() {
		var msg domain.Message
		var senderUsername string
		if err := rows.Scan(
			&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.MessageText,
			&msg.MessageType, &msg.IsEdited, &msg.EditedAt, &msg.CreatedAt,
			&senderUsername,
		); err != nil {
			return nil, 0, err
		}
		messages = append(messages, msg)
	}

	return messages, total, rows.Err()
}

func (r *MessageRepository) Update(ctx context.Context, message *domain.Message) error {
	query := `
		UPDATE messages SET
			message_text = $2, is_edited = $3, edited_at = $4
		WHERE id = $1`

	now := time.Now()
	message.IsEdited = true
	message.EditedAt = &now

	result, err := r.db.Exec(ctx, query,
		message.ID, message.MessageText, message.IsEdited, message.EditedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *MessageRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM messages WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *MessageRepository) GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	// Count messages in conversations where user is participant
	// and message was sent after user's last_read_at
	query := `
		SELECT COUNT(m.id)
		FROM messages m
		JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
		WHERE cp.user_id = $1
		AND m.sender_id != $1
		AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)`

	var count int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

// GetLastMessage retrieves the most recent message for a conversation
func (r *MessageRepository) GetLastMessage(ctx context.Context, conversationID uuid.UUID) (*domain.Message, error) {
	query := `
		SELECT m.id, m.conversation_id, m.sender_id, m.message_text, m.message_type,
			   m.is_edited, m.edited_at, m.created_at
		FROM messages m
		WHERE m.conversation_id = $1
		ORDER BY m.created_at DESC
		LIMIT 1`

	message := &domain.Message{}
	err := r.db.QueryRow(ctx, query, conversationID).Scan(
		&message.ID, &message.ConversationID, &message.SenderID, &message.MessageText,
		&message.MessageType, &message.IsEdited, &message.EditedAt, &message.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil // No messages yet
	}
	return message, err
}

// CreateAttachment creates a new message attachment
func (r *MessageRepository) CreateAttachment(ctx context.Context, attachment *domain.MessageAttachment) error {
	query := `
		INSERT INTO message_attachments (
			id, message_id, file_name, file_url, file_type, file_size_bytes, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7
		)`

	attachment.ID = uuid.New()
	attachment.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		attachment.ID, attachment.MessageID, attachment.FileName, attachment.FileURL,
		attachment.FileType, attachment.FileSizeBytes, attachment.CreatedAt,
	)

	return err
}

// GetAttachmentsByMessageID retrieves all attachments for a message
func (r *MessageRepository) GetAttachmentsByMessageID(ctx context.Context, messageID uuid.UUID) ([]domain.MessageAttachment, error) {
	query := `
		SELECT id, message_id, file_name, file_url, file_type, file_size_bytes, created_at
		FROM message_attachments
		WHERE message_id = $1
		ORDER BY created_at ASC`

	rows, err := r.db.Query(ctx, query, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attachments []domain.MessageAttachment
	for rows.Next() {
		var att domain.MessageAttachment
		if err := rows.Scan(
			&att.ID, &att.MessageID, &att.FileName, &att.FileURL,
			&att.FileType, &att.FileSizeBytes, &att.CreatedAt,
		); err != nil {
			return nil, err
		}
		attachments = append(attachments, att)
	}

	return attachments, rows.Err()
}

// GetMessagesWithAttachments retrieves messages with their attachments
func (r *MessageRepository) GetByConversationIDWithAttachments(ctx context.Context, conversationID uuid.UUID, limit, offset int) ([]domain.Message, int, error) {
	messages, total, err := r.GetByConversationID(ctx, conversationID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// Fetch attachments for each message
	for i := range messages {
		attachments, err := r.GetAttachmentsByMessageID(ctx, messages[i].ID)
		if err != nil {
			return nil, 0, err
		}
		messages[i].Attachments = attachments
	}

	return messages, total, nil
}
