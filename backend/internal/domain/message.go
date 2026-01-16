package domain

import (
	"time"

	"github.com/google/uuid"
)

type Conversation struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	JobID      *uuid.UUID `json:"job_id" db:"job_id"`
	ProposalID *uuid.UUID `json:"proposal_id" db:"proposal_id"`
	ContractID *uuid.UUID `json:"contract_id" db:"contract_id"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	Participants []ConversationParticipant `json:"participants,omitempty" db:"-"`
	LastMessage  *Message                  `json:"last_message,omitempty" db:"-"`
	UnreadCount  int                       `json:"unread_count" db:"-"`
}

type ConversationParticipant struct {
	ConversationID uuid.UUID  `json:"conversation_id" db:"conversation_id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	LastReadAt     *time.Time `json:"last_read_at" db:"last_read_at"`
	IsMuted        bool       `json:"is_muted" db:"is_muted"`

	// Joined fields
	User *User `json:"user,omitempty" db:"-"`
}

type Message struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	ConversationID uuid.UUID  `json:"conversation_id" db:"conversation_id"`
	SenderID       uuid.UUID  `json:"sender_id" db:"sender_id"`
	MessageText    string     `json:"message_text" db:"message_text"`
	MessageType    string     `json:"message_type" db:"message_type"`
	IsEdited       bool       `json:"is_edited" db:"is_edited"`
	EditedAt       *time.Time `json:"edited_at" db:"edited_at"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`

	// Joined fields
	Sender      *User               `json:"sender,omitempty" db:"-"`
	Attachments []MessageAttachment `json:"attachments,omitempty" db:"-"`
}

type MessageAttachment struct {
	ID            uuid.UUID `json:"id" db:"id"`
	MessageID     uuid.UUID `json:"message_id" db:"message_id"`
	FileName      string    `json:"file_name" db:"file_name"`
	FileURL       string    `json:"file_url" db:"file_url"`
	FileType      *string   `json:"file_type" db:"file_type"`
	FileSizeBytes *int64    `json:"file_size_bytes" db:"file_size_bytes"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

// Message type constants
const (
	MessageTypeText            = "text"
	MessageTypeSystem          = "system"
	MessageTypeMilestoneUpdate = "milestone_update"
)
