package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/middleware"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/service"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(profileService *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{profileService: profileService}
}

// GetMyProfile handles GET /api/v1/profile
func (h *ProfileHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	profile, err := h.profileService.GetProfileByUserID(r.Context(), claims.UserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "profile not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get profile")
		return
	}

	writeJSON(w, http.StatusOK, profile)
}

// GetProfile handles GET /api/v1/profiles/:id
func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 4 {
		writeError(w, http.StatusBadRequest, "invalid profile ID")
		return
	}

	idStr := parts[len(parts)-1]
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid profile ID format")
		return
	}

	profile, err := h.profileService.GetProfile(r.Context(), id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "profile not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to get profile")
		return
	}

	writeJSON(w, http.StatusOK, profile)
}

// UpdateProfile handles PUT /api/v1/profile
func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req service.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	profile, err := h.profileService.UpdateProfile(r.Context(), claims.UserID, &req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "profile updated successfully",
		"profile": profile,
	})
}

// SearchProfiles handles GET /api/v1/profiles
func (h *ProfileHandler) SearchProfiles(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

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

	req := &service.SearchProfilesRequest{
		Query:  query.Get("q"),
		Skills: skills,
		Limit:  limit,
		Offset: offset,
	}

	result, err := h.profileService.SearchProfiles(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to search profiles")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// SetProfileSkills handles PUT /api/v1/profile/skills
func (h *ProfileHandler) SetProfileSkills(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req service.SetProfileSkillsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.profileService.SetProfileSkills(r.Context(), claims.UserID, &req); err != nil {
		if badReq, ok := err.(*apperrors.BadRequestError); ok {
			writeError(w, http.StatusBadRequest, badReq.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update skills")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "skills updated successfully",
	})
}

// AddProfileSkill handles POST /api/v1/profile/skills
func (h *ProfileHandler) AddProfileSkill(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var input service.ProfileSkillInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.profileService.AddProfileSkill(r.Context(), claims.UserID, &input); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusBadRequest, "skill not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to add skill")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "skill added successfully",
	})
}

// RemoveProfileSkill handles DELETE /api/v1/profile/skills/:id
func (h *ProfileHandler) RemoveProfileSkill(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract skill ID from URL
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "invalid skill ID")
		return
	}

	skillID, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid skill ID format")
		return
	}

	if err := h.profileService.RemoveProfileSkill(r.Context(), claims.UserID, skillID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "skill not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to remove skill")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "skill removed successfully",
	})
}

// GetAllSkills handles GET /api/v1/skills
func (h *ProfileHandler) GetAllSkills(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	query := r.URL.Query().Get("q")

	var skills []domain.Skill
	var err error

	if query != "" {
		skills, err = h.profileService.SearchSkills(r.Context(), query)
	} else if category != "" {
		skills, err = h.profileService.GetSkillsByCategory(r.Context(), category)
	} else {
		skills, err = h.profileService.GetAllSkills(r.Context())
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get skills")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"skills": skills,
	})
}

// Portfolio handlers

// CreatePortfolioItem handles POST /api/v1/profile/portfolio
func (h *ProfileHandler) CreatePortfolioItem(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var input struct {
		Title          string     `json:"title"`
		Description    *string    `json:"description"`
		ProjectURL     *string    `json:"project_url"`
		ImageURLs      []string   `json:"image_urls"`
		SkillsUsed     []int      `json:"skills_used"`
		CompletionDate *time.Time `json:"completion_date"`
		SortOrder      int        `json:"sort_order"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if input.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	item := &domain.PortfolioItem{
		Title:          input.Title,
		Description:    input.Description,
		ProjectURL:     input.ProjectURL,
		ImageURLs:      input.ImageURLs,
		SkillsUsed:     input.SkillsUsed,
		CompletionDate: input.CompletionDate,
		SortOrder:      input.SortOrder,
	}

	if err := h.profileService.CreatePortfolioItem(r.Context(), claims.UserID, item); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create portfolio item")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "portfolio item created",
		"item":    item,
	})
}

// UpdatePortfolioItem handles PUT /api/v1/profile/portfolio/:id
func (h *ProfileHandler) UpdatePortfolioItem(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract item ID from URL
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "invalid item ID")
		return
	}

	itemID, err := uuid.Parse(parts[len(parts)-1])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid item ID format")
		return
	}

	var input struct {
		Title          string     `json:"title"`
		Description    *string    `json:"description"`
		ProjectURL     *string    `json:"project_url"`
		ImageURLs      []string   `json:"image_urls"`
		SkillsUsed     []int      `json:"skills_used"`
		CompletionDate *time.Time `json:"completion_date"`
		SortOrder      int        `json:"sort_order"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	item := &domain.PortfolioItem{
		ID:             itemID,
		Title:          input.Title,
		Description:    input.Description,
		ProjectURL:     input.ProjectURL,
		ImageURLs:      input.ImageURLs,
		SkillsUsed:     input.SkillsUsed,
		CompletionDate: input.CompletionDate,
		SortOrder:      input.SortOrder,
	}

	if err := h.profileService.UpdatePortfolioItem(r.Context(), claims.UserID, item); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "portfolio item not found")
			return
		}
		if errors.Is(err, apperrors.ErrForbidden) {
			writeError(w, http.StatusForbidden, "not authorized to update this item")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update portfolio item")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "portfolio item updated",
	})
}

// DeletePortfolioItem handles DELETE /api/v1/profile/portfolio/:id
func (h *ProfileHandler) DeletePortfolioItem(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetUserFromContext(r.Context())
	if claims == nil {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Extract item ID from URL
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		writeError(w, http.StatusBadRequest, "invalid item ID")
		return
	}

	itemID, err := uuid.Parse(parts[len(parts)-1])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid item ID format")
		return
	}

	if err := h.profileService.DeletePortfolioItem(r.Context(), claims.UserID, itemID); err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			writeError(w, http.StatusNotFound, "portfolio item not found")
			return
		}
		if errors.Is(err, apperrors.ErrForbidden) {
			writeError(w, http.StatusForbidden, "not authorized to delete this item")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to delete portfolio item")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "portfolio item deleted",
	})
}
