package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/shopspring/decimal"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/repository"
)

type ServiceService struct {
	serviceRepo repository.ServiceRepository
	orderRepo   repository.ServiceOrderRepository
	userRepo    repository.UserRepository
}

func NewServiceService(
	serviceRepo repository.ServiceRepository,
	orderRepo repository.ServiceOrderRepository,
	userRepo repository.UserRepository,
) *ServiceService {
	return &ServiceService{
		serviceRepo: serviceRepo,
		orderRepo:   orderRepo,
		userRepo:    userRepo,
	}
}

// ========================================
// Service (Gig) Methods
// ========================================

// CreateServiceRequest represents a service creation request
type CreateServiceRequest struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	CategoryID   *int     `json:"category_id"`
	ThumbnailURL *string  `json:"thumbnail_url"`
	GalleryURLs  []string `json:"gallery_urls"`
	Skills       []int    `json:"skills"`

	// Package tiers
	BasicPriceSOL       *decimal.Decimal `json:"basic_price_sol"`
	BasicDescription    *string          `json:"basic_description"`
	BasicDeliveryDays   *int             `json:"basic_delivery_days"`
	BasicRevisions      *int             `json:"basic_revisions"`

	StandardPriceSOL     *decimal.Decimal `json:"standard_price_sol"`
	StandardDescription  *string          `json:"standard_description"`
	StandardDeliveryDays *int             `json:"standard_delivery_days"`
	StandardRevisions    *int             `json:"standard_revisions"`

	PremiumPriceSOL     *decimal.Decimal `json:"premium_price_sol"`
	PremiumDescription  *string          `json:"premium_description"`
	PremiumDeliveryDays *int             `json:"premium_delivery_days"`
	PremiumRevisions    *int             `json:"premium_revisions"`
}

// CreateService creates a new service/gig
func (s *ServiceService) CreateService(ctx context.Context, freelancerID uuid.UUID, req *CreateServiceRequest) (*domain.Service, error) {
	// Validate required fields
	if req.Title == "" {
		return nil, apperrors.NewBadRequest("title is required")
	}
	if req.Description == "" {
		return nil, apperrors.NewBadRequest("description is required")
	}

	// Verify user is a freelancer
	user, err := s.userRepo.GetByID(ctx, freelancerID)
	if err != nil {
		return nil, err
	}
	if !user.IsFreelancer {
		return nil, apperrors.NewForbidden("only freelancers can create services")
	}

	// At least one package tier must be defined
	if req.BasicPriceSOL == nil && req.StandardPriceSOL == nil && req.PremiumPriceSOL == nil {
		return nil, apperrors.NewBadRequest("at least one pricing tier is required")
	}

	service := &domain.Service{
		FreelancerID:         freelancerID,
		Title:                req.Title,
		Description:          req.Description,
		CategoryID:           req.CategoryID,
		ThumbnailURL:         req.ThumbnailURL,
		GalleryURLs:          pq.StringArray(req.GalleryURLs),
		BasicPriceSOL:        req.BasicPriceSOL,
		BasicDescription:     req.BasicDescription,
		BasicDeliveryDays:    req.BasicDeliveryDays,
		BasicRevisions:       req.BasicRevisions,
		StandardPriceSOL:     req.StandardPriceSOL,
		StandardDescription:  req.StandardDescription,
		StandardDeliveryDays: req.StandardDeliveryDays,
		StandardRevisions:    req.StandardRevisions,
		PremiumPriceSOL:      req.PremiumPriceSOL,
		PremiumDescription:   req.PremiumDescription,
		PremiumDeliveryDays:  req.PremiumDeliveryDays,
		PremiumRevisions:     req.PremiumRevisions,
		Status:               domain.ServiceStatusDraft,
		Visibility:           domain.VisibilityPublic,
	}

	if err := s.serviceRepo.Create(ctx, service); err != nil {
		return nil, err
	}

	// Add skills if provided
	if len(req.Skills) > 0 {
		if err := s.serviceRepo.AddSkills(ctx, service.ID, req.Skills); err != nil {
			// Non-fatal error, continue
		}
	}

	return service, nil
}

