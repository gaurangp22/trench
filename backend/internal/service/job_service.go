package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
	"github.com/trenchjob/backend/internal/repository"
)

type JobService struct {
	jobRepo      repository.JobRepository
	proposalRepo repository.ProposalRepository
	userRepo     repository.UserRepository
}

func NewJobService(
	jobRepo repository.JobRepository,
	proposalRepo repository.ProposalRepository,
	userRepo repository.UserRepository,
) *JobService {
	return &JobService{
		jobRepo:      jobRepo,
		proposalRepo: proposalRepo,
		userRepo:     userRepo,
	}
}

// CreateJobRequest represents a job creation request
type CreateJobRequest struct {
	Title            string           `json:"title"`
	Description      string           `json:"description"`
	CategoryID       *int             `json:"category_id"`
	PaymentType      string           `json:"payment_type"`
	BudgetMinSOL     *decimal.Decimal `json:"budget_min_sol"`
	BudgetMaxSOL     *decimal.Decimal `json:"budget_max_sol"`
	ExpectedDuration *string          `json:"expected_duration"`
	Complexity       *string          `json:"complexity"`
	Visibility       string           `json:"visibility"`
	Skills           []int            `json:"skills"`
}

// CreateJob creates a new job posting
func (s *JobService) CreateJob(ctx context.Context, clientID uuid.UUID, req *CreateJobRequest) (*domain.Job, error) {
	// Validate required fields
	if req.Title == "" {
		return nil, apperrors.NewBadRequest("title is required")
	}
	if req.Description == "" {
		return nil, apperrors.NewBadRequest("description is required")
	}

	// Verify user is a client
	user, err := s.userRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	if !user.IsClient {
		return nil, apperrors.NewForbidden("only clients can post jobs")
	}

	job := &domain.Job{
		ClientID:         clientID,
		Title:            req.Title,
		Description:      req.Description,
		CategoryID:       req.CategoryID,
		PaymentType:      req.PaymentType,
		BudgetMinSOL:     req.BudgetMinSOL,
		BudgetMaxSOL:     req.BudgetMaxSOL,
		ExpectedDuration: req.ExpectedDuration,
		Complexity:       req.Complexity,
		Visibility:       req.Visibility,
		Status:           domain.JobStatusDraft,
	}

	if job.PaymentType == "" {
		job.PaymentType = domain.PaymentTypeFixed
	}
	if job.Visibility == "" {
		job.Visibility = domain.VisibilityPublic
	}

	if err := s.jobRepo.Create(ctx, job); err != nil {
		return nil, err
	}

	// Add skills if provided
	if len(req.Skills) > 0 {
		if err := s.jobRepo.AddSkills(ctx, job.ID, req.Skills); err != nil {
			// Non-fatal error, log but continue
		}
	}

	return job, nil
}

// GetJob retrieves a job by ID
func (s *JobService) GetJob(ctx context.Context, id uuid.UUID) (*JobDetailResponse, error) {
	job, err := s.jobRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get job skills
	skills, _ := s.jobRepo.GetSkills(ctx, id)

	// Increment view count (fire and forget)
	go s.jobRepo.IncrementViews(ctx, id)

	return &JobDetailResponse{
		Job:    job,
		Skills: skills,
	}, nil
}

type JobDetailResponse struct {
	Job    *domain.Job    `json:"job"`
	Skills []domain.Skill `json:"skills"`
}

// UpdateJobRequest represents a job update request
type UpdateJobRequest struct {
	Title            *string          `json:"title"`
	Description      *string          `json:"description"`
	CategoryID       *int             `json:"category_id"`
	PaymentType      *string          `json:"payment_type"`
	BudgetMinSOL     *decimal.Decimal `json:"budget_min_sol"`
	BudgetMaxSOL     *decimal.Decimal `json:"budget_max_sol"`
	ExpectedDuration *string          `json:"expected_duration"`
	Complexity       *string          `json:"complexity"`
	Visibility       *string          `json:"visibility"`
	Skills           []int            `json:"skills"`
}

// UpdateJob updates a job posting
func (s *JobService) UpdateJob(ctx context.Context, clientID, jobID uuid.UUID, req *UpdateJobRequest) (*domain.Job, error) {
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return nil, err
	}

	// Verify ownership
	if job.ClientID != clientID {
		return nil, apperrors.ErrForbidden
	}

	// Only allow updates to draft or open jobs
	if job.Status != domain.JobStatusDraft && job.Status != domain.JobStatusOpen {
		return nil, apperrors.NewBadRequest("cannot update job in current status")
	}

	// Update fields if provided
	if req.Title != nil {
		job.Title = *req.Title
	}
	if req.Description != nil {
		job.Description = *req.Description
	}
	if req.CategoryID != nil {
		job.CategoryID = req.CategoryID
	}
	if req.PaymentType != nil {
		job.PaymentType = *req.PaymentType
	}
	if req.BudgetMinSOL != nil {
		job.BudgetMinSOL = req.BudgetMinSOL
	}
	if req.BudgetMaxSOL != nil {
		job.BudgetMaxSOL = req.BudgetMaxSOL
	}
	if req.ExpectedDuration != nil {
		job.ExpectedDuration = req.ExpectedDuration
	}
	if req.Complexity != nil {
		job.Complexity = req.Complexity
	}
	if req.Visibility != nil {
		job.Visibility = *req.Visibility
	}

	if err := s.jobRepo.Update(ctx, job); err != nil {
		return nil, err
	}

	// Update skills if provided
	if req.Skills != nil {
		s.jobRepo.RemoveSkills(ctx, jobID)
		if len(req.Skills) > 0 {
			s.jobRepo.AddSkills(ctx, jobID, req.Skills)
		}
	}

	return job, nil
}

