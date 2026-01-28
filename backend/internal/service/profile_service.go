package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/pkg/dexscreener"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/repository"
)

type ProfileService struct {
	profileRepo      repository.ProfileRepository
	skillRepo        repository.SkillRepository
	portfolioRepo    repository.PortfolioRepository
	userRepo         repository.UserRepository
	socialRepo       repository.SocialRepository
	tokenWorkRepo    repository.TokenWorkRepository
	dexScreener      *dexscreener.Client
}

func NewProfileService(
	profileRepo repository.ProfileRepository,
	skillRepo repository.SkillRepository,
	portfolioRepo repository.PortfolioRepository,
	userRepo repository.UserRepository,
	socialRepo repository.SocialRepository,
	tokenWorkRepo repository.TokenWorkRepository,
) *ProfileService {
	return &ProfileService{
		profileRepo:      profileRepo,
		skillRepo:        skillRepo,
		portfolioRepo:    portfolioRepo,
		userRepo:         userRepo,
		socialRepo:       socialRepo,
		tokenWorkRepo:    tokenWorkRepo,
		dexScreener:      dexscreener.NewClient(),
	}
}

// ProfileResponse combines profile with related data
type ProfileResponse struct {
	Profile   *domain.Profile         `json:"profile"`
	User      *ProfileUserInfo        `json:"user"`
	Skills    []ProfileSkillInfo      `json:"skills"`
	Portfolio []domain.PortfolioItem  `json:"portfolio"`
	Socials   []domain.ProfileSocial  `json:"socials"`
	TokenWork []domain.TokenWorkItem  `json:"token_work"`
}

type ProfileUserInfo struct {
	ID            uuid.UUID `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email"`
	WalletAddress *string   `json:"wallet_address,omitempty"`
	IsClient      bool      `json:"is_client"`
	IsFreelancer  bool      `json:"is_freelancer"`
}

type ProfileSkillInfo struct {
	ID               int     `json:"id"`
	Name             string  `json:"name"`
	Slug             string  `json:"slug"`
	Category         *string `json:"category"`
	YearsExperience  *int    `json:"years_experience"`
	ProficiencyLevel *string `json:"proficiency_level"`
}

// GetProfile retrieves a complete profile with user info, skills, and portfolio
func (s *ProfileService) GetProfile(ctx context.Context, profileID uuid.UUID) (*ProfileResponse, error) {
	profile, err := s.profileRepo.GetByID(ctx, profileID)
	if err != nil {
		return nil, err
	}

	return s.buildProfileResponse(ctx, profile)
}

// GetProfileByUserID retrieves a profile by user ID
func (s *ProfileService) GetProfileByUserID(ctx context.Context, userID uuid.UUID) (*ProfileResponse, error) {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return s.buildProfileResponse(ctx, profile)
}

func (s *ProfileService) buildProfileResponse(ctx context.Context, profile *domain.Profile) (*ProfileResponse, error) {
	user, err := s.userRepo.GetByID(ctx, profile.UserID)
	if err != nil {
		return nil, err
	}

	skills, err := s.profileRepo.GetSkills(ctx, profile.ID)
	if err != nil {
		return nil, err
	}

	portfolio, err := s.portfolioRepo.GetByProfileID(ctx, profile.ID)
	if err != nil {
		return nil, err
	}

	// Fetch socials
	socials, err := s.socialRepo.GetByProfileID(ctx, profile.ID)
	if err != nil {
		// Non-fatal, just use empty slice
		socials = []domain.ProfileSocial{}
	}

	// Fetch token work
	tokenWork, err := s.tokenWorkRepo.GetByProfileID(ctx, profile.ID)
	if err != nil {
		// Non-fatal, just use empty slice
		tokenWork = []domain.TokenWorkItem{}
	}

	// Build skill info with names
	skillInfos := make([]ProfileSkillInfo, 0, len(skills))
	for _, ps := range skills {
		skill, err := s.skillRepo.GetByID(ctx, ps.SkillID)
		if err != nil {
			continue
		}
		skillInfos = append(skillInfos, ProfileSkillInfo{
			ID:               skill.ID,
			Name:             skill.Name,
			Slug:             skill.Slug,
			Category:         skill.Category,
			YearsExperience:  ps.YearsExperience,
			ProficiencyLevel: ps.ProficiencyLevel,
		})
	}

	return &ProfileResponse{
		Profile: profile,
		User: &ProfileUserInfo{
			ID:            user.ID,
			Username:      user.Username,
			Email:         user.Email,
			WalletAddress: user.PrimaryWalletAddress,
			IsClient:      user.IsClient,
			IsFreelancer:  user.IsFreelancer,
		},
		Skills:    skillInfos,
		Portfolio: portfolio,
		Socials:   socials,
		TokenWork: tokenWork,
	}, nil
}

