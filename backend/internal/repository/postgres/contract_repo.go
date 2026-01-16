package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
)

type ContractRepository struct {
	db *pgxpool.Pool
}

func NewContractRepository(db *pgxpool.Pool) *ContractRepository {
	return &ContractRepository{db: db}
}

func (r *ContractRepository) Create(ctx context.Context, contract *domain.Contract) error {
	query := `
		INSERT INTO contracts (
			id, proposal_id, job_id, client_id, freelancer_id, title, description,
			payment_type, total_amount_sol, hourly_rate_sol, weekly_hour_limit,
			escrow_account_address, escrow_amount_sol, released_amount_sol,
			status, started_at, ended_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		)`

	contract.ID = uuid.New()
	contract.CreatedAt = time.Now()
	contract.UpdatedAt = time.Now()
	if contract.Status == "" {
		contract.Status = domain.ContractStatusPending
	}

	_, err := r.db.Exec(ctx, query,
		contract.ID, contract.ProposalID, contract.JobID, contract.ClientID, contract.FreelancerID,
		contract.Title, contract.Description, contract.PaymentType, contract.TotalAmountSOL,
		contract.HourlyRateSOL, contract.WeeklyHourLimit, contract.EscrowAccountAddress,
		contract.EscrowAmountSOL, contract.ReleasedAmountSOL, contract.Status,
		contract.StartedAt, contract.EndedAt, contract.CreatedAt, contract.UpdatedAt,
	)

	return err
}

func (r *ContractRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Contract, error) {
	query := `
		SELECT c.id, c.proposal_id, c.job_id, c.client_id, c.freelancer_id, c.title, c.description,
			   c.payment_type, c.total_amount_sol, c.hourly_rate_sol, c.weekly_hour_limit,
			   c.escrow_account_address, c.escrow_amount_sol, c.released_amount_sol,
			   c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
			   u1.username as client_username, u2.username as freelancer_username
		FROM contracts c
		JOIN users u1 ON c.client_id = u1.id
		JOIN users u2 ON c.freelancer_id = u2.id
		WHERE c.id = $1`

	contract := &domain.Contract{}
	var clientUsername, freelancerUsername string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&contract.ID, &contract.ProposalID, &contract.JobID, &contract.ClientID, &contract.FreelancerID,
		&contract.Title, &contract.Description, &contract.PaymentType, &contract.TotalAmountSOL,
		&contract.HourlyRateSOL, &contract.WeeklyHourLimit, &contract.EscrowAccountAddress,
		&contract.EscrowAmountSOL, &contract.ReleasedAmountSOL, &contract.Status,
		&contract.StartedAt, &contract.EndedAt, &contract.CreatedAt, &contract.UpdatedAt,
		&clientUsername, &freelancerUsername,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return contract, err
}

