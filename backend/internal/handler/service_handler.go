package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/middleware"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/service"
)

type ServiceHandler struct {
	serviceService *service.ServiceService
}

func NewServiceHandler(serviceService *service.ServiceService) *ServiceHandler {
	return &ServiceHandler{serviceService: serviceService}
}

// ========================================
// Service (Gig) Handlers
// ========================================

// CreateService handles POST /api/v1/services
func (h *ServiceHandler) CreateService(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req service.CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	svc, err := h.serviceService.CreateService(r.Context(), claims.UserID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "service created successfully",
		"service": svc,
	})
}

// GetService handles GET /api/v1/services/{id}
func (h *ServiceHandler) GetService(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	result, err := h.serviceService.GetService(r.Context(), id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "service not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get service")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// SearchServices handles GET /api/v1/services
func (h *ServiceHandler) SearchServices(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	// Parse category ID
	var categoryID *int
	if catStr := query.Get("category_id"); catStr != "" {
		if id, err := strconv.Atoi(catStr); err == nil {
			categoryID = &id
		}
	}

	// Parse skills
	var skills []int
	if skillsStr := query.Get("skills"); skillsStr != "" {
		for _, s := range strings.Split(skillsStr, ",") {
			if id, err := strconv.Atoi(strings.TrimSpace(s)); err == nil {
				skills = append(skills, id)
			}
		}
	}

	// Parse pagination
	limit := 20
	offset := 0
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := query.Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	req := &service.SearchServicesRequest{
		Query:      query.Get("q"),
		CategoryID: categoryID,
		Skills:     skills,
		Limit:      limit,
		Offset:     offset,
	}

	result, err := h.serviceService.SearchServices(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to search services")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// UpdateService handles PUT /api/v1/services/{id}
func (h *ServiceHandler) UpdateService(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	var req service.UpdateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	svc, err := h.serviceService.UpdateService(r.Context(), claims.UserID, serviceID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "service updated successfully",
		"service": svc,
	})
}

// DeleteService handles DELETE /api/v1/services/{id}
func (h *ServiceHandler) DeleteService(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	if err := h.serviceService.DeleteService(r.Context(), claims.UserID, serviceID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "service archived successfully",
	})
}

// PublishService handles POST /api/v1/services/{id}/publish
func (h *ServiceHandler) PublishService(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	if err := h.serviceService.PublishService(r.Context(), claims.UserID, serviceID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "service published successfully",
	})
}

// PauseService handles POST /api/v1/services/{id}/pause
func (h *ServiceHandler) PauseService(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	if err := h.serviceService.PauseService(r.Context(), claims.UserID, serviceID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "service paused successfully",
	})
}

// GetMyServices handles GET /api/v1/services/mine
func (h *ServiceHandler) GetMyServices(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	query := r.URL.Query()
	status := query.Get("status")
	limit := 20
	offset := 0
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := query.Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	result, err := h.serviceService.GetFreelancerServices(r.Context(), claims.UserID, status, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get services")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// ========================================
// Order Handlers
// ========================================

// PlaceOrder handles POST /api/v1/services/{id}/order
func (h *ServiceHandler) PlaceOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	var req service.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	order, err := h.serviceService.PlaceOrder(r.Context(), claims.UserID, serviceID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "order placed successfully",
		"order":   order,
	})
}

// GetOrder handles GET /api/v1/orders/{id}
func (h *ServiceHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	order, err := h.serviceService.GetOrder(r.Context(), claims.UserID, orderID)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, order)
}

// GetMyOrders handles GET /api/v1/orders
func (h *ServiceHandler) GetMyOrders(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	query := r.URL.Query()
	status := query.Get("status")
	role := query.Get("role") // "client" or "freelancer"
	limit := 20
	offset := 0
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := query.Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	var result *service.OrderListResponse
	var err error

	if role == "freelancer" {
		result, err = h.serviceService.GetFreelancerOrders(r.Context(), claims.UserID, status, limit, offset)
	} else {
		result, err = h.serviceService.GetClientOrders(r.Context(), claims.UserID, status, limit, offset)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get orders")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// AcceptOrder handles POST /api/v1/orders/{id}/accept
func (h *ServiceHandler) AcceptOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	if err := h.serviceService.AcceptOrder(r.Context(), claims.UserID, orderID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "order accepted successfully",
	})
}

// DeliverOrder handles POST /api/v1/orders/{id}/deliver
func (h *ServiceHandler) DeliverOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	var req service.DeliverOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.serviceService.DeliverOrder(r.Context(), claims.UserID, orderID, &req); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "delivery submitted successfully",
	})
}

// ApproveDelivery handles POST /api/v1/orders/{id}/approve
func (h *ServiceHandler) ApproveDelivery(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	if err := h.serviceService.ApproveDelivery(r.Context(), claims.UserID, orderID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "delivery approved - order completed",
	})
}

// RequestRevision handles POST /api/v1/orders/{id}/revision
func (h *ServiceHandler) RequestRevision(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	var req service.ServiceOrderRevisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.serviceService.RequestRevision(r.Context(), claims.UserID, orderID, &req); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "revision requested successfully",
	})
}

// CancelOrder handles POST /api/v1/orders/{id}/cancel
func (h *ServiceHandler) CancelOrder(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	if err := h.serviceService.CancelOrder(r.Context(), claims.UserID, orderID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "order cancelled successfully",
	})
}

// ========================================
// Order Message Handlers
// ========================================

// SendOrderMessage handles POST /api/v1/orders/{id}/messages
func (h *ServiceHandler) SendOrderMessage(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	var req service.ServiceOrderMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	msg, err := h.serviceService.SendOrderMessage(r.Context(), claims.UserID, orderID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message":       "message sent successfully",
		"order_message": msg,
	})
}

// GetOrderMessages handles GET /api/v1/orders/{id}/messages
func (h *ServiceHandler) GetOrderMessages(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	query := r.URL.Query()
	limit := 50
	offset := 0
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := query.Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	messages, total, err := h.serviceService.GetOrderMessages(r.Context(), claims.UserID, orderID, limit, offset)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"messages": messages,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

// ========================================
// Review Handlers
// ========================================

// CreateReview handles POST /api/v1/orders/{id}/review
func (h *ServiceHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "order ID is required")
		return
	}

	orderID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid order ID format")
		return
	}

	var req service.ServiceReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	review, err := h.serviceService.CreateReview(r.Context(), claims.UserID, orderID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "review submitted successfully",
		"review":  review,
	})
}

// GetServiceReviews handles GET /api/v1/services/{id}/reviews
func (h *ServiceHandler) GetServiceReviews(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "service ID is required")
		return
	}

	serviceID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid service ID format")
		return
	}

	query := r.URL.Query()
	limit := 20
	offset := 0
	if l := query.Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil {
			limit = parsed
		}
	}
	if o := query.Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	reviews, total, err := h.serviceService.GetServiceReviews(r.Context(), serviceID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get reviews")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": reviews,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}
