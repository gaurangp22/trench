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

type JobRepository struct {
	db *pgxpool.Pool
}

func NewJobRepository(db *pgxpool.Pool) *JobRepository {
	return &JobRepository{db: db}
}

func (r *JobRepository) Create(ctx context.Context, job *domain.Job) error {
	query := `
		INSERT INTO jobs (
			id, client_id, title, description, category_id, payment_type,
			budget_min_sol, budget_max_sol, expected_duration, complexity,
			visibility, status, posted_at, expires_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)`

	job.ID = uuid.New()
	job.CreatedAt = time.Now()
	job.UpdatedAt = time.Now()
	if job.Status == "" {
		job.Status = domain.JobStatusDraft
	}

	_, err := r.db.Exec(ctx, query,
		job.ID, job.ClientID, job.Title, job.Description, job.CategoryID,
		job.PaymentType, job.BudgetMinSOL, job.BudgetMaxSOL, job.ExpectedDuration,
		job.Complexity, job.Visibility, job.Status, job.PostedAt, job.ExpiresAt,
		job.CreatedAt, job.UpdatedAt,
	)

	return err
}

func (r *JobRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Job, error) {
	query := `
		SELECT j.id, j.client_id, j.title, j.description, j.category_id, j.payment_type,
			   j.budget_min_sol, j.budget_max_sol, j.expected_duration, j.complexity,
			   j.visibility, j.status, j.views_count, j.proposal_count,
			   j.posted_at, j.expires_at, j.created_at, j.updated_at,
			   u.username as client_username
		FROM jobs j
		JOIN users u ON j.client_id = u.id
		WHERE j.id = $1`

	job := &domain.Job{}
	var clientUsername string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&job.ID, &job.ClientID, &job.Title, &job.Description, &job.CategoryID,
		&job.PaymentType, &job.BudgetMinSOL, &job.BudgetMaxSOL, &job.ExpectedDuration,
		&job.Complexity, &job.Visibility, &job.Status, &job.ViewsCount, &job.ProposalCount,
		&job.PostedAt, &job.ExpiresAt, &job.CreatedAt, &job.UpdatedAt,
		&clientUsername,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return job, err
}

