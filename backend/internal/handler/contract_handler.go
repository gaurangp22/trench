package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/middleware"
	"github.com/trenchjob/backend/internal/service"
)

type ContractHandler struct {
	contractService *service.ContractService
}

func NewContractHandler(contractService *service.ContractService) *ContractHandler {
	return &ContractHandler{contractService: contractService}
}

// HireFreelancer creates a contract from a proposal
func (h *ContractHandler) HireFreelancer(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "proposal ID is required")
		return
	}

	proposalID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid proposal ID")
		return
	}

	var req service.CreateContractRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Set the proposal ID from URL path
	req.ProposalID = proposalID

	resp, err := h.contractService.HireFreelancer(r.Context(), userID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, resp)
}

// GetContract returns a contract with all details
func (h *ContractHandler) GetContract(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	// Extract contract ID from path using Go 1.22+ PathValue
	contractIDStr := r.PathValue("id")
	if contractIDStr == "" {
		writeError(w, http.StatusBadRequest, "contract ID is required")
		return
	}
	contractID, err := uuid.Parse(contractIDStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid contract ID")
		return
	}

	resp, err := h.contractService.GetContract(r.Context(), contractID, userID)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// ListContracts returns contracts for the current user
func (h *ContractHandler) ListContracts(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	// Parse query params
	query := r.URL.Query()
	status := query.Get("status")
	role := query.Get("role") // "client" or "freelancer"
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))

	if limit <= 0 {
		limit = 20
	}

	req := &service.ListContractsRequest{
		Status: status,
		Limit:  limit,
		Offset: offset,
	}

	var resp *service.ListContractsResponse
	var err error

	if role == "freelancer" {
		resp, err = h.contractService.ListContractsAsFreelancer(r.Context(), userID, req)
	} else {
		resp, err = h.contractService.ListContractsAsClient(r.Context(), userID, req)
	}

	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// AddMilestone adds a milestone to a contract
func (h *ContractHandler) AddMilestone(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "contract ID is required")
		return
	}

	contractID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid contract ID")
		return
	}

	var req service.CreateMilestoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	milestone, err := h.contractService.AddMilestone(r.Context(), contractID, userID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, milestone)
}

// SubmitMilestone submits work for a milestone
func (h *ContractHandler) SubmitMilestone(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "milestone ID is required")
		return
	}

	milestoneID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid milestone ID")
		return
	}

	var req service.SubmitMilestoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	milestone, err := h.contractService.SubmitMilestone(r.Context(), milestoneID, userID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, milestone)
}

// ApproveMilestone approves a submitted milestone
func (h *ContractHandler) ApproveMilestone(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "milestone ID is required")
		return
	}

	milestoneID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid milestone ID")
		return
	}

	milestone, err := h.contractService.ApproveMilestone(r.Context(), milestoneID, userID)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, milestone)
}

// RequestRevision requests revision for a submitted milestone
func (h *ContractHandler) RequestRevision(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "milestone ID is required")
		return
	}

	milestoneID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid milestone ID")
		return
	}

	var req service.RequestRevisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	milestone, err := h.contractService.RequestMilestoneRevision(r.Context(), milestoneID, userID, &req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, milestone)
}

// CompleteContract marks a contract as completed
func (h *ContractHandler) CompleteContract(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	userID := claims.UserID

	idStr := r.PathValue("id")
	if idStr == "" {
		writeError(w, http.StatusBadRequest, "contract ID is required")
		return
	}

	contractID, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid contract ID")
		return
	}

	if err := h.contractService.CompleteContract(r.Context(), contractID, userID); err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "contract completed successfully"})
}