// UpdateProfileRequest represents a profile update request
type UpdateProfileRequest struct {
	DisplayName       *string          `json:"display_name"`
	ProfessionalTitle *string          `json:"professional_title"`
	AvatarURL         *string          `json:"avatar_url"`
	CoverImageURL     *string          `json:"cover_image_url"`
	Overview          *string          `json:"overview"`
	Country           *string          `json:"country"`
	City              *string          `json:"city"`
	Timezone          *string          `json:"timezone"`
	HourlyRateSOL     *decimal.Decimal `json:"hourly_rate_sol"`
	MinimumProjectSOL *decimal.Decimal `json:"minimum_project_sol"`
	AvailableForHire  *bool            `json:"available_for_hire"`
	AvailabilityStatus *string         `json:"availability_status"`
}

// UpdateProfile updates a user's profile
func (s *ProfileService) UpdateProfile(ctx context.Context, userID uuid.UUID, req *UpdateProfileRequest) (*domain.Profile, error) {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			// Create profile if it doesn't exist
			profile = &domain.Profile{
				UserID:           userID,
				AvailableForHire: true,
			}
			if err := s.profileRepo.Create(ctx, profile); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	// Update fields if provided
	if req.DisplayName != nil {
		profile.DisplayName = req.DisplayName
	}
	if req.ProfessionalTitle != nil {
		profile.ProfessionalTitle = req.ProfessionalTitle
	}
	if req.AvatarURL != nil {
		profile.AvatarURL = req.AvatarURL
	}
	if req.CoverImageURL != nil {
		profile.CoverImageURL = req.CoverImageURL
	}
	if req.Overview != nil {
		profile.Overview = req.Overview
	}
	if req.Country != nil {
		profile.Country = req.Country
	}
	if req.City != nil {
		profile.City = req.City
	}
	if req.Timezone != nil {
		profile.Timezone = req.Timezone
	}
	if req.HourlyRateSOL != nil {
		profile.HourlyRateSOL = req.HourlyRateSOL
	}
	if req.MinimumProjectSOL != nil {
		profile.MinimumProjectSOL = req.MinimumProjectSOL
	}
	if req.AvailableForHire != nil {
		profile.AvailableForHire = *req.AvailableForHire
	}
	if req.AvailabilityStatus != nil {
		profile.AvailabilityStatus = *req.AvailabilityStatus
	}

	if err := s.profileRepo.Update(ctx, profile); err != nil {
		return nil, err
	}

	return profile, nil
}

// SetProfileSkillsRequest represents a request to set profile skills
type SetProfileSkillsRequest struct {
	Skills []ProfileSkillInput `json:"skills"`
}

type ProfileSkillInput struct {
	SkillID          int     `json:"skill_id"`
	YearsExperience  *int    `json:"years_experience"`
	ProficiencyLevel *string `json:"proficiency_level"`
}

// SetProfileSkills replaces all skills for a profile
func (s *ProfileService) SetProfileSkills(ctx context.Context, userID uuid.UUID, req *SetProfileSkillsRequest) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Validate skills exist
	for _, skillInput := range req.Skills {
		_, err := s.skillRepo.GetByID(ctx, skillInput.SkillID)
		if err != nil {
			if errors.Is(err, apperrors.ErrNotFound) {
				return apperrors.NewBadRequestError("invalid skill ID: " + string(rune(skillInput.SkillID)))
			}
			return err
		}
	}

	// Convert to domain objects
	skills := make([]domain.ProfileSkill, len(req.Skills))
	for i, skillInput := range req.Skills {
		skills[i] = domain.ProfileSkill{
			ProfileID:        profile.ID,
			SkillID:          skillInput.SkillID,
			YearsExperience:  skillInput.YearsExperience,
			ProficiencyLevel: skillInput.ProficiencyLevel,
		}
	}

	return s.profileRepo.SetSkills(ctx, profile.ID, skills)
}

