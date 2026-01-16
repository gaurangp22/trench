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

type ContractService struct {
	contractRepo  repository.ContractRepository
	milestoneRepo repository.MilestoneRepository
	escrowRepo    repository.EscrowRepository
	paymentRepo   repository.PaymentRepository
	proposalRepo  repository.ProposalRepository
	jobRepo       repository.JobRepository
	userRepo      repository.UserRepository
}

func NewContractService(
	contractRepo repository.ContractRepository,
	milestoneRepo repository.MilestoneRepository,
	escrowRepo repository.EscrowRepository,
	paymentRepo repository.PaymentRepository,
	proposalRepo repository.ProposalRepository,
	jobRepo repository.JobRepository,
	userRepo repository.UserRepository,
) *ContractService {
	return &ContractService{
		contractRepo:  contractRepo,
		milestoneRepo: milestoneRepo,
		escrowRepo:    escrowRepo,
		paymentRepo:   paymentRepo,
		proposalRepo:  proposalRepo,
		jobRepo:       jobRepo,
		userRepo:      userRepo,
	}
}

// CreateContractRequest represents the request to create a contract (hire a freelancer)
type CreateContractRequest struct {
	ProposalID  uuid.UUID           `json:"proposal_id"`
	Title       string              `json:"title"`
	Description *string             `json:"description,omitempty"`
	Milestones  []CreateMilestoneRequest `json:"milestones"`
}

type CreateMilestoneRequest struct {
	Title       string          `json:"title"`
	Description *string         `json:"description,omitempty"`
	AmountSOL   decimal.Decimal `json:"amount_sol"`
	DueDate     *time.Time      `json:"due_date,omitempty"`
}

// ContractResponse represents a contract response with related data
type ContractResponse struct {
	Contract   *domain.Contract   `json:"contract"`
	Milestones []domain.Milestone `json:"milestones"`
	Escrow     *domain.Escrow     `json:"escrow,omitempty"`
	Payments   []domain.Payment   `json:"payments,omitempty"`
}

// HireFreelancer creates a contract from an accepted proposal
func (s *ContractService) HireFreelancer(ctx context.Context, clientID uuid.UUID, req *CreateContractRequest) (*ContractResponse, error) {
	// Get the proposal
	proposal, err := s.proposalRepo.GetByID(ctx, req.ProposalID)
	if err != nil {
		return nil, err
	}

	// Get the job to verify ownership
	job, err := s.jobRepo.GetByID(ctx, proposal.JobID)
	if err != nil {
		return nil, err
	}

	// Verify the client owns the job
	if job.ClientID != clientID {
		return nil, apperrors.NewForbidden("you do not own this job")
	}

	// Check job status
	if job.Status != domain.JobStatusOpen {
		return nil, apperrors.NewBadRequest("job is not open for hiring")
	}

	// Calculate total amount from milestones
	totalAmount := decimal.Zero
	for _, m := range req.Milestones {
		totalAmount = totalAmount.Add(m.AmountSOL)
	}

	// Get client wallet
	client, err := s.userRepo.GetByID(ctx, clientID)
	if err != nil {
		return nil, err
	}
	if client.PrimaryWalletAddress == nil {
		return nil, apperrors.NewBadRequest("client must have a verified wallet")
	}

	// Get freelancer wallet
	freelancer, err := s.userRepo.GetByID(ctx, proposal.FreelancerID)
	if err != nil {
		return nil, err
	}
	if freelancer.PrimaryWalletAddress == nil {
		return nil, apperrors.NewBadRequest("freelancer must have a verified wallet")
	}

	// Create the contract
	contract := &domain.Contract{
		ProposalID:        &proposal.ID,
		JobID:             job.ID,
		ClientID:          clientID,
		FreelancerID:      proposal.FreelancerID,
		Title:             req.Title,
		Description:       req.Description,
		PaymentType:       job.PaymentType,
		TotalAmountSOL:    totalAmount,
		EscrowAmountSOL:   decimal.Zero,
		ReleasedAmountSOL: decimal.Zero,
		Status:            domain.ContractStatusPending,
	}

	if err := s.contractRepo.Create(ctx, contract); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Create milestones
	var milestones []domain.Milestone
	for i, m := range req.Milestones {
		milestone := &domain.Milestone{
			ContractID:  contract.ID,
			Title:       m.Title,
			Description: m.Description,
			AmountSOL:   m.AmountSOL,
			DueDate:     m.DueDate,
			SortOrder:   i + 1,
			Status:      domain.MilestoneStatusPending,
		}
		if err := s.milestoneRepo.Create(ctx, milestone); err != nil {
			return nil, apperrors.NewInternal(err)
		}
		milestones = append(milestones, *milestone)
	}

	// Update proposal status to accepted
	proposal.Status = domain.ProposalStatusAccepted
	if err := s.proposalRepo.Update(ctx, proposal); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Update job status to in_progress
	job.Status = domain.JobStatusInProgress
	if err := s.jobRepo.Update(ctx, job); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return &ContractResponse{
		Contract:   contract,
		Milestones: milestones,
	}, nil
}

