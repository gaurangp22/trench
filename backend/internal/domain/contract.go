package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Contract struct {
	ID                   uuid.UUID       `json:"id" db:"id"`
	ProposalID           *uuid.UUID      `json:"proposal_id" db:"proposal_id"`
	JobID                uuid.UUID       `json:"job_id" db:"job_id"`
	ClientID             uuid.UUID       `json:"client_id" db:"client_id"`
	FreelancerID         uuid.UUID       `json:"freelancer_id" db:"freelancer_id"`
	Title                string          `json:"title" db:"title"`
	Description          *string         `json:"description" db:"description"`
	PaymentType          string          `json:"payment_type" db:"payment_type"`
	TotalAmountSOL       decimal.Decimal `json:"total_amount_sol" db:"total_amount_sol"`
	HourlyRateSOL        *decimal.Decimal `json:"hourly_rate_sol" db:"hourly_rate_sol"`
	WeeklyHourLimit      *int            `json:"weekly_hour_limit" db:"weekly_hour_limit"`
	EscrowAccountAddress *string         `json:"escrow_account_address" db:"escrow_account_address"`
	EscrowAmountSOL      decimal.Decimal `json:"escrow_amount_sol" db:"escrow_amount_sol"`
	ReleasedAmountSOL    decimal.Decimal `json:"released_amount_sol" db:"released_amount_sol"`
	Status               string          `json:"status" db:"status"`
	StartedAt            *time.Time      `json:"started_at" db:"started_at"`
	EndedAt              *time.Time      `json:"ended_at" db:"ended_at"`
	CreatedAt            time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at" db:"updated_at"`

	// Joined fields
	Job        *Job        `json:"job,omitempty" db:"-"`
	Client     *User       `json:"client,omitempty" db:"-"`
	Freelancer *User       `json:"freelancer,omitempty" db:"-"`
	Milestones []Milestone `json:"milestones,omitempty" db:"-"`
	Escrow     *Escrow     `json:"escrow,omitempty" db:"-"`
}

type Milestone struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	ContractID     uuid.UUID       `json:"contract_id" db:"contract_id"`
	Title          string          `json:"title" db:"title"`
	Description    *string         `json:"description" db:"description"`
	AmountSOL      decimal.Decimal `json:"amount_sol" db:"amount_sol"`
	DueDate        *time.Time      `json:"due_date" db:"due_date"`
	SortOrder      int             `json:"sort_order" db:"sort_order"`
	Status         string          `json:"status" db:"status"`
	SubmissionText *string         `json:"submission_text" db:"submission_text"`
	SubmissionURLs []string        `json:"submission_urls" db:"submission_urls"`
	SubmittedAt    *time.Time      `json:"submitted_at" db:"submitted_at"`
	ApprovedAt     *time.Time      `json:"approved_at" db:"approved_at"`
	PaymentID      *uuid.UUID      `json:"payment_id" db:"payment_id"`
	PaidAt         *time.Time      `json:"paid_at" db:"paid_at"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at" db:"updated_at"`
}

type MilestoneRevision struct {
	ID            uuid.UUID `json:"id" db:"id"`
	MilestoneID   uuid.UUID `json:"milestone_id" db:"milestone_id"`
	RequestedBy   uuid.UUID `json:"requested_by" db:"requested_by"`
	RevisionNotes string    `json:"revision_notes" db:"revision_notes"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

// Contract status constants
const (
	ContractStatusPending   = "pending"
	ContractStatusActive    = "active"
	ContractStatusPaused    = "paused"
	ContractStatusCompleted = "completed"
	ContractStatusCancelled = "cancelled"
	ContractStatusDisputed  = "disputed"
)

// Milestone status constants
const (
	MilestoneStatusPending           = "pending"
	MilestoneStatusInProgress        = "in_progress"
	MilestoneStatusSubmitted         = "submitted"
	MilestoneStatusRevisionRequested = "revision_requested"
	MilestoneStatusApproved          = "approved"
	MilestoneStatusPaid              = "paid"
	MilestoneStatusCancelled         = "cancelled"
)
