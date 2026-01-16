package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Proposal struct {
	ID                uuid.UUID        `json:"id" db:"id"`
	JobID             uuid.UUID        `json:"job_id" db:"job_id"`
	FreelancerID      uuid.UUID        `json:"freelancer_id" db:"freelancer_id"`
	CoverLetter       string           `json:"cover_letter" db:"cover_letter"`
	ProposedRateSOL   *decimal.Decimal `json:"proposed_rate_sol" db:"proposed_rate_sol"`
	ProposedAmountSOL *decimal.Decimal `json:"proposed_amount_sol" db:"proposed_amount_sol"`
	EstimatedDuration *string          `json:"estimated_duration" db:"estimated_duration"`
	Status            string           `json:"status" db:"status"`
	ClientRating      *int             `json:"client_rating" db:"client_rating"`
	ClientNotes       *string          `json:"-" db:"client_notes"`
	SubmittedAt       time.Time        `json:"submitted_at" db:"submitted_at"`
	ViewedAt          *time.Time       `json:"viewed_at" db:"viewed_at"`
	UpdatedAt         time.Time        `json:"updated_at" db:"updated_at"`

	// Joined fields
	Job        *Job     `json:"job,omitempty" db:"-"`
	Freelancer *User    `json:"freelancer,omitempty" db:"-"`
	Profile    *Profile `json:"profile,omitempty" db:"-"`
	Milestones []ProposalMilestone `json:"milestones,omitempty" db:"-"`
}

type ProposalScreeningAnswer struct {
	ID         uuid.UUID `json:"id" db:"id"`
	ProposalID uuid.UUID `json:"proposal_id" db:"proposal_id"`
	QuestionID uuid.UUID `json:"question_id" db:"question_id"`
	Answer     string    `json:"answer" db:"answer"`
}

type ProposalMilestone struct {
	ID            uuid.UUID       `json:"id" db:"id"`
	ProposalID    uuid.UUID       `json:"proposal_id" db:"proposal_id"`
	Title         string          `json:"title" db:"title"`
	Description   *string         `json:"description" db:"description"`
	AmountSOL     decimal.Decimal `json:"amount_sol" db:"amount_sol"`
	EstimatedDays *int            `json:"estimated_days" db:"estimated_days"`
	SortOrder     int             `json:"sort_order" db:"sort_order"`
}

// Proposal status constants
const (
	ProposalStatusSubmitted   = "submitted"
	ProposalStatusViewed      = "viewed"
	ProposalStatusShortlisted = "shortlisted"
	ProposalStatusInterview   = "interview"
	ProposalStatusAccepted    = "accepted"
	ProposalStatusRejected    = "rejected"
	ProposalStatusWithdrawn   = "withdrawn"
)