// GetContract returns a contract with all related data
func (s *ContractService) GetContract(ctx context.Context, contractID, userID uuid.UUID) (*ContractResponse, error) {
	contract, err := s.contractRepo.GetByID(ctx, contractID)
	if err != nil {
		return nil, err
	}

	// Verify user is part of the contract
	if contract.ClientID != userID && contract.FreelancerID != userID {
		return nil, apperrors.NewForbidden("you are not part of this contract")
	}

	// Get milestones
	milestones, err := s.milestoneRepo.GetByContractID(ctx, contractID)
	if err != nil {
		return nil, err
	}

	// Get escrow if exists
	escrow, _ := s.escrowRepo.GetByContractID(ctx, contractID)

	// Get payments
	payments, _ := s.paymentRepo.GetByContractID(ctx, contractID)

	return &ContractResponse{
		Contract:   contract,
		Milestones: milestones,
		Escrow:     escrow,
		Payments:   payments,
	}, nil
}

// ListContractsRequest represents the request to list contracts
type ListContractsRequest struct {
	Status string `json:"status"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}

// ListContractsResponse represents the response for listing contracts
type ListContractsResponse struct {
	Contracts []domain.Contract `json:"contracts"`
	Total     int               `json:"total"`
}

// ListContractsAsClient returns contracts where user is the client
func (s *ContractService) ListContractsAsClient(ctx context.Context, clientID uuid.UUID, req *ListContractsRequest) (*ListContractsResponse, error) {
	if req.Limit <= 0 {
		req.Limit = 20
	}

	contracts, total, err := s.contractRepo.GetByClientID(ctx, clientID, req.Status, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Get milestones for each contract
	for i := range contracts {
		milestones, _ := s.milestoneRepo.GetByContractID(ctx, contracts[i].ID)
		contracts[i].Milestones = milestones
	}

	return &ListContractsResponse{
		Contracts: contracts,
		Total:     total,
	}, nil
}

// ListContractsAsFreelancer returns contracts where user is the freelancer
func (s *ContractService) ListContractsAsFreelancer(ctx context.Context, freelancerID uuid.UUID, req *ListContractsRequest) (*ListContractsResponse, error) {
	if req.Limit <= 0 {
		req.Limit = 20
	}

	contracts, total, err := s.contractRepo.GetByFreelancerID(ctx, freelancerID, req.Status, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Get milestones for each contract
	for i := range contracts {
		milestones, _ := s.milestoneRepo.GetByContractID(ctx, contracts[i].ID)
		contracts[i].Milestones = milestones
	}

	return &ListContractsResponse{
		Contracts: contracts,
		Total:     total,
	}, nil
}

// AddMilestone adds a milestone to a contract
func (s *ContractService) AddMilestone(ctx context.Context, contractID, clientID uuid.UUID, req *CreateMilestoneRequest) (*domain.Milestone, error) {
	contract, err := s.contractRepo.GetByID(ctx, contractID)
	if err != nil {
		return nil, err
	}

	// Verify ownership
	if contract.ClientID != clientID {
		return nil, apperrors.NewForbidden("you are not the client for this contract")
	}

	// Get existing milestones to determine sort order
	milestones, err := s.milestoneRepo.GetByContractID(ctx, contractID)
	if err != nil {
		return nil, err
	}

	milestone := &domain.Milestone{
		ContractID:  contractID,
		Title:       req.Title,
		Description: req.Description,
		AmountSOL:   req.AmountSOL,
		DueDate:     req.DueDate,
		SortOrder:   len(milestones) + 1,
		Status:      domain.MilestoneStatusPending,
	}

	if err := s.milestoneRepo.Create(ctx, milestone); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	// Update contract total amount
	contract.TotalAmountSOL = contract.TotalAmountSOL.Add(req.AmountSOL)
	if err := s.contractRepo.Update(ctx, contract); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return milestone, nil
}

// SubmitMilestoneRequest represents the request to submit work for a milestone
type SubmitMilestoneRequest struct {
	SubmissionText string   `json:"submission_text"`
	SubmissionURLs []string `json:"submission_urls,omitempty"`
}

// SubmitMilestone marks a milestone as submitted with deliverables
func (s *ContractService) SubmitMilestone(ctx context.Context, milestoneID, freelancerID uuid.UUID, req *SubmitMilestoneRequest) (*domain.Milestone, error) {
	milestone, err := s.milestoneRepo.GetByID(ctx, milestoneID)
	if err != nil {
		return nil, err
	}

	// Get contract to verify ownership
	contract, err := s.contractRepo.GetByID(ctx, milestone.ContractID)
	if err != nil {
		return nil, err
	}

	if contract.FreelancerID != freelancerID {
		return nil, apperrors.NewForbidden("you are not the freelancer for this contract")
	}

	// Verify milestone can be submitted
	if milestone.Status != domain.MilestoneStatusPending && milestone.Status != domain.MilestoneStatusInProgress && milestone.Status != domain.MilestoneStatusRevisionRequested {
		return nil, apperrors.NewBadRequest("milestone cannot be submitted in current status")
	}

	now := time.Now()
	milestone.Status = domain.MilestoneStatusSubmitted
	milestone.SubmissionText = &req.SubmissionText
	milestone.SubmissionURLs = req.SubmissionURLs
	milestone.SubmittedAt = &now

	if err := s.milestoneRepo.Update(ctx, milestone); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return milestone, nil
}

// ApproveMilestone approves a submitted milestone
func (s *ContractService) ApproveMilestone(ctx context.Context, milestoneID, clientID uuid.UUID) (*domain.Milestone, error) {
	milestone, err := s.milestoneRepo.GetByID(ctx, milestoneID)
	if err != nil {
		return nil, err
	}

	// Get contract to verify ownership
	contract, err := s.contractRepo.GetByID(ctx, milestone.ContractID)
	if err != nil {
		return nil, err
	}

	if contract.ClientID != clientID {
		return nil, apperrors.NewForbidden("you are not the client for this contract")
	}

	// Verify milestone is submitted
	if milestone.Status != domain.MilestoneStatusSubmitted {
		return nil, apperrors.NewBadRequest("milestone is not submitted")
	}

	now := time.Now()
	milestone.Status = domain.MilestoneStatusApproved
	milestone.ApprovedAt = &now

	if err := s.milestoneRepo.Update(ctx, milestone); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return milestone, nil
}

// RequestMilestoneRevision requests revision for a submitted milestone
type RequestRevisionRequest struct {
	Notes string `json:"notes"`
}

func (s *ContractService) RequestMilestoneRevision(ctx context.Context, milestoneID, clientID uuid.UUID, req *RequestRevisionRequest) (*domain.Milestone, error) {
	milestone, err := s.milestoneRepo.GetByID(ctx, milestoneID)
	if err != nil {
		return nil, err
	}

	// Get contract to verify ownership
	contract, err := s.contractRepo.GetByID(ctx, milestone.ContractID)
	if err != nil {
		return nil, err
	}

	if contract.ClientID != clientID {
		return nil, apperrors.NewForbidden("you are not the client for this contract")
	}

	// Verify milestone is submitted
	if milestone.Status != domain.MilestoneStatusSubmitted {
		return nil, apperrors.NewBadRequest("milestone is not submitted")
	}

	milestone.Status = domain.MilestoneStatusRevisionRequested

	if err := s.milestoneRepo.Update(ctx, milestone); err != nil {
		return nil, apperrors.NewInternal(err)
	}

	return milestone, nil
}

// ActivateContract marks a contract as active (after escrow is funded)
func (s *ContractService) ActivateContract(ctx context.Context, contractID uuid.UUID) error {
	contract, err := s.contractRepo.GetByID(ctx, contractID)
	if err != nil {
		return err
	}

	if contract.Status != domain.ContractStatusPending {
		return apperrors.NewBadRequest("contract is not in pending status")
	}

	now := time.Now()
	contract.Status = domain.ContractStatusActive
	contract.StartedAt = &now

	// Set first milestone to in_progress
	milestones, err := s.milestoneRepo.GetByContractID(ctx, contractID)
	if err != nil {
		return err
	}
	if len(milestones) > 0 {
		milestones[0].Status = domain.MilestoneStatusInProgress
		if err := s.milestoneRepo.Update(ctx, &milestones[0]); err != nil {
			return err
		}
	}

	return s.contractRepo.Update(ctx, contract)
}

// CompleteContract marks a contract as completed
func (s *ContractService) CompleteContract(ctx context.Context, contractID, userID uuid.UUID) error {
	contract, err := s.contractRepo.GetByID(ctx, contractID)
	if err != nil {
		return err
	}

	// Verify user is part of contract
	if contract.ClientID != userID && contract.FreelancerID != userID {
		return apperrors.NewForbidden("you are not part of this contract")
	}

	// Check all milestones are paid
	milestones, err := s.milestoneRepo.GetByContractID(ctx, contractID)
	if err != nil {
		return err
	}

	for _, m := range milestones {
		if m.Status != domain.MilestoneStatusPaid && m.Status != domain.MilestoneStatusCancelled {
			return apperrors.NewBadRequest("all milestones must be paid or cancelled before completing contract")
		}
	}

	now := time.Now()
	contract.Status = domain.ContractStatusCompleted
	contract.EndedAt = &now

	// Update the associated job
	job, _ := s.jobRepo.GetByID(ctx, contract.JobID)
	if job != nil {
		job.Status = domain.JobStatusCompleted
		s.jobRepo.Update(ctx, job)
	}

	return s.contractRepo.Update(ctx, contract)
}
