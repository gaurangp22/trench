package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/repository"
)

type NotificationService struct {
	notificationRepo repository.NotificationRepository
}

func NewNotificationService(notificationRepo repository.NotificationRepository) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
	}
}

type NotificationResponse struct {
	ID         uuid.UUID  `json:"id"`
	Type       string     `json:"type"`
	Title      string     `json:"title"`
	Message    *string    `json:"message,omitempty"`
	JobID      *uuid.UUID `json:"job_id,omitempty"`
	ProposalID *uuid.UUID `json:"proposal_id,omitempty"`
	ContractID *uuid.UUID `json:"contract_id,omitempty"`
	PaymentID  *uuid.UUID `json:"payment_id,omitempty"`
	IsRead     bool       `json:"is_read"`
	ReadAt     *string    `json:"read_at,omitempty"`
	CreatedAt  string     `json:"created_at"`
}

func (s *NotificationService) GetNotifications(ctx context.Context, userID uuid.UUID, unreadOnly bool, limit, offset int) ([]NotificationResponse, int, error) {
	notifications, total, err := s.notificationRepo.GetByUserID(ctx, userID, unreadOnly, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]NotificationResponse, len(notifications))
	for i, n := range notifications {
		responses[i] = s.toNotificationResponse(&n)
	}
	return responses, total, nil
}

func (s *NotificationService) MarkAsRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	return s.notificationRepo.MarkAsRead(ctx, notificationID)
}

func (s *NotificationService) MarkAllAsRead(ctx context.Context, userID uuid.UUID) error {
	return s.notificationRepo.MarkAllAsRead(ctx, userID)
}

func (s *NotificationService) GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	return s.notificationRepo.GetUnreadCount(ctx, userID)
}

// Helper methods to create notifications for various events

func (s *NotificationService) NotifyNewProposal(ctx context.Context, clientID, jobID, proposalID uuid.UUID, freelancerName, jobTitle string) error {
	notification := &domain.Notification{
		UserID:     clientID,
		Type:       domain.NotificationTypeNewProposal,
		Title:      "New Proposal Received",
		Message:    stringPtr(freelancerName + " submitted a proposal for \"" + jobTitle + "\""),
		JobID:      &jobID,
		ProposalID: &proposalID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyProposalAccepted(ctx context.Context, freelancerID, jobID, proposalID uuid.UUID, jobTitle string) error {
	notification := &domain.Notification{
		UserID:     freelancerID,
		Type:       domain.NotificationTypeProposalAccepted,
		Title:      "Proposal Accepted!",
		Message:    stringPtr("Your proposal for \"" + jobTitle + "\" has been accepted"),
		JobID:      &jobID,
		ProposalID: &proposalID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyContractStarted(ctx context.Context, userID, contractID uuid.UUID, otherPartyName string) error {
	notification := &domain.Notification{
		UserID:     userID,
		Type:       domain.NotificationTypeContractStarted,
		Title:      "Contract Started",
		Message:    stringPtr("Your contract with " + otherPartyName + " has begun"),
		ContractID: &contractID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyMilestoneSubmitted(ctx context.Context, clientID, contractID uuid.UUID, milestoneName string) error {
	notification := &domain.Notification{
		UserID:     clientID,
		Type:       domain.NotificationTypeMilestoneSubmitted,
		Title:      "Milestone Ready for Review",
		Message:    stringPtr("The milestone \"" + milestoneName + "\" has been submitted for your approval"),
		ContractID: &contractID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyPaymentReceived(ctx context.Context, freelancerID, contractID, paymentID uuid.UUID, amount string) error {
	notification := &domain.Notification{
		UserID:     freelancerID,
		Type:       domain.NotificationTypePaymentReceived,
		Title:      "Payment Received",
		Message:    stringPtr("You received " + amount + " SOL for completed work"),
		ContractID: &contractID,
		PaymentID:  &paymentID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyContractCompleted(ctx context.Context, userID, contractID uuid.UUID) error {
	notification := &domain.Notification{
		UserID:     userID,
		Type:       domain.NotificationTypeContractCompleted,
		Title:      "Contract Completed",
		Message:    stringPtr("The contract has been successfully completed"),
		ContractID: &contractID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyNewMessage(ctx context.Context, userID uuid.UUID, senderName string) error {
	notification := &domain.Notification{
		UserID:  userID,
		Type:    domain.NotificationTypeNewMessage,
		Title:   "New Message",
		Message: stringPtr("You have a new message from " + senderName),
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyDisputeOpened(ctx context.Context, userID, contractID uuid.UUID) error {
	notification := &domain.Notification{
		UserID:     userID,
		Type:       domain.NotificationTypeDisputeOpened,
		Title:      "Dispute Opened",
		Message:    stringPtr("A dispute has been opened on your contract"),
		ContractID: &contractID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) NotifyDisputeResolved(ctx context.Context, userID, contractID uuid.UUID, resolution string) error {
	notification := &domain.Notification{
		UserID:     userID,
		Type:       domain.NotificationTypeDisputeResolved,
		Title:      "Dispute Resolved",
		Message:    stringPtr("The dispute has been resolved: " + resolution),
		ContractID: &contractID,
	}
	return s.notificationRepo.Create(ctx, notification)
}

func (s *NotificationService) toNotificationResponse(n *domain.Notification) NotificationResponse {
	resp := NotificationResponse{
		ID:         n.ID,
		Type:       n.Type,
		Title:      n.Title,
		Message:    n.Message,
		JobID:      n.JobID,
		ProposalID: n.ProposalID,
		ContractID: n.ContractID,
		PaymentID:  n.PaymentID,
		IsRead:     n.IsRead,
		CreatedAt:  n.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
	if n.ReadAt != nil {
		readAt := n.ReadAt.Format("2006-01-02T15:04:05Z")
		resp.ReadAt = &readAt
	}
	return resp
}
