package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/middleware"
	"github.com/trenchjob/backend/internal/service"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req service.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	review, err := h.reviewService.CreateReview(r.Context(), claims.UserID, req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, review)
}

func (h *ReviewHandler) GetReview(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid review id")
		return
	}

	review, err := h.reviewService.GetReview(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "review not found")
		return
	}

	writeJSON(w, http.StatusOK, review)
}

func (h *ReviewHandler) GetContractReviews(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	contractID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid contract id")
		return
	}

	reviews, err := h.reviewService.GetContractReviews(r.Context(), contractID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get reviews")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"reviews": reviews,
	})
}

func (h *ReviewHandler) GetUserReviews(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	userID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	limit := 20
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	reviews, total, err := h.reviewService.GetUserReviews(r.Context(), userID, limit, offset)
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
