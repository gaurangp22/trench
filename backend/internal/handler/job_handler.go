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

type JobHandler struct {
	jobService *service.JobService
}

func NewJobHandler(jobService *service.JobService) *JobHandler {
	return &JobHandler{jobService: jobService}
}

// CreateJob handles POST /api/v1/jobs
func (h *JobHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req service.CreateJobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	job, err := h.jobService.CreateJob(r.Context(), claims.UserID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "job created successfully",
		"job":     job,
	})
}

// GetJob handles GET /api/v1/jobs/{id}
func (h *JobHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	job, err := h.jobService.GetJob(r.Context(), id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "job not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get job")
		return
	}

	writeJSON(w, http.StatusOK, job)
}

// SearchJobs handles GET /api/v1/jobs
func (h *JobHandler) SearchJobs(w http.ResponseWriter, r *http.Request) {
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

	req := &service.SearchJobsRequest{
		Query:      query.Get("q"),
		CategoryID: categoryID,
		Skills:     skills,
		Status:     query.Get("status"),
		Limit:      limit,
		Offset:     offset,
	}

	result, err := h.jobService.SearchJobs(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to search jobs")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// UpdateJob handles PUT /api/v1/jobs/{id}
func (h *JobHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract ID from URL path using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	var req service.UpdateJobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	job, err := h.jobService.UpdateJob(r.Context(), claims.UserID, jobID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "job updated successfully",
		"job":     job,
	})
}

// DeleteJob handles DELETE /api/v1/jobs/{id}
func (h *JobHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract ID from URL path using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	if err := h.jobService.DeleteJob(r.Context(), claims.UserID, jobID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "job deleted successfully",
	})
}

// PublishJob handles POST /api/v1/jobs/{id}/publish
func (h *JobHandler) PublishJob(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract job ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	if err := h.jobService.PublishJob(r.Context(), claims.UserID, jobID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "job published successfully",
	})
}

// CloseJob handles POST /api/v1/jobs/{id}/close
func (h *JobHandler) CloseJob(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract job ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	if err := h.jobService.CloseJob(r.Context(), claims.UserID, jobID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "job closed successfully",
	})
}

// GetMyJobs handles GET /api/v1/jobs/mine
func (h *JobHandler) GetMyJobs(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
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

	result, err := h.jobService.GetClientJobs(r.Context(), claims.UserID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get jobs")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// ============================================
// Proposal Handlers
// ============================================

// SubmitProposal handles POST /api/v1/jobs/{id}/proposals
func (h *JobHandler) SubmitProposal(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract job ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
		return
	}

	var req service.CreateProposalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	proposal, err := h.jobService.SubmitProposal(r.Context(), claims.UserID, jobID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message":  "proposal submitted successfully",
		"proposal": proposal,
	})
}

// GetJobProposals handles GET /api/v1/jobs/{id}/proposals
func (h *JobHandler) GetJobProposals(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract job ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	jobID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid job ID format")
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

	proposals, total, err := h.jobService.GetJobProposals(r.Context(), claims.UserID, jobID, limit, offset)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"proposals": proposals,
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

// GetMyProposals handles GET /api/v1/proposals/mine
func (h *JobHandler) GetMyProposals(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
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

	proposals, total, err := h.jobService.GetFreelancerProposals(r.Context(), claims.UserID, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get proposals")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"proposals": proposals,
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

// GetProposal handles GET /api/v1/proposals/{id}
func (h *JobHandler) GetProposal(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract ID from URL path using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "proposal ID is required")
		return
	}

	proposalID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid proposal ID format")
		return
	}

	proposal, err := h.jobService.GetProposal(r.Context(), claims.UserID, proposalID)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, proposal)
}

// WithdrawProposal handles DELETE /api/v1/proposals/{id}
func (h *JobHandler) WithdrawProposal(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract ID from URL path using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "proposal ID is required")
		return
	}

	proposalID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid proposal ID format")
		return
	}

	if err := h.jobService.WithdrawProposal(r.Context(), claims.UserID, proposalID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "proposal withdrawn successfully",
	})
}

// UpdateProposalStatus handles POST /api/v1/proposals/{id}/shortlist or /reject
func (h *JobHandler) UpdateProposalStatus(w http.ResponseWriter, r *http.Request, status string) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract proposal ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "proposal ID is required")
		return
	}

	proposalID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid proposal ID format")
		return
	}

	if err := h.jobService.UpdateProposalStatus(r.Context(), claims.UserID, proposalID, status); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "proposal status updated",
	})
}

// ShortlistProposal handles POST /api/v1/proposals/{id}/shortlist
func (h *JobHandler) ShortlistProposal(w http.ResponseWriter, r *http.Request) {
	h.UpdateProposalStatus(w, r, "shortlisted")
}

// RejectProposal handles POST /api/v1/proposals/{id}/reject
func (h *JobHandler) RejectProposal(w http.ResponseWriter, r *http.Request) {
	h.UpdateProposalStatus(w, r, "rejected")
}

// HireProposal handles POST /api/v1/proposals/{id}/hire
func (h *JobHandler) HireProposal(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract proposal ID using Go 1.22+ PathValue
	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "proposal ID is required")
		return
	}

	proposalID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid proposal ID format")
		return
	}

	proposal, err := h.jobService.AcceptProposal(r.Context(), claims.UserID, proposalID)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message":  "proposal accepted - contract will be created",
		"proposal": proposal,
	})
}