// ServiceDetailResponse represents a detailed service response
type ServiceDetailResponse struct {
	Service *domain.Service      `json:"service"`
	Skills  []domain.Skill       `json:"skills"`
	FAQs    []domain.ServiceFAQ  `json:"faqs"`
	Reviews []domain.ServiceReview `json:"reviews"`
}

// GetService retrieves a service by ID
func (s *ServiceService) GetService(ctx context.Context, id uuid.UUID) (*ServiceDetailResponse, error) {
	service, err := s.serviceRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get service skills
	skills, _ := s.serviceRepo.GetSkills(ctx, id)

	// Get FAQs
	faqs, _ := s.serviceRepo.GetFAQs(ctx, id)

	// Get recent reviews
	reviews, _, _ := s.orderRepo.GetReviewsByServiceID(ctx, id, 10, 0)

	// Increment view count (fire and forget)
	go s.serviceRepo.IncrementViews(ctx, id)

	return &ServiceDetailResponse{
		Service: service,
		Skills:  skills,
		FAQs:    faqs,
		Reviews: reviews,
	}, nil
}

// UpdateServiceRequest represents a service update request
type UpdateServiceRequest struct {
	Title        *string  `json:"title"`
	Description  *string  `json:"description"`
	CategoryID   *int     `json:"category_id"`
	ThumbnailURL *string  `json:"thumbnail_url"`
	GalleryURLs  []string `json:"gallery_urls"`
	Skills       []int    `json:"skills"`
	Visibility   *string  `json:"visibility"`

	// Package tiers
	BasicPriceSOL       *decimal.Decimal `json:"basic_price_sol"`
	BasicDescription    *string          `json:"basic_description"`
	BasicDeliveryDays   *int             `json:"basic_delivery_days"`
	BasicRevisions      *int             `json:"basic_revisions"`

	StandardPriceSOL     *decimal.Decimal `json:"standard_price_sol"`
	StandardDescription  *string          `json:"standard_description"`
	StandardDeliveryDays *int             `json:"standard_delivery_days"`
	StandardRevisions    *int             `json:"standard_revisions"`

	PremiumPriceSOL     *decimal.Decimal `json:"premium_price_sol"`
	PremiumDescription  *string          `json:"premium_description"`
	PremiumDeliveryDays *int             `json:"premium_delivery_days"`
	PremiumRevisions    *int             `json:"premium_revisions"`
}

