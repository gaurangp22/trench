package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Profile struct {
	ID                  uuid.UUID       `json:"id" db:"id"`
	UserID              uuid.UUID       `json:"user_id" db:"user_id"`
	DisplayName         *string         `json:"display_name" db:"display_name"`
	ProfessionalTitle   *string         `json:"professional_title" db:"professional_title"`
	AvatarURL           *string         `json:"avatar_url" db:"avatar_url"`
	CoverImageURL       *string         `json:"cover_image_url" db:"cover_image_url"`
	Overview            *string         `json:"overview" db:"overview"`
	Country             *string         `json:"country" db:"country"`
	City                *string         `json:"city" db:"city"`
	Timezone            *string         `json:"timezone" db:"timezone"`
	HourlyRateSOL       *decimal.Decimal `json:"hourly_rate_sol" db:"hourly_rate_sol"`
	MinimumProjectSOL   *decimal.Decimal `json:"minimum_project_sol" db:"minimum_project_sol"`
	TotalJobsCompleted  int             `json:"total_jobs_completed" db:"total_jobs_completed"`
	TotalEarningsSOL    decimal.Decimal `json:"total_earnings_sol" db:"total_earnings_sol"`
	AverageRating       decimal.Decimal `json:"average_rating" db:"average_rating"`
	TotalReviews        int             `json:"total_reviews" db:"total_reviews"`
	AvailableForHire    bool            `json:"available_for_hire" db:"available_for_hire"`
	AvailabilityStatus  string          `json:"availability_status" db:"availability_status"`
	CreatedAt           time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at" db:"updated_at"`
}

type Skill struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Slug      string    `json:"slug" db:"slug"`
	Category  *string   `json:"category" db:"category"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type ProfileSkill struct {
	ProfileID        uuid.UUID `json:"profile_id" db:"profile_id"`
	SkillID          int       `json:"skill_id" db:"skill_id"`
	YearsExperience  *int      `json:"years_experience" db:"years_experience"`
	ProficiencyLevel *string   `json:"proficiency_level" db:"proficiency_level"`
}

type PortfolioItem struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	ProfileID      uuid.UUID  `json:"profile_id" db:"profile_id"`
	Title          string     `json:"title" db:"title"`
	Description    *string    `json:"description" db:"description"`
	ProjectURL     *string    `json:"project_url" db:"project_url"`
	ImageURLs      []string   `json:"image_urls" db:"image_urls"`
	SkillsUsed     []int      `json:"skills_used" db:"skills_used"`
	CompletionDate *time.Time `json:"completion_date" db:"completion_date"`
	SortOrder      int        `json:"sort_order" db:"sort_order"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
}

type Certification struct {
	ID                  uuid.UUID  `json:"id" db:"id"`
	ProfileID           uuid.UUID  `json:"profile_id" db:"profile_id"`
	Name                string     `json:"name" db:"name"`
	IssuingOrganization *string    `json:"issuing_organization" db:"issuing_organization"`
	IssueDate           *time.Time `json:"issue_date" db:"issue_date"`
	ExpiryDate          *time.Time `json:"expiry_date" db:"expiry_date"`
	CredentialURL       *string    `json:"credential_url" db:"credential_url"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
}

type Language struct {
	ID   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Code string `json:"code" db:"code"`
}

type ProfileLanguage struct {
	ProfileID   uuid.UUID `json:"profile_id" db:"profile_id"`
	LanguageID  int       `json:"language_id" db:"language_id"`
	Proficiency string    `json:"proficiency" db:"proficiency"`
}

// Availability status constants
const (
	AvailabilityAvailable    = "available"
	AvailabilityBusy         = "busy"
	AvailabilityNotAvailable = "not_available"
)

// Proficiency level constants
const (
	ProficiencyBeginner     = "beginner"
	ProficiencyIntermediate = "intermediate"
	ProficiencyExpert       = "expert"
)

// Language proficiency constants
const (
	LangProficiencyBasic         = "basic"
	LangProficiencyConversational = "conversational"
	LangProficiencyFluent        = "fluent"
	LangProficiencyNative        = "native"
)
