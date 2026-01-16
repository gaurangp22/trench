package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type JobCategory struct {
	ID        int     `json:"id" db:"id"`
	Name      string  `json:"name" db:"name"`
	Slug      string  `json:"slug" db:"slug"`
	ParentID  *int    `json:"parent_id" db:"parent_id"`
	Icon      *string `json:"icon" db:"icon"`
	SortOrder int     `json:"sort_order" db:"sort_order"`
}

type Job struct {
	ID               uuid.UUID        `json:"id" db:"id"`
	ClientID         uuid.UUID        `json:"client_id" db:"client_id"`
	Title            string           `json:"title" db:"title"`
	Description      string           `json:"description" db:"description"`
	CategoryID       *int             `json:"category_id" db:"category_id"`
	PaymentType      string           `json:"payment_type" db:"payment_type"`
	BudgetMinSOL     *decimal.Decimal `json:"budget_min_sol" db:"budget_min_sol"`
	BudgetMaxSOL     *decimal.Decimal `json:"budget_max_sol" db:"budget_max_sol"`
	HourlyRateMinSOL *decimal.Decimal `json:"hourly_rate_min_sol" db:"hourly_rate_min_sol"`
	HourlyRateMaxSOL *decimal.Decimal `json:"hourly_rate_max_sol" db:"hourly_rate_max_sol"`
	ExpectedDuration *string          `json:"expected_duration" db:"expected_duration"`
	Complexity       *string          `json:"complexity" db:"complexity"`
	Visibility       string           `json:"visibility" db:"visibility"`
	Status           string           `json:"status" db:"status"`
	ProposalCount    int              `json:"proposal_count" db:"proposal_count"`
	ViewsCount       int              `json:"views_count" db:"views_count"`
	PostedAt         *time.Time       `json:"posted_at" db:"posted_at"`
	ExpiresAt        *time.Time       `json:"expires_at" db:"expires_at"`
	CreatedAt        time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at" db:"updated_at"`

	// Joined fields
	Skills   []Skill `json:"skills,omitempty" db:"-"`
	Client   *User   `json:"client,omitempty" db:"-"`
	Category *JobCategory `json:"category,omitempty" db:"-"`
}

type JobSkill struct {
	JobID      uuid.UUID `json:"job_id" db:"job_id"`
	SkillID    int       `json:"skill_id" db:"skill_id"`
	IsRequired bool      `json:"is_required" db:"is_required"`
}

type JobAttachment struct {
	ID            uuid.UUID `json:"id" db:"id"`
	JobID         uuid.UUID `json:"job_id" db:"job_id"`
	FileName      string    `json:"file_name" db:"file_name"`
	FileURL       string    `json:"file_url" db:"file_url"`
	FileType      *string   `json:"file_type" db:"file_type"`
	FileSizeBytes *int64    `json:"file_size_bytes" db:"file_size_bytes"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type JobScreeningQuestion struct {
	ID         uuid.UUID `json:"id" db:"id"`
	JobID      uuid.UUID `json:"job_id" db:"job_id"`
	Question   string    `json:"question" db:"question"`
	IsRequired bool      `json:"is_required" db:"is_required"`
	SortOrder  int       `json:"sort_order" db:"sort_order"`
}

type SavedJob struct {
	UserID  uuid.UUID `json:"user_id" db:"user_id"`
	JobID   uuid.UUID `json:"job_id" db:"job_id"`
	SavedAt time.Time `json:"saved_at" db:"saved_at"`
}

// Payment type constants
const (
	PaymentTypeFixed  = "fixed"
	PaymentTypeHourly = "hourly"
)

// Job visibility constants
const (
	VisibilityPublic     = "public"
	VisibilityPrivate    = "private"
	VisibilityInviteOnly = "invite_only"
)

// Job status constants
const (
	JobStatusDraft      = "draft"
	JobStatusOpen       = "open"
	JobStatusInProgress = "in_progress"
	JobStatusCompleted  = "completed"
	JobStatusCancelled  = "cancelled"
	JobStatusClosed     = "closed"
)

// Duration constants
const (
	DurationLessThanWeek = "less_than_week"
	Duration1To2Weeks    = "1_to_2_weeks"
	Duration1Month       = "1_month"
	Duration1To3Months   = "1_to_3_months"
	Duration3To6Months   = "3_to_6_months"
	DurationMoreThan6Months = "more_than_6_months"
)

// Complexity constants
const (
	ComplexityEasy         = "easy"
	ComplexityIntermediate = "intermediate"
	ComplexityExpert       = "expert"
)