// UpdateService updates a service
func (s *ServiceService) UpdateService(ctx context.Context, freelancerID, serviceID uuid.UUID, req *UpdateServiceRequest) (*domain.Service, error) {
	service, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return nil, err
	}

	// Verify ownership
	if service.FreelancerID != freelancerID {
		return nil, apperrors.ErrForbidden
	}

	// Update fields if provided
	if req.Title != nil {
		service.Title = *req.Title
	}
	if req.Description != nil {
		service.Description = *req.Description
	}
	if req.CategoryID != nil {
		service.CategoryID = req.CategoryID
	}
	if req.ThumbnailURL != nil {
		service.ThumbnailURL = req.ThumbnailURL
	}
	if req.GalleryURLs != nil {
		service.GalleryURLs = pq.StringArray(req.GalleryURLs)
	}
	if req.Visibility != nil {
		service.Visibility = *req.Visibility
	}

	// Update package tiers
	if req.BasicPriceSOL != nil {
		service.BasicPriceSOL = req.BasicPriceSOL
	}
	if req.BasicDescription != nil {
		service.BasicDescription = req.BasicDescription
	}
	if req.BasicDeliveryDays != nil {
		service.BasicDeliveryDays = req.BasicDeliveryDays
	}
	if req.BasicRevisions != nil {
		service.BasicRevisions = req.BasicRevisions
	}

	if req.StandardPriceSOL != nil {
		service.StandardPriceSOL = req.StandardPriceSOL
	}
	if req.StandardDescription != nil {
		service.StandardDescription = req.StandardDescription
	}
	if req.StandardDeliveryDays != nil {
		service.StandardDeliveryDays = req.StandardDeliveryDays
	}
	if req.StandardRevisions != nil {
		service.StandardRevisions = req.StandardRevisions
	}

	if req.PremiumPriceSOL != nil {
		service.PremiumPriceSOL = req.PremiumPriceSOL
	}
	if req.PremiumDescription != nil {
		service.PremiumDescription = req.PremiumDescription
	}
	if req.PremiumDeliveryDays != nil {
		service.PremiumDeliveryDays = req.PremiumDeliveryDays
	}
	if req.PremiumRevisions != nil {
		service.PremiumRevisions = req.PremiumRevisions
	}

	if err := s.serviceRepo.Update(ctx, service); err != nil {
		return nil, err
	}

	// Update skills if provided
	if req.Skills != nil {
		s.serviceRepo.RemoveSkills(ctx, serviceID)
		if len(req.Skills) > 0 {
			s.serviceRepo.AddSkills(ctx, serviceID, req.Skills)
		}
	}

	return service, nil
}

// PublishService publishes a draft service
func (s *ServiceService) PublishService(ctx context.Context, freelancerID, serviceID uuid.UUID) error {
	service, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return err
	}

	if service.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	if service.Status != domain.ServiceStatusDraft && service.Status != domain.ServiceStatusPaused {
		return apperrors.NewBadRequest("only draft or paused services can be published")
	}

	service.Status = domain.ServiceStatusActive
	return s.serviceRepo.Update(ctx, service)
}

// PauseService pauses an active service
func (s *ServiceService) PauseService(ctx context.Context, freelancerID, serviceID uuid.UUID) error {
	service, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return err
	}

	if service.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	if service.Status != domain.ServiceStatusActive {
		return apperrors.NewBadRequest("only active services can be paused")
	}

	service.Status = domain.ServiceStatusPaused
	return s.serviceRepo.Update(ctx, service)
}

// DeleteService deletes/archives a service
func (s *ServiceService) DeleteService(ctx context.Context, freelancerID, serviceID uuid.UUID) error {
	service, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return err
	}

	if service.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	// Archive instead of hard delete if there are orders
	service.Status = domain.ServiceStatusArchived
	return s.serviceRepo.Update(ctx, service)
}

// SearchServicesRequest represents a service search request
type SearchServicesRequest struct {
	Query      string `json:"query"`
	CategoryID *int   `json:"category_id"`
	Skills     []int  `json:"skills"`
	Limit      int    `json:"limit"`
	Offset     int    `json:"offset"`
}

// SearchServicesResponse represents a paginated service search result
type SearchServicesResponse struct {
	Services []domain.Service `json:"services"`
	Total    int              `json:"total"`
	Limit    int              `json:"limit"`
	Offset   int              `json:"offset"`
}

// SearchServices searches for services
func (s *ServiceService) SearchServices(ctx context.Context, req *SearchServicesRequest) (*SearchServicesResponse, error) {
	if req.Limit <= 0 || req.Limit > 50 {
		req.Limit = 20
	}
	if req.Offset < 0 {
		req.Offset = 0
	}

	services, total, err := s.serviceRepo.Search(ctx, req.Query, req.CategoryID, req.Skills, req.Limit, req.Offset)
	if err != nil {
		return nil, err
	}

	return &SearchServicesResponse{
		Services: services,
		Total:    total,
		Limit:    req.Limit,
		Offset:   req.Offset,
	}, nil
}

