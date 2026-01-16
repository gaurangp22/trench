package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/repository"
)

type ReviewService struct {
	reviewRepo       repository.ReviewRepository
	notificationRepo repository.NotificationRepository
	contractRepo     repository.ContractRepository
	userRepo         repository.UserRepository
}

func NewReviewService(
	reviewRepo repository.ReviewRepository,
	notificationRepo repository.NotificationRepository,
	contractRepo repository.ContractRepository,
	userRepo repository.UserRepository,
) *ReviewService {
	return &ReviewService{
		reviewRepo:       reviewRepo,
		notificationRepo: notificationRepo,
		contractRepo:     contractRepo,
		userRepo:         userRepo,
	}
}

type CreateReviewRequest struct {
	ContractID            uuid.UUID `json:"contract_id"`
	OverallRating         int       `json:"overall_rating"`
	CommunicationRating   *int      `json:"communication_rating,omitempty"`
	QualityRating         *int      `json:"quality_rating,omitempty"`
	ExpertiseRating       *int      `json:"expertise_rating,omitempty"`
	ProfessionalismRating *int      `json:"professionalism_rating,omitempty"`
	WouldRecommend        *bool     `json:"would_recommend,omitempty"`
	ReviewText            *string   `json:"review_text,omitempty"`
	IsPublic              bool      `json:"is_public"`
}

type ReviewResponse struct {
	ID                    uuid.UUID  `json:"id"`
	ContractID            uuid.UUID  `json:"contract_id"`
	ReviewerID            uuid.UUID  `json:"reviewer_id"`
	RevieweeID            uuid.UUID  `json:"reviewee_id"`
	OverallRating         int        `json:"overall_rating"`
	CommunicationRating   *int       `json:"communication_rating,omitempty"`
	QualityRating         *int       `json:"quality_rating,omitempty"`
	ExpertiseRating       *int       `json:"expertise_rating,omitempty"`
	ProfessionalismRating *int       `json:"professionalism_rating,omitempty"`
	WouldRecommend        *bool      `json:"would_recommend,omitempty"`
	ReviewText            *string    `json:"review_text,omitempty"`
	IsPublic              bool       `json:"is_public"`
	CreatedAt             string     `json:"created_at"`
	ReviewerUsername      string     `json:"reviewer_username,omitempty"`
}

func (s *ReviewService) CreateReview(ctx context.Context, reviewerID uuid.UUID, req CreateReviewRequest) (*ReviewResponse, error) {
	// Validate rating
	if req.OverallRating < 1 || req.OverallRating > 5 {
		return nil, errors.New("overall rating must be between 1 and 5")
	}

	// Get the contract
	contract, err := s.contractRepo.GetByID(ctx, req.ContractID)
	if err != nil {
		return nil, errors.New("contract not found")
	}

	// Contract must be completed to leave a review
	if contract.Status != domain.ContractStatusCompleted {
		return nil, errors.New("can only review completed contracts")
	}

	// Determine reviewee based on reviewer role
	var revieweeID uuid.UUID
	if reviewerID == contract.ClientID {
		revieweeID = contract.FreelancerID
	} else if reviewerID == contract.FreelancerID {
		revieweeID = contract.ClientID
	} else {
		return nil, errors.New("only contract participants can leave reviews")
	}

	// Check if user already reviewed this contract
	exists, err := s.reviewRepo.Exists(ctx, req.ContractID, reviewerID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("you have already reviewed this contract")
	}

	review := &domain.Review{
		ContractID:            req.ContractID,
		ReviewerID:            reviewerID,
		RevieweeID:            revieweeID,
		OverallRating:         req.OverallRating,
		CommunicationRating:   req.CommunicationRating,
		QualityRating:         req.QualityRating,
		ExpertiseRating:       req.ExpertiseRating,
		ProfessionalismRating: req.ProfessionalismRating,
		WouldRecommend:        req.WouldRecommend,
		ReviewText:            req.ReviewText,
		IsPublic:              req.IsPublic,
	}

	if err := s.reviewRepo.Create(ctx, review); err != nil {
		return nil, err
	}

	// Send notification to reviewee
	reviewer, _ := s.userRepo.GetByID(ctx, reviewerID)
	reviewerName := "Someone"
	if reviewer != nil {
		reviewerName = reviewer.Username
	}

	notification := &domain.Notification{
		UserID:     revieweeID,
		Type:       domain.NotificationTypeNewReview,
		Title:      "New Review Received",
		Message:    stringPtr(reviewerName + " left you a " + ratingStars(req.OverallRating) + " review"),
		ContractID: &req.ContractID,
	}
	s.notificationRepo.Create(ctx, notification)

	return s.toReviewResponse(review, reviewer), nil
}

func (s *ReviewService) GetReview(ctx context.Context, id uuid.UUID) (*ReviewResponse, error) {
	review, err := s.reviewRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	reviewer, _ := s.userRepo.GetByID(ctx, review.ReviewerID)
	return s.toReviewResponse(review, reviewer), nil
}

func (s *ReviewService) GetContractReviews(ctx context.Context, contractID uuid.UUID) ([]ReviewResponse, error) {
	reviews, err := s.reviewRepo.GetByContractID(ctx, contractID)
	if err != nil {
		return nil, err
	}

	responses := make([]ReviewResponse, len(reviews))
	for i, review := range reviews {
		reviewer, _ := s.userRepo.GetByID(ctx, review.ReviewerID)
		responses[i] = *s.toReviewResponse(&review, reviewer)
	}
	return responses, nil
}

func (s *ReviewService) GetUserReviews(ctx context.Context, userID uuid.UUID, limit, offset int) ([]ReviewResponse, int, error) {
	reviews, total, err := s.reviewRepo.GetByRevieweeID(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]ReviewResponse, len(reviews))
	for i, review := range reviews {
		reviewer, _ := s.userRepo.GetByID(ctx, review.ReviewerID)
		responses[i] = *s.toReviewResponse(&review, reviewer)
	}
	return responses, total, nil
}

func (s *ReviewService) toReviewResponse(review *domain.Review, reviewer *domain.User) *ReviewResponse {
	resp := &ReviewResponse{
		ID:                    review.ID,
		ContractID:            review.ContractID,
		ReviewerID:            review.ReviewerID,
		RevieweeID:            review.RevieweeID,
		OverallRating:         review.OverallRating,
		CommunicationRating:   review.CommunicationRating,
		QualityRating:         review.QualityRating,
		ExpertiseRating:       review.ExpertiseRating,
		ProfessionalismRating: review.ProfessionalismRating,
		WouldRecommend:        review.WouldRecommend,
		ReviewText:            review.ReviewText,
		IsPublic:              review.IsPublic,
		CreatedAt:             review.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
	if reviewer != nil {
		resp.ReviewerUsername = reviewer.Username
	}
	return resp
}

func ratingStars(rating int) string {
	stars := ""
	for i := 0; i < rating; i++ {
		stars += "★"
	}
	for i := rating; i < 5; i++ {
		stars += "☆"
	}
	return stars
}

func stringPtr(s string) *string {
	return &s
}