func (r *ContractRepository) GetByClientID(ctx context.Context, clientID uuid.UUID, status string, limit, offset int) ([]domain.Contract, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	conditions = append(conditions, fmt.Sprintf("c.client_id = $%d", argNum))
	args = append(args, clientID)
	argNum++

	if status != "" && status != "all" {
		conditions = append(conditions, fmt.Sprintf("c.status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	whereClause := " WHERE " + strings.Join(conditions, " AND ")

	// Count query
	countQuery := `SELECT COUNT(*) FROM contracts c` + whereClause
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := `
		SELECT c.id, c.proposal_id, c.job_id, c.client_id, c.freelancer_id, c.title, c.description,
			   c.payment_type, c.total_amount_sol, c.hourly_rate_sol, c.weekly_hour_limit,
			   c.escrow_account_address, c.escrow_amount_sol, c.released_amount_sol,
			   c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
			   u.username as freelancer_username
		FROM contracts c
		JOIN users u ON c.freelancer_id = u.id` +
		whereClause +
		fmt.Sprintf(` ORDER BY c.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var contracts []domain.Contract
	for rows.Next() {
		var contract domain.Contract
		var freelancerUsername string
		if err := rows.Scan(
			&contract.ID, &contract.ProposalID, &contract.JobID, &contract.ClientID, &contract.FreelancerID,
			&contract.Title, &contract.Description, &contract.PaymentType, &contract.TotalAmountSOL,
			&contract.HourlyRateSOL, &contract.WeeklyHourLimit, &contract.EscrowAccountAddress,
			&contract.EscrowAmountSOL, &contract.ReleasedAmountSOL, &contract.Status,
			&contract.StartedAt, &contract.EndedAt, &contract.CreatedAt, &contract.UpdatedAt,
			&freelancerUsername,
		); err != nil {
			return nil, 0, err
		}
		contracts = append(contracts, contract)
	}

	return contracts, total, rows.Err()
}

func (r *ContractRepository) GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) ([]domain.Contract, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	conditions = append(conditions, fmt.Sprintf("c.freelancer_id = $%d", argNum))
	args = append(args, freelancerID)
	argNum++

	if status != "" && status != "all" {
		conditions = append(conditions, fmt.Sprintf("c.status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	whereClause := " WHERE " + strings.Join(conditions, " AND ")

	// Count query
	countQuery := `SELECT COUNT(*) FROM contracts c` + whereClause
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Main query
	query := `
		SELECT c.id, c.proposal_id, c.job_id, c.client_id, c.freelancer_id, c.title, c.description,
			   c.payment_type, c.total_amount_sol, c.hourly_rate_sol, c.weekly_hour_limit,
			   c.escrow_account_address, c.escrow_amount_sol, c.released_amount_sol,
			   c.status, c.started_at, c.ended_at, c.created_at, c.updated_at,
			   u.username as client_username
		FROM contracts c
		JOIN users u ON c.client_id = u.id` +
		whereClause +
		fmt.Sprintf(` ORDER BY c.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var contracts []domain.Contract
	for rows.Next() {
		var contract domain.Contract
		var clientUsername string
		if err := rows.Scan(
			&contract.ID, &contract.ProposalID, &contract.JobID, &contract.ClientID, &contract.FreelancerID,
			&contract.Title, &contract.Description, &contract.PaymentType, &contract.TotalAmountSOL,
			&contract.HourlyRateSOL, &contract.WeeklyHourLimit, &contract.EscrowAccountAddress,
			&contract.EscrowAmountSOL, &contract.ReleasedAmountSOL, &contract.Status,
			&contract.StartedAt, &contract.EndedAt, &contract.CreatedAt, &contract.UpdatedAt,
			&clientUsername,
		); err != nil {
			return nil, 0, err
		}
		contracts = append(contracts, contract)
	}

	return contracts, total, rows.Err()
}

func (r *ContractRepository) Update(ctx context.Context, contract *domain.Contract) error {
	query := `
		UPDATE contracts SET
			title = $2, description = $3, payment_type = $4, total_amount_sol = $5,
			hourly_rate_sol = $6, weekly_hour_limit = $7, escrow_account_address = $8,
			escrow_amount_sol = $9, released_amount_sol = $10, status = $11,
			started_at = $12, ended_at = $13, updated_at = $14
		WHERE id = $1`

	contract.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		contract.ID, contract.Title, contract.Description, contract.PaymentType,
		contract.TotalAmountSOL, contract.HourlyRateSOL, contract.WeeklyHourLimit,
		contract.EscrowAccountAddress, contract.EscrowAmountSOL, contract.ReleasedAmountSOL,
		contract.Status, contract.StartedAt, contract.EndedAt, contract.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// MilestoneRepository implementation
type MilestoneRepository struct {
	db *pgxpool.Pool
}

func NewMilestoneRepository(db *pgxpool.Pool) *MilestoneRepository {
	return &MilestoneRepository{db: db}
}

func (r *MilestoneRepository) Create(ctx context.Context, milestone *domain.Milestone) error {
	query := `
		INSERT INTO milestones (
			id, contract_id, title, description, amount_sol, due_date, sort_order,
			status, submission_text, submission_urls, submitted_at, approved_at,
			payment_id, paid_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)`

	milestone.ID = uuid.New()
	milestone.CreatedAt = time.Now()
	milestone.UpdatedAt = time.Now()
	if milestone.Status == "" {
		milestone.Status = domain.MilestoneStatusPending
	}

	_, err := r.db.Exec(ctx, query,
		milestone.ID, milestone.ContractID, milestone.Title, milestone.Description,
		milestone.AmountSOL, milestone.DueDate, milestone.SortOrder, milestone.Status,
		milestone.SubmissionText, milestone.SubmissionURLs, milestone.SubmittedAt,
		milestone.ApprovedAt, milestone.PaymentID, milestone.PaidAt,
		milestone.CreatedAt, milestone.UpdatedAt,
	)

	return err
}

func (r *MilestoneRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Milestone, error) {
	query := `
		SELECT id, contract_id, title, description, amount_sol, due_date, sort_order,
			   status, submission_text, submission_urls, submitted_at, approved_at,
			   payment_id, paid_at, created_at, updated_at
		FROM milestones
		WHERE id = $1`

	milestone := &domain.Milestone{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&milestone.ID, &milestone.ContractID, &milestone.Title, &milestone.Description,
		&milestone.AmountSOL, &milestone.DueDate, &milestone.SortOrder, &milestone.Status,
		&milestone.SubmissionText, &milestone.SubmissionURLs, &milestone.SubmittedAt,
		&milestone.ApprovedAt, &milestone.PaymentID, &milestone.PaidAt,
		&milestone.CreatedAt, &milestone.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return milestone, err
}

func (r *MilestoneRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Milestone, error) {
	query := `
		SELECT id, contract_id, title, description, amount_sol, due_date, sort_order,
			   status, submission_text, submission_urls, submitted_at, approved_at,
			   payment_id, paid_at, created_at, updated_at
		FROM milestones
		WHERE contract_id = $1
		ORDER BY sort_order ASC`

	rows, err := r.db.Query(ctx, query, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var milestones []domain.Milestone
	for rows.Next() {
		var milestone domain.Milestone
		if err := rows.Scan(
			&milestone.ID, &milestone.ContractID, &milestone.Title, &milestone.Description,
			&milestone.AmountSOL, &milestone.DueDate, &milestone.SortOrder, &milestone.Status,
			&milestone.SubmissionText, &milestone.SubmissionURLs, &milestone.SubmittedAt,
			&milestone.ApprovedAt, &milestone.PaymentID, &milestone.PaidAt,
			&milestone.CreatedAt, &milestone.UpdatedAt,
		); err != nil {
			return nil, err
		}
		milestones = append(milestones, milestone)
	}

	return milestones, rows.Err()
}

func (r *MilestoneRepository) Update(ctx context.Context, milestone *domain.Milestone) error {
	query := `
		UPDATE milestones SET
			title = $2, description = $3, amount_sol = $4, due_date = $5,
			sort_order = $6, status = $7, submission_text = $8, submission_urls = $9,
			submitted_at = $10, approved_at = $11, payment_id = $12, paid_at = $13, updated_at = $14
		WHERE id = $1`

	milestone.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		milestone.ID, milestone.Title, milestone.Description, milestone.AmountSOL,
		milestone.DueDate, milestone.SortOrder, milestone.Status, milestone.SubmissionText,
		milestone.SubmissionURLs, milestone.SubmittedAt, milestone.ApprovedAt,
		milestone.PaymentID, milestone.PaidAt, milestone.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *MilestoneRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM milestones WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// EscrowRepository implementation
type EscrowRepository struct {
	db *pgxpool.Pool
}

func NewEscrowRepository(db *pgxpool.Pool) *EscrowRepository {
	return &EscrowRepository{db: db}
}

func (r *EscrowRepository) Create(ctx context.Context, escrow *domain.Escrow) error {
	query := `
		INSERT INTO escrows (
			id, contract_id, escrow_pda, vault_address, client_wallet, freelancer_wallet,
			total_amount_sol, funded_amount_sol, released_amount_sol, refunded_amount_sol,
			status, init_tx_signature, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)`

	escrow.ID = uuid.New()
	escrow.CreatedAt = time.Now()
	escrow.UpdatedAt = time.Now()
	if escrow.Status == "" {
		escrow.Status = domain.EscrowStatusCreated
	}

	_, err := r.db.Exec(ctx, query,
		escrow.ID, escrow.ContractID, escrow.EscrowPDA, escrow.VaultAddress,
		escrow.ClientWallet, escrow.FreelancerWallet, escrow.TotalAmountSOL,
		escrow.FundedAmountSOL, escrow.ReleasedAmountSOL, escrow.RefundedAmountSOL,
		escrow.Status, escrow.InitTxSignature, escrow.CreatedAt, escrow.UpdatedAt,
	)

	return err
}

func (r *EscrowRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Escrow, error) {
	query := `
		SELECT id, contract_id, escrow_pda, vault_address, client_wallet, freelancer_wallet,
			   total_amount_sol, funded_amount_sol, released_amount_sol, refunded_amount_sol,
			   status, init_tx_signature, created_at, updated_at
		FROM escrows
		WHERE id = $1`

	escrow := &domain.Escrow{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&escrow.ID, &escrow.ContractID, &escrow.EscrowPDA, &escrow.VaultAddress,
		&escrow.ClientWallet, &escrow.FreelancerWallet, &escrow.TotalAmountSOL,
		&escrow.FundedAmountSOL, &escrow.ReleasedAmountSOL, &escrow.RefundedAmountSOL,
		&escrow.Status, &escrow.InitTxSignature, &escrow.CreatedAt, &escrow.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return escrow, err
}

func (r *EscrowRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) (*domain.Escrow, error) {
	query := `
		SELECT id, contract_id, escrow_pda, vault_address, client_wallet, freelancer_wallet,
			   total_amount_sol, funded_amount_sol, released_amount_sol, refunded_amount_sol,
			   status, init_tx_signature, created_at, updated_at
		FROM escrows
		WHERE contract_id = $1`

	escrow := &domain.Escrow{}
	err := r.db.QueryRow(ctx, query, contractID).Scan(
		&escrow.ID, &escrow.ContractID, &escrow.EscrowPDA, &escrow.VaultAddress,
		&escrow.ClientWallet, &escrow.FreelancerWallet, &escrow.TotalAmountSOL,
		&escrow.FundedAmountSOL, &escrow.ReleasedAmountSOL, &escrow.RefundedAmountSOL,
		&escrow.Status, &escrow.InitTxSignature, &escrow.CreatedAt, &escrow.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return escrow, err
}

func (r *EscrowRepository) GetByPDA(ctx context.Context, pda string) (*domain.Escrow, error) {
	query := `
		SELECT id, contract_id, escrow_pda, vault_address, client_wallet, freelancer_wallet,
			   total_amount_sol, funded_amount_sol, released_amount_sol, refunded_amount_sol,
			   status, init_tx_signature, created_at, updated_at
		FROM escrows
		WHERE escrow_pda = $1`

	escrow := &domain.Escrow{}
	err := r.db.QueryRow(ctx, query, pda).Scan(
		&escrow.ID, &escrow.ContractID, &escrow.EscrowPDA, &escrow.VaultAddress,
		&escrow.ClientWallet, &escrow.FreelancerWallet, &escrow.TotalAmountSOL,
		&escrow.FundedAmountSOL, &escrow.ReleasedAmountSOL, &escrow.RefundedAmountSOL,
		&escrow.Status, &escrow.InitTxSignature, &escrow.CreatedAt, &escrow.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return escrow, err
}

func (r *EscrowRepository) Update(ctx context.Context, escrow *domain.Escrow) error {
	query := `
		UPDATE escrows SET
			escrow_pda = $2, vault_address = $3, client_wallet = $4, freelancer_wallet = $5,
			total_amount_sol = $6, funded_amount_sol = $7, released_amount_sol = $8,
			refunded_amount_sol = $9, status = $10, init_tx_signature = $11, updated_at = $12
		WHERE id = $1`

	escrow.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		escrow.ID, escrow.EscrowPDA, escrow.VaultAddress, escrow.ClientWallet,
		escrow.FreelancerWallet, escrow.TotalAmountSOL, escrow.FundedAmountSOL,
		escrow.ReleasedAmountSOL, escrow.RefundedAmountSOL, escrow.Status,
		escrow.InitTxSignature, escrow.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *EscrowRepository) CreateLog(ctx context.Context, log *domain.EscrowLog) error {
	query := `
		INSERT INTO escrow_logs (
			id, escrow_id, action, amount_sol, tx_signature, performed_by, notes, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8
		)`

	log.ID = uuid.New()
	log.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		log.ID, log.EscrowID, log.Action, log.AmountSOL, log.TxSignature,
		log.PerformedBy, log.Notes, log.CreatedAt,
	)

	return err
}

// PaymentRepository implementation
type PaymentRepository struct {
	db *pgxpool.Pool
}

func NewPaymentRepository(db *pgxpool.Pool) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(ctx context.Context, payment *domain.Payment) error {
	query := `
		INSERT INTO payments (
			id, escrow_id, contract_id, milestone_id, payment_type, from_wallet, to_wallet,
			amount_sol, platform_fee_sol, net_amount_sol, tx_signature, slot, block_time,
			status, initiated_at, confirmed_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)`

	payment.ID = uuid.New()
	payment.InitiatedAt = time.Now()
	if payment.Status == "" {
		payment.Status = domain.PaymentStatusPending
	}

	_, err := r.db.Exec(ctx, query,
		payment.ID, payment.EscrowID, payment.ContractID, payment.MilestoneID,
		payment.PaymentType, payment.FromWallet, payment.ToWallet, payment.AmountSOL,
		payment.PlatformFeeSOL, payment.NetAmountSOL, payment.TxSignature,
		payment.Slot, payment.BlockTime, payment.Status, payment.InitiatedAt, payment.ConfirmedAt,
	)

	return err
}

func (r *PaymentRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Payment, error) {
	query := `
		SELECT id, escrow_id, contract_id, milestone_id, payment_type, from_wallet, to_wallet,
			   amount_sol, platform_fee_sol, net_amount_sol, tx_signature, slot, block_time,
			   status, initiated_at, confirmed_at
		FROM payments
		WHERE id = $1`

	payment := &domain.Payment{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&payment.ID, &payment.EscrowID, &payment.ContractID, &payment.MilestoneID,
		&payment.PaymentType, &payment.FromWallet, &payment.ToWallet, &payment.AmountSOL,
		&payment.PlatformFeeSOL, &payment.NetAmountSOL, &payment.TxSignature,
		&payment.Slot, &payment.BlockTime, &payment.Status, &payment.InitiatedAt, &payment.ConfirmedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return payment, err
}

func (r *PaymentRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Payment, error) {
	query := `
		SELECT id, escrow_id, contract_id, milestone_id, payment_type, from_wallet, to_wallet,
			   amount_sol, platform_fee_sol, net_amount_sol, tx_signature, slot, block_time,
			   status, initiated_at, confirmed_at
		FROM payments
		WHERE contract_id = $1
		ORDER BY initiated_at DESC`

	rows, err := r.db.Query(ctx, query, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []domain.Payment
	for rows.Next() {
		var payment domain.Payment
		if err := rows.Scan(
			&payment.ID, &payment.EscrowID, &payment.ContractID, &payment.MilestoneID,
			&payment.PaymentType, &payment.FromWallet, &payment.ToWallet, &payment.AmountSOL,
			&payment.PlatformFeeSOL, &payment.NetAmountSOL, &payment.TxSignature,
			&payment.Slot, &payment.BlockTime, &payment.Status, &payment.InitiatedAt, &payment.ConfirmedAt,
		); err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}

	return payments, rows.Err()
}

func (r *PaymentRepository) GetByTxSignature(ctx context.Context, txSignature string) (*domain.Payment, error) {
	query := `
		SELECT id, escrow_id, contract_id, milestone_id, payment_type, from_wallet, to_wallet,
			   amount_sol, platform_fee_sol, net_amount_sol, tx_signature, slot, block_time,
			   status, initiated_at, confirmed_at
		FROM payments
		WHERE tx_signature = $1`

	payment := &domain.Payment{}
	err := r.db.QueryRow(ctx, query, txSignature).Scan(
		&payment.ID, &payment.EscrowID, &payment.ContractID, &payment.MilestoneID,
		&payment.PaymentType, &payment.FromWallet, &payment.ToWallet, &payment.AmountSOL,
		&payment.PlatformFeeSOL, &payment.NetAmountSOL, &payment.TxSignature,
		&payment.Slot, &payment.BlockTime, &payment.Status, &payment.InitiatedAt, &payment.ConfirmedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return payment, err
}

func (r *PaymentRepository) Update(ctx context.Context, payment *domain.Payment) error {
	query := `
		UPDATE payments SET
			tx_signature = $2, slot = $3, block_time = $4, status = $5, confirmed_at = $6
		WHERE id = $1`

	result, err := r.db.Exec(ctx, query,
		payment.ID, payment.TxSignature, payment.Slot, payment.BlockTime,
		payment.Status, payment.ConfirmedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