// PublishJob publishes a draft job
func (s *JobService) PublishJob(ctx context.Context, clientID, jobID uuid.UUID) error {
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return err
	}

	if job.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	if job.Status != domain.JobStatusDraft {
		return apperrors.NewBadRequest("only draft jobs can be published")
	}

	now := time.Now()
	job.Status = domain.JobStatusOpen
	job.PostedAt = &now

	// Set expiry to 30 days from now
	expiry := now.Add(30 * 24 * time.Hour)
	job.ExpiresAt = &expiry

	return s.jobRepo.Update(ctx, job)
}

// CloseJob closes an open job
func (s *JobService) CloseJob(ctx context.Context, clientID, jobID uuid.UUID) error {
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return err
	}

	if job.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	if job.Status != domain.JobStatusOpen {
		return apperrors.NewBadRequest("only open jobs can be closed")
	}

	job.Status = domain.JobStatusClosed
	return s.jobRepo.Update(ctx, job)
}

// DeleteJob deletes a job
func (s *JobService) DeleteJob(ctx context.Context, clientID, jobID uuid.UUID) error {
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return err
	}

	if job.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	// Only allow deleting draft or closed jobs
	if job.Status != domain.JobStatusDraft && job.Status != domain.JobStatusClosed {
		return apperrors.NewBadRequest("can only delete draft or closed jobs")
	}

	return s.jobRepo.Delete(ctx, jobID)
}

// SearchJobsRequest represents a job search request
type SearchJobsRequest struct {
	Query      string `json:"query"`
	CategoryID *int   `json:"category_id"`
	Skills     []int  `json:"skills"`
	Status     string `json:"status"`
	Limit      int    `json:"limit"`
	Offset     int    `json:"offset"`
}

// SearchJobsResponse represents a paginated job search result
type SearchJobsResponse struct {
	Jobs   []domain.Job `json:"jobs"`
	Total  int          `json:"total"`
	Limit  int          `json:"limit"`
	Offset int          `json:"offset"`
}

// SearchJobs searches for jobs
func (s *JobService) SearchJobs(ctx context.Context, req *SearchJobsRequest) (*SearchJobsResponse, error) {
	if req.Limit <= 0 || req.Limit > 50 {
		req.Limit = 20
	}
	if req.Offset < 0 {
		req.Offset = 0
	}

	jobs, total, err := s.jobRepo.Search(ctx, req.Query, req.CategoryID, req.Skills, req.Status, req.Limit, req.Offset)
	if err != nil {
		return nil, err
	}

	return &SearchJobsResponse{
		Jobs:   jobs,
		Total:  total,
		Limit:  req.Limit,
		Offset: req.Offset,
	}, nil
}

// GetClientJobs gets all jobs for a client
func (s *JobService) GetClientJobs(ctx context.Context, clientID uuid.UUID, limit, offset int) (*SearchJobsResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	jobs, total, err := s.jobRepo.GetByClientID(ctx, clientID, limit, offset)
	if err != nil {
		return nil, err
	}

	return &SearchJobsResponse{
		Jobs:   jobs,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}, nil
}

// ========================================
// Proposal Methods
// ========================================

// CreateProposalRequest represents a proposal submission
type CreateProposalRequest struct {
	CoverLetter       string           `json:"cover_letter"`
	ProposedRateSOL   *decimal.Decimal `json:"proposed_rate_sol"`
	ProposedAmountSOL *decimal.Decimal `json:"proposed_amount_sol"`
	EstimatedDuration *string          `json:"estimated_duration"`
}