// GetFreelancerServices gets all services for a freelancer
func (s *ServiceService) GetFreelancerServices(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) (*SearchServicesResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	services, total, err := s.serviceRepo.GetByFreelancerID(ctx, freelancerID, status, limit, offset)
	if err != nil {
		return nil, err
	}

	return &SearchServicesResponse{
		Services: services,
		Total:    total,
		Limit:    limit,
		Offset:   offset,
	}, nil
}

// ========================================
// Service Order Methods
// ========================================

// CreateOrderRequest represents an order creation request
type CreateOrderRequest struct {
	PackageTier  string  `json:"package_tier"`
	Requirements *string `json:"requirements"`
}

// PlaceOrder creates a new service order
func (s *ServiceService) PlaceOrder(ctx context.Context, clientID, serviceID uuid.UUID, req *CreateOrderRequest) (*domain.ServiceOrder, error) {
	// Verify user is a client
	user, err := s.userRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	if !user.IsClient {
		return nil, apperrors.NewForbidden("only clients can place orders")
	}

	// Get the service
	service, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return nil, err
	}

	// Verify service is active
	if service.Status != domain.ServiceStatusActive {
		return nil, apperrors.NewBadRequest("service is not available for orders")
	}

	// Cannot order your own service
	if service.FreelancerID == clientID {
		return nil, apperrors.NewBadRequest("cannot order your own service")
	}

	// Validate and get package details
	var priceSOL decimal.Decimal
	var deliveryDays int
	var revisions int

	switch req.PackageTier {
	case domain.PackageTierBasic:
		if service.BasicPriceSOL == nil {
			return nil, apperrors.NewBadRequest("basic package is not available")
		}
		priceSOL = *service.BasicPriceSOL
		if service.BasicDeliveryDays != nil {
			deliveryDays = *service.BasicDeliveryDays
		}
		if service.BasicRevisions != nil {
			revisions = *service.BasicRevisions
		} else {
			revisions = 1
		}
	case domain.PackageTierStandard:
		if service.StandardPriceSOL == nil {
			return nil, apperrors.NewBadRequest("standard package is not available")
		}
		priceSOL = *service.StandardPriceSOL
		if service.StandardDeliveryDays != nil {
			deliveryDays = *service.StandardDeliveryDays
		}
		if service.StandardRevisions != nil {
			revisions = *service.StandardRevisions
		} else {
			revisions = 2
		}
	case domain.PackageTierPremium:
		if service.PremiumPriceSOL == nil {
			return nil, apperrors.NewBadRequest("premium package is not available")
		}
		priceSOL = *service.PremiumPriceSOL
		if service.PremiumDeliveryDays != nil {
			deliveryDays = *service.PremiumDeliveryDays
		}
		if service.PremiumRevisions != nil {
			revisions = *service.PremiumRevisions
		} else {
			revisions = 3
		}
	default:
		return nil, apperrors.NewBadRequest("invalid package tier")
	}

	order := &domain.ServiceOrder{
		ServiceID:        serviceID,
		ClientID:         clientID,
		FreelancerID:     service.FreelancerID,
		PackageTier:      req.PackageTier,
		PriceSOL:         priceSOL,
		DeliveryDays:     deliveryDays,
		RevisionsAllowed: revisions,
		RevisionsUsed:    0,
		Requirements:     req.Requirements,
		Status:           domain.ServiceOrderStatusPending,
	}

	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// GetOrder retrieves an order by ID
func (s *ServiceService) GetOrder(ctx context.Context, userID, orderID uuid.UUID) (*domain.ServiceOrder, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	// Verify access
	if order.ClientID != userID && order.FreelancerID != userID {
		return nil, apperrors.ErrForbidden
	}

	return order, nil
}

// OrderListResponse represents a paginated order list result
type OrderListResponse struct {
	Orders []domain.ServiceOrder `json:"orders"`
	Total  int                   `json:"total"`
	Limit  int                   `json:"limit"`
	Offset int                   `json:"offset"`
}