// AddProfileSkill adds a single skill to a profile
func (s *ProfileService) AddProfileSkill(ctx context.Context, userID uuid.UUID, input *ProfileSkillInput) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Validate skill exists
	_, err = s.skillRepo.GetByID(ctx, input.SkillID)
	if err != nil {
		return err
	}

	ps := &domain.ProfileSkill{
		ProfileID:        profile.ID,
		SkillID:          input.SkillID,
		YearsExperience:  input.YearsExperience,
		ProficiencyLevel: input.ProficiencyLevel,
	}

	return s.profileRepo.AddSkill(ctx, ps)
}

// RemoveProfileSkill removes a skill from a profile
func (s *ProfileService) RemoveProfileSkill(ctx context.Context, userID uuid.UUID, skillID int) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	return s.profileRepo.RemoveSkill(ctx, profile.ID, skillID)
}

// SearchProfilesRequest represents a freelancer search request
type SearchProfilesRequest struct {
	Query  string `json:"query"`
	Skills []int  `json:"skills"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}

// SearchProfilesResponse represents a paginated search result
type SearchProfilesResponse struct {
	Profiles []ProfileResponse `json:"profiles"`
	Total    int               `json:"total"`
	Limit    int               `json:"limit"`
	Offset   int               `json:"offset"`
}

// SearchProfiles searches for freelancer profiles
func (s *ProfileService) SearchProfiles(ctx context.Context, req *SearchProfilesRequest) (*SearchProfilesResponse, error) {
	if req.Limit <= 0 || req.Limit > 50 {
		req.Limit = 20
	}
	if req.Offset < 0 {
		req.Offset = 0
	}

	profiles, total, err := s.profileRepo.Search(ctx, req.Query, req.Skills, req.Limit, req.Offset)
	if err != nil {
		return nil, err
	}

	// Build full responses
	responses := make([]ProfileResponse, 0, len(profiles))
	for _, profile := range profiles {
		profileCopy := profile
		resp, err := s.buildProfileResponse(ctx, &profileCopy)
		if err != nil {
			continue
		}
		responses = append(responses, *resp)
	}

	return &SearchProfilesResponse{
		Profiles: responses,
		Total:    total,
		Limit:    req.Limit,
		Offset:   req.Offset,
	}, nil
}

// CreatePortfolioItem creates a new portfolio item
func (s *ProfileService) CreatePortfolioItem(ctx context.Context, userID uuid.UUID, item *domain.PortfolioItem) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	item.ProfileID = profile.ID
	return s.portfolioRepo.Create(ctx, item)
}

// UpdatePortfolioItem updates a portfolio item
func (s *ProfileService) UpdatePortfolioItem(ctx context.Context, userID uuid.UUID, item *domain.PortfolioItem) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify ownership
	existing, err := s.portfolioRepo.GetByID(ctx, item.ID)
	if err != nil {
		return err
	}

	if existing.ProfileID != profile.ID {
		return apperrors.ErrForbidden
	}

	return s.portfolioRepo.Update(ctx, item)
}

// DeletePortfolioItem deletes a portfolio item
func (s *ProfileService) DeletePortfolioItem(ctx context.Context, userID uuid.UUID, itemID uuid.UUID) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify ownership
	existing, err := s.portfolioRepo.GetByID(ctx, itemID)
	if err != nil {
		return err
	}

	if existing.ProfileID != profile.ID {
		return apperrors.ErrForbidden
	}

	return s.portfolioRepo.Delete(ctx, itemID)
}

// GetAllSkills returns all available skills
func (s *ProfileService) GetAllSkills(ctx context.Context) ([]domain.Skill, error) {
	return s.skillRepo.GetAll(ctx)
}

// GetSkillsByCategory returns skills filtered by category
func (s *ProfileService) GetSkillsByCategory(ctx context.Context, category string) ([]domain.Skill, error) {
	return s.skillRepo.GetByCategory(ctx, category)
}

// SearchSkills searches for skills by name
func (s *ProfileService) SearchSkills(ctx context.Context, query string) ([]domain.Skill, error) {
	return s.skillRepo.Search(ctx, query)
}

// ============================================
// Social Links Management
// ============================================

// SetSocialsRequest represents a request to set profile socials
type SetSocialsRequest struct {
	Socials []SocialInput `json:"socials"`
}

type SocialInput struct {
	Platform string `json:"platform"` // website, twitter, telegram, discord
	URL      string `json:"url"`
}

// GetSocials returns social links for a user's profile
func (s *ProfileService) GetSocials(ctx context.Context, userID uuid.UUID) ([]domain.ProfileSocial, error) {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.socialRepo.GetByProfileID(ctx, profile.ID)
}

// SetSocials replaces all social links for a profile
func (s *ProfileService) SetSocials(ctx context.Context, userID uuid.UUID, req *SetSocialsRequest) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Delete existing socials
	if err := s.socialRepo.DeleteAllByProfileID(ctx, profile.ID); err != nil {
		return err
	}

	// Add new socials
	for _, input := range req.Socials {
		if input.URL == "" {
			continue
		}
		social := &domain.ProfileSocial{
			ProfileID: profile.ID,
			Platform:  input.Platform,
			URL:       input.URL,
		}
		if err := s.socialRepo.Upsert(ctx, social); err != nil {
			return err
		}
	}

	return nil
}

// ============================================
// Token Work Management
// ============================================

// GetTokenWork returns token work items for a user's profile
func (s *ProfileService) GetTokenWork(ctx context.Context, userID uuid.UUID) ([]domain.TokenWorkItem, error) {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return s.tokenWorkRepo.GetByProfileID(ctx, profile.ID)
}

// AddTokenWork adds a new token work item and fetches token info from DexScreener
func (s *ProfileService) AddTokenWork(ctx context.Context, userID uuid.UUID, item *domain.TokenWorkItem) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	item.ProfileID = profile.ID

	// Fetch token info from DexScreener
	tokenInfo, err := s.dexScreener.GetTokenInfo(ctx, item.ContractAddress, item.Chain)
	if err != nil {
		// Log the error but don't fail - we can still save with just the contract address
		fmt.Printf("DexScreener fetch failed for %s: %v\n", item.ContractAddress, err)
	} else {
		// Populate token details from DexScreener
		item.TokenName = &tokenInfo.Name
		item.TokenSymbol = &tokenInfo.Symbol
		if tokenInfo.ImageURL != "" {
			item.TokenImageURL = &tokenInfo.ImageURL
		}
		if tokenInfo.ATHMarketCap != nil {
			item.ATHMarketCap = tokenInfo.ATHMarketCap
		}
		now := time.Now()
		item.LastFetchedAt = &now
	}

	return s.tokenWorkRepo.Create(ctx, item)
}

// UpdateTokenWork updates a token work item
func (s *ProfileService) UpdateTokenWork(ctx context.Context, userID uuid.UUID, item *domain.TokenWorkItem) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify ownership
	existing, err := s.tokenWorkRepo.GetByID(ctx, item.ID)
	if err != nil {
		return err
	}

	if existing.ProfileID != profile.ID {
		return apperrors.ErrForbidden
	}

	return s.tokenWorkRepo.Update(ctx, item)
}

// DeleteTokenWork deletes a token work item
func (s *ProfileService) DeleteTokenWork(ctx context.Context, userID uuid.UUID, itemID uuid.UUID) error {
	profile, err := s.profileRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}

	// Verify ownership
	existing, err := s.tokenWorkRepo.GetByID(ctx, itemID)
	if err != nil {
		return err
	}

	if existing.ProfileID != profile.ID {
		return apperrors.ErrForbidden
	}

	return s.tokenWorkRepo.Delete(ctx, itemID)
}
