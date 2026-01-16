package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
	"github.com/trenchjob/backend/internal/repository"
)

type ReviewRepository struct {
	db *pgxpool.Pool
}

func NewReviewRepository(db *pgxpool.Pool) repository.ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) Create(ctx context.Context, review *domain.Review) error {
	query := `
		INSERT INTO reviews (
			id, contract_id, reviewer_id, reviewee_id, overall_rating,
			communication_rating, quality_rating, expertise_rating,
			professionalism_rating, would_recommend, review_text,
			is_public, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)`

	review.ID = uuid.New()
	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		review.ID,
		review.ContractID,
		review.ReviewerID,
		review.RevieweeID,
		review.OverallRating,
		review.CommunicationRating,
		review.QualityRating,
		review.ExpertiseRating,
		review.ProfessionalismRating,
		review.WouldRecommend,
		review.ReviewText,
		review.IsPublic,
		review.CreatedAt,
		review.UpdatedAt,
	)
	return err
}

func (r *ReviewRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Review, error) {
	query := `
		SELECT id, contract_id, reviewer_id, reviewee_id, overall_rating,
			communication_rating, quality_rating, expertise_rating,
			professionalism_rating, would_recommend, review_text,
			is_public, created_at, updated_at
		FROM reviews
		WHERE id = $1`

	var review domain.Review
	err := r.db.QueryRow(ctx, query, id).Scan(
		&review.ID,
		&review.ContractID,
		&review.ReviewerID,
		&review.RevieweeID,
		&review.OverallRating,
		&review.CommunicationRating,
		&review.QualityRating,
		&review.ExpertiseRating,
		&review.ProfessionalismRating,
		&review.WouldRecommend,
		&review.ReviewText,
		&review.IsPublic,
		&review.CreatedAt,
		&review.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Review, error) {
	query := `
		SELECT id, contract_id, reviewer_id, reviewee_id, overall_rating,
			communication_rating, quality_rating, expertise_rating,
			professionalism_rating, would_recommend, review_text,
			is_public, created_at, updated_at
		FROM reviews
		WHERE contract_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []domain.Review
	for rows.Next() {
		var review domain.Review
		err := rows.Scan(
			&review.ID,
			&review.ContractID,
			&review.ReviewerID,
			&review.RevieweeID,
			&review.OverallRating,
			&review.CommunicationRating,
			&review.QualityRating,
			&review.ExpertiseRating,
			&review.ProfessionalismRating,
			&review.WouldRecommend,
			&review.ReviewText,
			&review.IsPublic,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}
	return reviews, nil
}

func (r *ReviewRepository) GetByRevieweeID(ctx context.Context, revieweeID uuid.UUID, limit, offset int) ([]domain.Review, int, error) {
	countQuery := `SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND is_public = true`
	var total int
	err := r.db.QueryRow(ctx, countQuery, revieweeID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, contract_id, reviewer_id, reviewee_id, overall_rating,
			communication_rating, quality_rating, expertise_rating,
			professionalism_rating, would_recommend, review_text,
			is_public, created_at, updated_at
		FROM reviews
		WHERE reviewee_id = $1 AND is_public = true
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, revieweeID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var reviews []domain.Review
	for rows.Next() {
		var review domain.Review
		err := rows.Scan(
			&review.ID,
			&review.ContractID,
			&review.ReviewerID,
			&review.RevieweeID,
			&review.OverallRating,
			&review.CommunicationRating,
			&review.QualityRating,
			&review.ExpertiseRating,
			&review.ProfessionalismRating,
			&review.WouldRecommend,
			&review.ReviewText,
			&review.IsPublic,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		reviews = append(reviews, review)
	}
	return reviews, total, nil
}

func (r *ReviewRepository) Exists(ctx context.Context, contractID, reviewerID uuid.UUID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM reviews WHERE contract_id = $1 AND reviewer_id = $2)`
	var exists bool
	err := r.db.QueryRow(ctx, query, contractID, reviewerID).Scan(&exists)
	return exists, err
}

type NotificationRepository struct {
	db *pgxpool.Pool
}

func NewNotificationRepository(db *pgxpool.Pool) repository.NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(ctx context.Context, notification *domain.Notification) error {
	query := `
		INSERT INTO notifications (
			id, user_id, type, title, message, job_id, proposal_id,
			contract_id, payment_id, is_read, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		)`

	notification.ID = uuid.New()
	notification.CreatedAt = time.Now()
	notification.IsRead = false

	_, err := r.db.Exec(ctx, query,
		notification.ID,
		notification.UserID,
		notification.Type,
		notification.Title,
		notification.Message,
		notification.JobID,
		notification.ProposalID,
		notification.ContractID,
		notification.PaymentID,
		notification.IsRead,
		notification.CreatedAt,
	)
	return err
}

func (r *NotificationRepository) GetByUserID(ctx context.Context, userID uuid.UUID, unreadOnly bool, limit, offset int) ([]domain.Notification, int, error) {
	var countQuery string
	var args []interface{}

	if unreadOnly {
		countQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`
		args = []interface{}{userID}
	} else {
		countQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`
		args = []interface{}{userID}
	}

	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	var query string
	if unreadOnly {
		query = `
			SELECT id, user_id, type, title, message, job_id, proposal_id,
				contract_id, payment_id, is_read, read_at, created_at
			FROM notifications
			WHERE user_id = $1 AND is_read = false
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3`
	} else {
		query = `
			SELECT id, user_id, type, title, message, job_id, proposal_id,
				contract_id, payment_id, is_read, read_at, created_at
			FROM notifications
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3`
	}

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var notifications []domain.Notification
	for rows.Next() {
		var n domain.Notification
		err := rows.Scan(
			&n.ID,
			&n.UserID,
			&n.Type,
			&n.Title,
			&n.Message,
			&n.JobID,
			&n.ProposalID,
			&n.ContractID,
			&n.PaymentID,
			&n.IsRead,
			&n.ReadAt,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		notifications = append(notifications, n)
	}
	return notifications, total, nil
}

func (r *NotificationRepository) MarkAsRead(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE notifications SET is_read = true, read_at = $1 WHERE id = $2`
	_, err := r.db.Exec(ctx, query, time.Now(), id)
	return err
}

func (r *NotificationRepository) MarkAllAsRead(ctx context.Context, userID uuid.UUID) error {
	query := `UPDATE notifications SET is_read = true, read_at = $1 WHERE user_id = $2 AND is_read = false`
	_, err := r.db.Exec(ctx, query, time.Now(), userID)
	return err
}

func (r *NotificationRepository) GetUnreadCount(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`
	var count int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

type DisputeRepository struct {
	db *pgxpool.Pool
}

func NewDisputeRepository(db *pgxpool.Pool) *DisputeRepository {
	return &DisputeRepository{db: db}
}

func (r *DisputeRepository) Create(ctx context.Context, dispute *domain.Dispute) error {
	query := `
		INSERT INTO disputes (
			id, contract_id, milestone_id, initiated_by, reason,
			description, evidence_urls, status, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)`

	dispute.ID = uuid.New()
	dispute.Status = domain.DisputeStatusOpen
	dispute.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		dispute.ID,
		dispute.ContractID,
		dispute.MilestoneID,
		dispute.InitiatedBy,
		dispute.Reason,
		dispute.Description,
		dispute.EvidenceURLs,
		dispute.Status,
		dispute.CreatedAt,
	)
	return err
}

func (r *DisputeRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Dispute, error) {
	query := `
		SELECT id, contract_id, milestone_id, initiated_by, reason,
			description, evidence_urls, status, resolved_by, resolution_type,
			resolution_notes, client_refund_sol, freelancer_payment_sol,
			created_at, resolved_at
		FROM disputes
		WHERE id = $1`

	var dispute domain.Dispute
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dispute.ID,
		&dispute.ContractID,
		&dispute.MilestoneID,
		&dispute.InitiatedBy,
		&dispute.Reason,
		&dispute.Description,
		&dispute.EvidenceURLs,
		&dispute.Status,
		&dispute.ResolvedBy,
		&dispute.ResolutionType,
		&dispute.ResolutionNotes,
		&dispute.ClientRefundSOL,
		&dispute.FreelancerPaymentSOL,
		&dispute.CreatedAt,
		&dispute.ResolvedAt,
	)
	if err != nil {
		return nil, err
	}
	return &dispute, nil
}

func (r *DisputeRepository) GetByContractID(ctx context.Context, contractID uuid.UUID) ([]domain.Dispute, error) {
	query := `
		SELECT id, contract_id, milestone_id, initiated_by, reason,
			description, evidence_urls, status, resolved_by, resolution_type,
			resolution_notes, client_refund_sol, freelancer_payment_sol,
			created_at, resolved_at
		FROM disputes
		WHERE contract_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var disputes []domain.Dispute
	for rows.Next() {
		var d domain.Dispute
		err := rows.Scan(
			&d.ID,
			&d.ContractID,
			&d.MilestoneID,
			&d.InitiatedBy,
			&d.Reason,
			&d.Description,
			&d.EvidenceURLs,
			&d.Status,
			&d.ResolvedBy,
			&d.ResolutionType,
			&d.ResolutionNotes,
			&d.ClientRefundSOL,
			&d.FreelancerPaymentSOL,
			&d.CreatedAt,
			&d.ResolvedAt,
		)
		if err != nil {
			return nil, err
		}
		disputes = append(disputes, d)
	}
	return disputes, nil
}

func (r *DisputeRepository) Update(ctx context.Context, dispute *domain.Dispute) error {
	query := `
		UPDATE disputes SET
			status = $1,
			resolved_by = $2,
			resolution_type = $3,
			resolution_notes = $4,
			client_refund_sol = $5,
			freelancer_payment_sol = $6,
			resolved_at = $7
		WHERE id = $8`

	_, err := r.db.Exec(ctx, query,
		dispute.Status,
		dispute.ResolvedBy,
		dispute.ResolutionType,
		dispute.ResolutionNotes,
		dispute.ClientRefundSOL,
		dispute.FreelancerPaymentSOL,
		dispute.ResolvedAt,
		dispute.ID,
	)
	return err
}