// GetClientOrders gets all orders for a client
func (s *ServiceService) GetClientOrders(ctx context.Context, clientID uuid.UUID, status string, limit, offset int) (*OrderListResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	orders, total, err := s.orderRepo.GetByClientID(ctx, clientID, status, limit, offset)
	if err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders: orders,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}, nil
}

// GetFreelancerOrders gets all orders for a freelancer
func (s *ServiceService) GetFreelancerOrders(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) (*OrderListResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	orders, total, err := s.orderRepo.GetByFreelancerID(ctx, freelancerID, status, limit, offset)
	if err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders: orders,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}, nil
}

// AcceptOrder accepts an order (freelancer starts work)
func (s *ServiceService) AcceptOrder(ctx context.Context, freelancerID, orderID uuid.UUID) error {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	if order.Status != domain.ServiceOrderStatusPending {
		return apperrors.NewBadRequest("can only accept pending orders")
	}

	now := time.Now()
	expectedDelivery := now.AddDate(0, 0, order.DeliveryDays)

	order.Status = domain.ServiceOrderStatusActive
	order.StartedAt = &now
	order.ExpectedDeliveryAt = &expectedDelivery

	return s.orderRepo.Update(ctx, order)
}

// DeliverOrderRequest represents a delivery submission
type DeliverOrderRequest struct {
	Message        string   `json:"message"`
	AttachmentURLs []string `json:"attachment_urls"`
}

// DeliverOrder submits a delivery for an order
func (s *ServiceService) DeliverOrder(ctx context.Context, freelancerID, orderID uuid.UUID, req *DeliverOrderRequest) error {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	if order.Status != domain.ServiceOrderStatusActive && order.Status != domain.ServiceOrderStatusRevisionRequested {
		return apperrors.NewBadRequest("can only deliver active or revision-requested orders")
	}

	now := time.Now()
	order.Status = domain.ServiceOrderStatusDelivered
	order.DeliveredAt = &now

	if err := s.orderRepo.Update(ctx, order); err != nil {
		return err
	}

	// Create delivery message
	msg := &domain.ServiceOrderMessage{
		OrderID:        orderID,
		SenderID:       freelancerID,
		MessageText:    req.Message,
		AttachmentURLs: pq.StringArray(req.AttachmentURLs),
		MessageType:    domain.OrderMessageTypeDelivery,
	}

	return s.orderRepo.CreateMessage(ctx, msg)
}

// ServiceOrderRevisionRequest represents a revision request for service orders
type ServiceOrderRevisionRequest struct {
	Message string `json:"message"`
}

// RequestRevision requests a revision for a delivered order
func (s *ServiceService) RequestRevision(ctx context.Context, clientID, orderID uuid.UUID, req *ServiceOrderRevisionRequest) error {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	if order.Status != domain.ServiceOrderStatusDelivered {
		return apperrors.NewBadRequest("can only request revisions for delivered orders")
	}

	if order.RevisionsUsed >= order.RevisionsAllowed {
		return apperrors.NewBadRequest("no revisions remaining")
	}

	order.Status = domain.ServiceOrderStatusRevisionRequested
	order.RevisionsUsed++

	if err := s.orderRepo.Update(ctx, order); err != nil {
		return err
	}

	// Create revision request message
	msg := &domain.ServiceOrderMessage{
		OrderID:     orderID,
		SenderID:    clientID,
		MessageText: req.Message,
		MessageType: domain.OrderMessageTypeRevisionRequest,
	}

	return s.orderRepo.CreateMessage(ctx, msg)
}

// ApproveDelivery approves a delivery and completes the order
func (s *ServiceService) ApproveDelivery(ctx context.Context, clientID, orderID uuid.UUID) error {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}

	if order.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	if order.Status != domain.ServiceOrderStatusDelivered {
		return apperrors.NewBadRequest("can only approve delivered orders")
	}

	now := time.Now()
	order.Status = domain.ServiceOrderStatusCompleted
	order.CompletedAt = &now

	return s.orderRepo.Update(ctx, order)
}

