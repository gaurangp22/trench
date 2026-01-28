package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/shopspring/decimal"
)

// Service represents a freelancer-created gig/service offering
type Service struct {
	ID           uuid.UUID `json:"id" db:"id"`
	FreelancerID uuid.UUID `json:"freelancer_id" db:"freelancer_id"`
	Title        string    `json:"title" db:"title"`
	Description  string    `json:"description" db:"description"`
	CategoryID   *int      `json:"category_id" db:"category_id"`

	// Basic package tier
	BasicPriceSOL       *decimal.Decimal `json:"basic_price_sol" db:"basic_price_sol"`
	BasicDescription    *string          `json:"basic_description" db:"basic_description"`
	BasicDeliveryDays   *int             `json:"basic_delivery_days" db:"basic_delivery_days"`
	BasicRevisions      *int             `json:"basic_revisions" db:"basic_revisions"`

	// Standard package tier
	StandardPriceSOL     *decimal.Decimal `json:"standard_price_sol" db:"standard_price_sol"`
	StandardDescription  *string          `json:"standard_description" db:"standard_description"`
	StandardDeliveryDays *int             `json:"standard_delivery_days" db:"standard_delivery_days"`
	StandardRevisions    *int             `json:"standard_revisions" db:"standard_revisions"`

	// Premium package tier
	PremiumPriceSOL     *decimal.Decimal `json:"premium_price_sol" db:"premium_price_sol"`
	PremiumDescription  *string          `json:"premium_description" db:"premium_description"`
	PremiumDeliveryDays *int             `json:"premium_delivery_days" db:"premium_delivery_days"`
	PremiumRevisions    *int             `json:"premium_revisions" db:"premium_revisions"`

	// Metadata
	Status       string         `json:"status" db:"status"`
	Visibility   string         `json:"visibility" db:"visibility"`
	ThumbnailURL *string        `json:"thumbnail_url" db:"thumbnail_url"`
	GalleryURLs  pq.StringArray `json:"gallery_urls" db:"gallery_urls"`

	// Statistics
	ViewsCount    int             `json:"views_count" db:"views_count"`
	OrdersCount   int             `json:"orders_count" db:"orders_count"`
	AverageRating decimal.Decimal `json:"average_rating" db:"average_rating"`
	TotalReviews  int             `json:"total_reviews" db:"total_reviews"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	Skills     []Skill      `json:"skills,omitempty" db:"-"`
	Freelancer *User        `json:"freelancer,omitempty" db:"-"`
	Profile    *Profile     `json:"profile,omitempty" db:"-"`
	Category   *JobCategory `json:"category,omitempty" db:"-"`
	FAQs       []ServiceFAQ `json:"faqs,omitempty" db:"-"`
}

// ServiceSkill represents the many-to-many relationship between services and skills
type ServiceSkill struct {
	ServiceID uuid.UUID `json:"service_id" db:"service_id"`
	SkillID   int       `json:"skill_id" db:"skill_id"`
}

// ServiceFAQ represents a FAQ item for a service
type ServiceFAQ struct {
	ID        uuid.UUID `json:"id" db:"id"`
	ServiceID uuid.UUID `json:"service_id" db:"service_id"`
	Question  string    `json:"question" db:"question"`
	Answer    string    `json:"answer" db:"answer"`
	SortOrder int       `json:"sort_order" db:"sort_order"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ServiceOrder represents a client's purchase of a service
type ServiceOrder struct {
	ID           uuid.UUID `json:"id" db:"id"`
	ServiceID    uuid.UUID `json:"service_id" db:"service_id"`
	ClientID     uuid.UUID `json:"client_id" db:"client_id"`
	FreelancerID uuid.UUID `json:"freelancer_id" db:"freelancer_id"`

	// Selected package
	PackageTier      string          `json:"package_tier" db:"package_tier"`
	PriceSOL         decimal.Decimal `json:"price_sol" db:"price_sol"`
	DeliveryDays     int             `json:"delivery_days" db:"delivery_days"`
	RevisionsAllowed int             `json:"revisions_allowed" db:"revisions_allowed"`
	RevisionsUsed    int             `json:"revisions_used" db:"revisions_used"`

	// Custom requirements from client
	Requirements *string `json:"requirements" db:"requirements"`

	// Status tracking
	Status string `json:"status" db:"status"`

	// Timeline
	StartedAt          *time.Time `json:"started_at" db:"started_at"`
	ExpectedDeliveryAt *time.Time `json:"expected_delivery_at" db:"expected_delivery_at"`
	DeliveredAt        *time.Time `json:"delivered_at" db:"delivered_at"`
	CompletedAt        *time.Time `json:"completed_at" db:"completed_at"`

	// Escrow integration
	EscrowAccountAddress *string `json:"escrow_account_address" db:"escrow_account_address"`
	EscrowFunded         bool    `json:"escrow_funded" db:"escrow_funded"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	Service    *Service `json:"service,omitempty" db:"-"`
	Client     *User    `json:"client,omitempty" db:"-"`
	Freelancer *User    `json:"freelancer,omitempty" db:"-"`
	Profile    *Profile `json:"client_profile,omitempty" db:"-"`
}

// ServiceOrderMessage represents a message within a service order
type ServiceOrderMessage struct {
	ID             uuid.UUID      `json:"id" db:"id"`
	OrderID        uuid.UUID      `json:"order_id" db:"order_id"`
	SenderID       uuid.UUID      `json:"sender_id" db:"sender_id"`
	MessageText    string         `json:"message_text" db:"message_text"`
	AttachmentURLs pq.StringArray `json:"attachment_urls" db:"attachment_urls"`
	MessageType    string         `json:"message_type" db:"message_type"`
	CreatedAt      time.Time      `json:"created_at" db:"created_at"`

	// Joined fields
	Sender *User `json:"sender,omitempty" db:"-"`
}

// ServiceReview represents a client's review of a completed service order
type ServiceReview struct {
	ID         uuid.UUID `json:"id" db:"id"`
	OrderID    uuid.UUID `json:"order_id" db:"order_id"`
	ServiceID  uuid.UUID `json:"service_id" db:"service_id"`
	ReviewerID uuid.UUID `json:"reviewer_id" db:"reviewer_id"`
	Rating     int       `json:"rating" db:"rating"`
	ReviewText *string   `json:"review_text" db:"review_text"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`

	// Joined fields
	Reviewer *User `json:"reviewer,omitempty" db:"-"`
}

// Service status constants
const (
	ServiceStatusDraft    = "draft"
	ServiceStatusActive   = "active"
	ServiceStatusPaused   = "paused"
	ServiceStatusArchived = "archived"
)

// Service order status constants
const (
	ServiceOrderStatusPending           = "pending"
	ServiceOrderStatusActive            = "active"
	ServiceOrderStatusDelivered         = "delivered"
	ServiceOrderStatusRevisionRequested = "revision_requested"
	ServiceOrderStatusCompleted         = "completed"
	ServiceOrderStatusCancelled         = "cancelled"
	ServiceOrderStatusDisputed          = "disputed"
)

// Package tier constants
const (
	PackageTierBasic    = "basic"
	PackageTierStandard = "standard"
	PackageTierPremium  = "premium"
)

// Service order message type constants
const (
	OrderMessageTypeText            = "text"
	OrderMessageTypeDelivery        = "delivery"
	OrderMessageTypeRevisionRequest = "revision_request"
	OrderMessageTypeSystem          = "system"
)