func (r *JobRepository) GetByClientID(ctx context.Context, clientID uuid.UUID, limit, offset int) ([]domain.Job, int, error) {
	countQuery := `SELECT COUNT(*) FROM jobs WHERE client_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, clientID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, client_id, title, description, category_id, payment_type,
			   budget_min_sol, budget_max_sol, expected_duration, complexity,
			   visibility, status, views_count, proposal_count,
			   posted_at, expires_at, created_at, updated_at
		FROM jobs WHERE client_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, clientID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobs []domain.Job
	for rows.Next() {
		var job domain.Job
		if err := rows.Scan(
			&job.ID, &job.ClientID, &job.Title, &job.Description, &job.CategoryID,
			&job.PaymentType, &job.BudgetMinSOL, &job.BudgetMaxSOL, &job.ExpectedDuration,
			&job.Complexity, &job.Visibility, &job.Status, &job.ViewsCount, &job.ProposalCount,
			&job.PostedAt, &job.ExpiresAt, &job.CreatedAt, &job.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		jobs = append(jobs, job)
	}

	return jobs, total, rows.Err()
}

func (r *JobRepository) Update(ctx context.Context, job *domain.Job) error {
	query := `
		UPDATE jobs SET
			title = $2, description = $3, category_id = $4, payment_type = $5,
			budget_min_sol = $6, budget_max_sol = $7, expected_duration = $8,
			complexity = $9, visibility = $10, status = $11, posted_at = $12,
			expires_at = $13, updated_at = $14
		WHERE id = $1`

	job.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		job.ID, job.Title, job.Description, job.CategoryID, job.PaymentType,
		job.BudgetMinSOL, job.BudgetMaxSOL, job.ExpectedDuration, job.Complexity,
		job.Visibility, job.Status, job.PostedAt, job.ExpiresAt, job.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *JobRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM jobs WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *JobRepository) Search(ctx context.Context, query string, categoryID *int, skills []int, status string, limit, offset int) ([]domain.Job, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT DISTINCT j.id, j.client_id, j.title, j.description, j.category_id, j.payment_type,
			   j.budget_min_sol, j.budget_max_sol, j.expected_duration, j.complexity,
			   j.visibility, j.status, j.views_count, j.proposal_count,
			   j.posted_at, j.expires_at, j.created_at, j.updated_at
		FROM jobs j`

	countQuery := `SELECT COUNT(DISTINCT j.id) FROM jobs j`

	// Add skill join if filtering by skills
	if len(skills) > 0 {
		baseQuery += ` JOIN job_skills js ON j.id = js.job_id`
		countQuery += ` JOIN job_skills js ON j.id = js.job_id`
	}

	// Default to showing only open jobs
	if status == "" {
		conditions = append(conditions, "j.status = 'open'")
	} else if status != "all" {
		conditions = append(conditions, fmt.Sprintf("j.status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	// Public jobs only
	conditions = append(conditions, "j.visibility = 'public'")

	// Text search
	if query != "" {
		conditions = append(conditions, fmt.Sprintf(`(
			j.title ILIKE $%d OR
			j.description ILIKE $%d
		)`, argNum, argNum))
		args = append(args, "%"+query+"%")
		argNum++
	}

	// Filter by category
	if categoryID != nil {
		conditions = append(conditions, fmt.Sprintf("j.category_id = $%d", argNum))
		args = append(args, *categoryID)
		argNum++
	}

	// Filter by skills
	if len(skills) > 0 {
		conditions = append(conditions, fmt.Sprintf(`js.skill_id = ANY($%d)`, argNum))
		args = append(args, skills)
		argNum++
	}

	// Build WHERE clause
	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	var total int
	err := r.db.QueryRow(ctx, countQuery+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Add ordering and pagination
	fullQuery := baseQuery + whereClause + fmt.Sprintf(` ORDER BY j.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fullQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var jobs []domain.Job
	for rows.Next() {
		var job domain.Job
		if err := rows.Scan(
			&job.ID, &job.ClientID, &job.Title, &job.Description, &job.CategoryID,
			&job.PaymentType, &job.BudgetMinSOL, &job.BudgetMaxSOL, &job.ExpectedDuration,
			&job.Complexity, &job.Visibility, &job.Status, &job.ViewsCount, &job.ProposalCount,
			&job.PostedAt, &job.ExpiresAt, &job.CreatedAt, &job.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		jobs = append(jobs, job)
	}

	return jobs, total, rows.Err()
}

func (r *JobRepository) IncrementViews(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE jobs SET views_count = views_count + 1 WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *JobRepository) AddSkills(ctx context.Context, jobID uuid.UUID, skillIDs []int) error {
	if len(skillIDs) == 0 {
		return nil
	}

	query := `INSERT INTO job_skills (job_id, skill_id, is_required) VALUES ($1, $2, $3)
			  ON CONFLICT (job_id, skill_id) DO NOTHING`

	for _, skillID := range skillIDs {
		_, err := r.db.Exec(ctx, query, jobID, skillID, true)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *JobRepository) RemoveSkills(ctx context.Context, jobID uuid.UUID) error {
	query := `DELETE FROM job_skills WHERE job_id = $1`
	_, err := r.db.Exec(ctx, query, jobID)
	return err
}

func (r *JobRepository) GetSkills(ctx context.Context, jobID uuid.UUID) ([]domain.Skill, error) {
	query := `
		SELECT s.id, s.name, s.slug, s.category, s.created_at
		FROM skills s
		JOIN job_skills js ON s.id = js.skill_id
		WHERE js.job_id = $1`

	rows, err := r.db.Query(ctx, query, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []domain.Skill
	for rows.Next() {
		var skill domain.Skill
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.Slug, &skill.Category, &skill.CreatedAt); err != nil {
			return nil, err
		}
		skills = append(skills, skill)
	}

	return skills, rows.Err()
}

// ProposalRepository implementation
type ProposalRepository struct {
	db *pgxpool.Pool
}

func NewProposalRepository(db *pgxpool.Pool) *ProposalRepository {
	return &ProposalRepository{db: db}
}

func (r *ProposalRepository) Create(ctx context.Context, proposal *domain.Proposal) error {
	query := `
		INSERT INTO proposals (
			id, job_id, freelancer_id, cover_letter, proposed_rate_sol,
			proposed_amount_sol, estimated_duration, status, submitted_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)`

	proposal.ID = uuid.New()
	proposal.UpdatedAt = time.Now()
	proposal.SubmittedAt = time.Now()
	if proposal.Status == "" {
		proposal.Status = domain.ProposalStatusSubmitted
	}

	_, err := r.db.Exec(ctx, query,
		proposal.ID, proposal.JobID, proposal.FreelancerID, proposal.CoverLetter,
		proposal.ProposedRateSOL, proposal.ProposedAmountSOL, proposal.EstimatedDuration,
		proposal.Status, proposal.SubmittedAt, proposal.UpdatedAt,
	)

	if err == nil {
		// Increment proposal count on job
		r.db.Exec(ctx, `UPDATE jobs SET proposal_count = proposal_count + 1 WHERE id = $1`, proposal.JobID)
	}

	return err
}

func (r *ProposalRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Proposal, error) {
	query := `
		SELECT p.id, p.job_id, p.freelancer_id, p.cover_letter, p.proposed_rate_sol,
			   p.proposed_amount_sol, p.estimated_duration, p.status,
			   p.submitted_at, p.updated_at,
			   j.title as job_title, u.username as freelancer_username
		FROM proposals p
		JOIN jobs j ON p.job_id = j.id
		JOIN users u ON p.freelancer_id = u.id
		WHERE p.id = $1`

	proposal := &domain.Proposal{}
	var jobTitle, freelancerUsername string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&proposal.ID, &proposal.JobID, &proposal.FreelancerID, &proposal.CoverLetter,
		&proposal.ProposedRateSOL, &proposal.ProposedAmountSOL, &proposal.EstimatedDuration,
		&proposal.Status, &proposal.SubmittedAt, &proposal.UpdatedAt,
		&jobTitle, &freelancerUsername,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return proposal, err
}

func (r *ProposalRepository) GetByJobID(ctx context.Context, jobID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error) {
	countQuery := `SELECT COUNT(*) FROM proposals WHERE job_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, jobID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT p.id, p.job_id, p.freelancer_id, p.cover_letter, p.proposed_rate_sol,
			   p.proposed_amount_sol, p.estimated_duration, p.status,
			   p.submitted_at, p.updated_at,
			   u.username as freelancer_username
		FROM proposals p
		JOIN users u ON p.freelancer_id = u.id
		WHERE p.job_id = $1
		ORDER BY p.submitted_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, jobID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var proposals []domain.Proposal
	for rows.Next() {
		var proposal domain.Proposal
		var freelancerUsername string
		if err := rows.Scan(
			&proposal.ID, &proposal.JobID, &proposal.FreelancerID, &proposal.CoverLetter,
			&proposal.ProposedRateSOL, &proposal.ProposedAmountSOL, &proposal.EstimatedDuration,
			&proposal.Status, &proposal.SubmittedAt, &proposal.UpdatedAt,
			&freelancerUsername,
		); err != nil {
			return nil, 0, err
		}
		proposals = append(proposals, proposal)
	}

	return proposals, total, rows.Err()
}

func (r *ProposalRepository) GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, limit, offset int) ([]domain.Proposal, int, error) {
	countQuery := `SELECT COUNT(*) FROM proposals WHERE freelancer_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, freelancerID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT p.id, p.job_id, p.freelancer_id, p.cover_letter, p.proposed_rate_sol,
			   p.proposed_amount_sol, p.estimated_duration, p.status,
			   p.submitted_at, p.updated_at,
			   j.id, j.title, j.client_id, j.status as job_status,
			   j.budget_min_sol, j.payment_type,
			   u.id as client_user_id, u.username as client_username,
			   COALESCE(pr.display_name, u.username) as client_display_name,
			   pr.avatar_url as client_avatar
		FROM proposals p
		JOIN jobs j ON p.job_id = j.id
		JOIN users u ON j.client_id = u.id
		LEFT JOIN profiles pr ON u.id = pr.user_id
		WHERE p.freelancer_id = $1
		ORDER BY p.submitted_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, freelancerID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var proposals []domain.Proposal
	for rows.Next() {
		var proposal domain.Proposal
		var job domain.Job
		var client domain.User
		var clientDisplayName, clientAvatar *string
		if err := rows.Scan(
			&proposal.ID, &proposal.JobID, &proposal.FreelancerID, &proposal.CoverLetter,
			&proposal.ProposedRateSOL, &proposal.ProposedAmountSOL, &proposal.EstimatedDuration,
			&proposal.Status, &proposal.SubmittedAt, &proposal.UpdatedAt,
			&job.ID, &job.Title, &job.ClientID, &job.Status,
			&job.BudgetMinSOL, &job.PaymentType,
			&client.ID, &client.Username,
			&clientDisplayName, &clientAvatar,
		); err != nil {
			return nil, 0, err
		}
		// Populate client display name
		if clientDisplayName != nil {
			client.DisplayName = *clientDisplayName
		} else {
			client.DisplayName = client.Username
		}
		if clientAvatar != nil {
			client.AvatarURL = clientAvatar
		}
		job.Client = &client
		proposal.Job = &job
		proposals = append(proposals, proposal)
	}

	return proposals, total, rows.Err()
}

func (r *ProposalRepository) Update(ctx context.Context, proposal *domain.Proposal) error {
	query := `
		UPDATE proposals SET
			cover_letter = $2, proposed_rate_sol = $3, proposed_amount_sol = $4,
			estimated_duration = $5, status = $6, updated_at = $7
		WHERE id = $1`

	proposal.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		proposal.ID, proposal.CoverLetter, proposal.ProposedRateSOL,
		proposal.ProposedAmountSOL, proposal.EstimatedDuration, proposal.Status, proposal.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ProposalRepository) Delete(ctx context.Context, id uuid.UUID) error {
	// Get job ID first for updating count
	var jobID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT job_id FROM proposals WHERE id = $1`, id).Scan(&jobID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.ErrNotFound
		}
		return err
	}

	query := `DELETE FROM proposals WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}

	// Decrement proposal count
	r.db.Exec(ctx, `UPDATE jobs SET proposal_count = proposal_count - 1 WHERE id = $1 AND proposal_count > 0`, jobID)

	return nil
}

func (r *ProposalRepository) Exists(ctx context.Context, jobID, freelancerID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM proposals WHERE job_id = $1 AND freelancer_id = $2)`
	var exists bool
	err := r.db.QueryRow(ctx, query, jobID, freelancerID).Scan(&exists)
	return exists, err
}