// CancelOrder cancels an order
func (s *ServiceService) CancelOrder(ctx context.Context, userID, orderID uuid.UUID) error {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}

	// Both client and freelancer can cancel
	if order.ClientID != userID && order.FreelancerID != userID {
		return apperrors.ErrForbidden
	}

	// Can only cancel pending or active orders
	if order.Status != domain.ServiceOrderStatusPending && order.Status != domain.ServiceOrderStatusActive {
		return apperrors.NewBadRequest("cannot cancel order in current status")
	}

	order.Status = domain.ServiceOrderStatusCancelled
	return s.orderRepo.Update(ctx, order)
}

// ========================================
// Order Message Methods
// ========================================

// ServiceOrderMessageRequest represents a message to send in a service order
type ServiceOrderMessageRequest struct {
	Message        string   `json:"message"`
	AttachmentURLs []string `json:"attachment_urls"`
}

// SendOrderMessage sends a message in an order
func (s *ServiceService) SendOrderMessage(ctx context.Context, userID, orderID uuid.UUID, req *ServiceOrderMessageRequest) (*domain.ServiceOrderMessage, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	// Verify access
	if order.ClientID != userID && order.FreelancerID != userID {
		return nil, apperrors.ErrForbidden
	}

	msg := &domain.ServiceOrderMessage{
		OrderID:        orderID,
		SenderID:       userID,
		MessageText:    req.Message,
		AttachmentURLs: pq.StringArray(req.AttachmentURLs),
		MessageType:    domain.OrderMessageTypeText,
	}

	if err := s.orderRepo.CreateMessage(ctx, msg); err != nil {
		return nil, err
	}

	return msg, nil
}

// GetOrderMessages gets messages for an order
func (s *ServiceService) GetOrderMessages(ctx context.Context, userID, orderID uuid.UUID, limit, offset int) ([]domain.ServiceOrderMessage, int, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, 0, err
	}

	// Verify access
	if order.ClientID != userID && order.FreelancerID != userID {
		return nil, 0, apperrors.ErrForbidden
	}

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	return s.orderRepo.GetMessages(ctx, orderID, limit, offset)
}

// ========================================
// Review Methods
// ========================================

// ServiceReviewRequest represents a review submission for service orders
type ServiceReviewRequest struct {
	Rating     int     `json:"rating"`
	ReviewText *string `json:"review_text"`
}

// CreateReview creates a review for a completed order
func (s *ServiceService) CreateReview(ctx context.Context, clientID, orderID uuid.UUID, req *ServiceReviewRequest) (*domain.ServiceReview, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.ClientID != clientID {
		return nil, apperrors.ErrForbidden
	}

	if order.Status != domain.ServiceOrderStatusCompleted {
		return nil, apperrors.NewBadRequest("can only review completed orders")
	}

	// Check if already reviewed
	_, err = s.orderRepo.GetReviewByOrderID(ctx, orderID)
	if err == nil {
		return nil, apperrors.NewConflict("order has already been reviewed")
	}

	if req.Rating < 1 || req.Rating > 5 {
		return nil, apperrors.NewBadRequest("rating must be between 1 and 5")
	}

	review := &domain.ServiceReview{
		OrderID:    orderID,
		ServiceID:  order.ServiceID,
		ReviewerID: clientID,
		Rating:     req.Rating,
		ReviewText: req.ReviewText,
	}

	if err := s.orderRepo.CreateReview(ctx, review); err != nil {
		return nil, err
	}

	return review, nil
}

// GetServiceReviews gets reviews for a service
func (s *ServiceService) GetServiceReviews(ctx context.Context, serviceID uuid.UUID, limit, offset int) ([]domain.ServiceReview, int, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	return s.orderRepo.GetReviewsByServiceID(ctx, serviceID, limit, offset)
}