// SubmitProposal submits a proposal to a job
func (s *JobService) SubmitProposal(ctx context.Context, freelancerID, jobID uuid.UUID, req *CreateProposalRequest) (*domain.Proposal, error) {
	// Verify user is a freelancer
	user, err := s.userRepo.GetByID(ctx, freelancerID)
	if err != nil {
		return nil, err
	}
	if !user.IsFreelancer {
		return nil, apperrors.NewForbidden("only freelancers can submit proposals")
	}

	// Verify job exists and is open
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return nil, err
	}
	if job.Status != domain.JobStatusOpen {
		return nil, apperrors.NewBadRequest("job is not accepting proposals")
	}

	// Check for existing proposal
	exists, err := s.proposalRepo.Exists(ctx, jobID, freelancerID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperrors.NewConflict("you have already submitted a proposal for this job")
	}

	proposal := &domain.Proposal{
		JobID:             jobID,
		FreelancerID:      freelancerID,
		CoverLetter:       req.CoverLetter,
		ProposedRateSOL:   req.ProposedRateSOL,
		ProposedAmountSOL: req.ProposedAmountSOL,
		EstimatedDuration: req.EstimatedDuration,
		Status:            domain.ProposalStatusSubmitted,
	}

	if err := s.proposalRepo.Create(ctx, proposal); err != nil {
		return nil, err
	}

	return proposal, nil
}

// GetProposal retrieves a proposal by ID
func (s *JobService) GetProposal(ctx context.Context, userID, proposalID uuid.UUID) (*domain.Proposal, error) {
	proposal, err := s.proposalRepo.GetByID(ctx, proposalID)
	if err != nil {
		return nil, err
	}

	// Verify the user has access (either the freelancer or the job's client)
	job, err := s.jobRepo.GetByID(ctx, proposal.JobID)
	if err != nil {
		return nil, err
	}

	if proposal.FreelancerID != userID && job.ClientID != userID {
		return nil, apperrors.ErrForbidden
	}

	return proposal, nil
}

// GetJobProposals gets all proposals for a job (client only)
func (s *JobService) GetJobProposals(ctx context.Context, clientID, jobID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error) {
	// Verify the client owns the job
	job, err := s.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return nil, 0, err
	}
	if job.ClientID != clientID {
		return nil, 0, apperrors.ErrForbidden
	}

	return s.proposalRepo.GetByJobID(ctx, jobID, limit, offset)
}

// GetFreelancerProposals gets all proposals submitted by a freelancer
func (s *JobService) GetFreelancerProposals(ctx context.Context, freelancerID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error) {
	return s.proposalRepo.GetByFreelancerID(ctx, freelancerID, limit, offset)
}

// UpdateProposalStatus updates the status of a proposal
func (s *JobService) UpdateProposalStatus(ctx context.Context, clientID, proposalID uuid.UUID, status string) error {
	proposal, err := s.proposalRepo.GetByID(ctx, proposalID)
	if err != nil {
		return err
	}

	// Verify the client owns the job
	job, err := s.jobRepo.GetByID(ctx, proposal.JobID)
	if err != nil {
		return err
	}
	if job.ClientID != clientID {
		return apperrors.ErrForbidden
	}

	// Validate status transition
	validStatuses := map[string]bool{
		domain.ProposalStatusViewed:     true,
		domain.ProposalStatusShortlisted: true,
		domain.ProposalStatusRejected:   true,
	}
	if !validStatuses[status] {
		return apperrors.NewBadRequest("invalid proposal status")
	}

	proposal.Status = status
	return s.proposalRepo.Update(ctx, proposal)
}

// WithdrawProposal allows a freelancer to withdraw their proposal
func (s *JobService) WithdrawProposal(ctx context.Context, freelancerID, proposalID uuid.UUID) error {
	proposal, err := s.proposalRepo.GetByID(ctx, proposalID)
	if err != nil {
		return err
	}

	if proposal.FreelancerID != freelancerID {
		return apperrors.ErrForbidden
	}

	// Can only withdraw submitted, viewed, or shortlisted proposals
	withdrawable := map[string]bool{
		domain.ProposalStatusSubmitted:   true,
		domain.ProposalStatusViewed:      true,
		domain.ProposalStatusShortlisted: true,
	}
	if !withdrawable[proposal.Status] {
		return apperrors.NewBadRequest("cannot withdraw proposal in current status")
	}

	proposal.Status = domain.ProposalStatusWithdrawn
	return s.proposalRepo.Update(ctx, proposal)
}

// AcceptProposal accepts a proposal and creates a contract
func (s *JobService) AcceptProposal(ctx context.Context, clientID, proposalID uuid.UUID) (*domain.Proposal, error) {
	proposal, err := s.proposalRepo.GetByID(ctx, proposalID)
	if err != nil {
		return nil, err
	}

	// Verify ownership
	job, err := s.jobRepo.GetByID(ctx, proposal.JobID)
	if err != nil {
		return nil, err
	}
	if job.ClientID != clientID {
		return nil, apperrors.ErrForbidden
	}

	// Verify status
	if proposal.Status != domain.ProposalStatusSubmitted &&
		proposal.Status != domain.ProposalStatusViewed &&
		proposal.Status != domain.ProposalStatusShortlisted {
		return nil, apperrors.NewBadRequest("cannot accept proposal in current status")
	}

	proposal.Status = domain.ProposalStatusAccepted
	if err := s.proposalRepo.Update(ctx, proposal); err != nil {
		return nil, err
	}

	// Update job status to in_progress
	job.Status = domain.JobStatusInProgress
	s.jobRepo.Update(ctx, job)

	return proposal, nil
}
