package domain

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	ContractID            uuid.UUID  `json:"contract_id" db:"contract_id"`
	ReviewerID            uuid.UUID  `json:"reviewer_id" db:"reviewer_id"`
	RevieweeID            uuid.UUID  `json:"reviewee_id" db:"reviewee_id"`
	OverallRating         int        `json:"overall_rating" db:"overall_rating"`
	CommunicationRating   *int       `json:"communication_rating" db:"communication_rating"`
	QualityRating         *int       `json:"quality_rating" db:"quality_rating"`
	ExpertiseRating       *int       `json:"expertise_rating" db:"expertise_rating"`
	ProfessionalismRating *int       `json:"professionalism_rating" db:"professionalism_rating"`
	WouldRecommend        *bool      `json:"would_recommend" db:"would_recommend"`
	ReviewText            *string    `json:"review_text" db:"review_text"`
	IsPublic              bool       `json:"is_public" db:"is_public"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	Reviewer *User     `json:"reviewer,omitempty" db:"-"`
	Reviewee *User     `json:"reviewee,omitempty" db:"-"`
	Contract *Contract `json:"contract,omitempty" db:"-"`
}

type Dispute struct {
	ID                   uuid.UUID        `json:"id" db:"id"`
	ContractID           uuid.UUID        `json:"contract_id" db:"contract_id"`
	MilestoneID          *uuid.UUID       `json:"milestone_id" db:"milestone_id"`
	InitiatedBy          uuid.UUID        `json:"initiated_by" db:"initiated_by"`
	Reason               string           `json:"reason" db:"reason"`
	Description          string           `json:"description" db:"description"`
	EvidenceURLs         []string         `json:"evidence_urls" db:"evidence_urls"`
	Status               string           `json:"status" db:"status"`
	ResolvedBy           *uuid.UUID       `json:"resolved_by" db:"resolved_by"`
	ResolutionType       *string          `json:"resolution_type" db:"resolution_type"`
	ResolutionNotes      *string          `json:"resolution_notes" db:"resolution_notes"`
	ClientRefundSOL      *string          `json:"client_refund_sol" db:"client_refund_sol"`
	FreelancerPaymentSOL *string          `json:"freelancer_payment_sol" db:"freelancer_payment_sol"`
	CreatedAt            time.Time        `json:"created_at" db:"created_at"`
	ResolvedAt           *time.Time       `json:"resolved_at" db:"resolved_at"`

	// Joined fields
	Contract  *Contract `json:"contract,omitempty" db:"-"`
	Milestone *Milestone `json:"milestone,omitempty" db:"-"`
	Initiator *User     `json:"initiator,omitempty" db:"-"`
}

type Notification struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	UserID     uuid.UUID  `json:"user_id" db:"user_id"`
	Type       string     `json:"type" db:"type"`
	Title      string     `json:"title" db:"title"`
	Message    *string    `json:"message" db:"message"`
	JobID      *uuid.UUID `json:"job_id" db:"job_id"`
	ProposalID *uuid.UUID `json:"proposal_id" db:"proposal_id"`
	ContractID *uuid.UUID `json:"contract_id" db:"contract_id"`
	PaymentID  *uuid.UUID `json:"payment_id" db:"payment_id"`
	IsRead     bool       `json:"is_read" db:"is_read"`
	ReadAt     *time.Time `json:"read_at" db:"read_at"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}

// Dispute reason constants
const (
	DisputeReasonQualityIssue       = "quality_issue"
	DisputeReasonNonDelivery        = "non_delivery"
	DisputeReasonScopeDisagreement  = "scope_disagreement"
	DisputeReasonPaymentIssue       = "payment_issue"
	DisputeReasonOther              = "other"
)

// Dispute status constants
const (
	DisputeStatusOpen        = "open"
	DisputeStatusUnderReview = "under_review"
	DisputeStatusResolved    = "resolved"
	DisputeStatusEscalated   = "escalated"
	DisputeStatusClosed      = "closed"
)

// Resolution type constants
const (
	ResolutionTypeFullRefund          = "full_refund"
	ResolutionTypePartialRefund       = "partial_refund"
	ResolutionTypeReleaseToFreelancer = "release_to_freelancer"
	ResolutionTypeSplit               = "split"
)

// Notification type constants
const (
	NotificationTypeNewProposal       = "new_proposal"
	NotificationTypeProposalAccepted  = "proposal_accepted"
	NotificationTypeMilestoneSubmitted = "milestone_submitted"
	NotificationTypePaymentReceived   = "payment_received"
	NotificationTypeNewMessage        = "new_message"
	NotificationTypeContractStarted   = "contract_started"
	NotificationTypeContractCompleted = "contract_completed"
	NotificationTypeDisputeOpened     = "dispute_opened"
	NotificationTypeDisputeResolved   = "dispute_resolved"
	NotificationTypeNewReview         = "new_review"
)
