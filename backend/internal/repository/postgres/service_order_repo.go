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

type ServiceOrderRepository struct {
	db *pgxpool.Pool
}

func NewServiceOrderRepository(db *pgxpool.Pool) *ServiceOrderRepository {
	return &ServiceOrderRepository{db: db}
}

func (r *ServiceOrderRepository) Create(ctx context.Context, order *domain.ServiceOrder) error {
	query := `
		INSERT INTO service_orders (
			id, service_id, client_id, freelancer_id,
			package_tier, price_sol, delivery_days, revisions_allowed, revisions_used,
			requirements, status,
			started_at, expected_delivery_at, delivered_at, completed_at,
			escrow_account_address, escrow_funded,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		)`

	order.ID = uuid.New()
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	if order.Status == "" {
		order.Status = domain.ServiceOrderStatusPending
	}

	_, err := r.db.Exec(ctx, query,
		order.ID, order.ServiceID, order.ClientID, order.FreelancerID,
		order.PackageTier, order.PriceSOL, order.DeliveryDays, order.RevisionsAllowed, order.RevisionsUsed,
		order.Requirements, order.Status,
		order.StartedAt, order.ExpectedDeliveryAt, order.DeliveredAt, order.CompletedAt,
		order.EscrowAccountAddress, order.EscrowFunded,
		order.CreatedAt, order.UpdatedAt,
	)

	return err
}

func (r *ServiceOrderRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.ServiceOrder, error) {
	query := `
		SELECT o.id, o.service_id, o.client_id, o.freelancer_id,
			   o.package_tier, o.price_sol, o.delivery_days, o.revisions_allowed, o.revisions_used,
			   o.requirements, o.status,
			   o.started_at, o.expected_delivery_at, o.delivered_at, o.completed_at,
			   o.escrow_account_address, o.escrow_funded,
			   o.created_at, o.updated_at,
			   s.id as service_id, s.title as service_title, s.thumbnail_url,
			   cu.id as client_user_id, cu.username as client_username,
			   fu.id as freelancer_user_id, fu.username as freelancer_username,
			   cp.display_name as client_display_name, cp.avatar_url as client_avatar,
			   fp.display_name as freelancer_display_name, fp.avatar_url as freelancer_avatar, fp.professional_title
		FROM service_orders o
		JOIN services s ON o.service_id = s.id
		JOIN users cu ON o.client_id = cu.id
		JOIN users fu ON o.freelancer_id = fu.id
		LEFT JOIN profiles cp ON cu.id = cp.user_id
		LEFT JOIN profiles fp ON fu.id = fp.user_id
		WHERE o.id = $1`

	order := &domain.ServiceOrder{}
	service := &domain.Service{}
	client := &domain.User{}
	freelancer := &domain.User{}
	var clientDisplayName, clientAvatar, freelancerDisplayName, freelancerAvatar, professionalTitle *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&order.ID, &order.ServiceID, &order.ClientID, &order.FreelancerID,
		&order.PackageTier, &order.PriceSOL, &order.DeliveryDays, &order.RevisionsAllowed, &order.RevisionsUsed,
		&order.Requirements, &order.Status,
		&order.StartedAt, &order.ExpectedDeliveryAt, &order.DeliveredAt, &order.CompletedAt,
		&order.EscrowAccountAddress, &order.EscrowFunded,
		&order.CreatedAt, &order.UpdatedAt,
		&service.ID, &service.Title, &service.ThumbnailURL,
		&client.ID, &client.Username,
		&freelancer.ID, &freelancer.Username,
		&clientDisplayName, &clientAvatar,
		&freelancerDisplayName, &freelancerAvatar, &professionalTitle,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
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

	// Populate freelancer display name
	if freelancerDisplayName != nil {
		freelancer.DisplayName = *freelancerDisplayName
	} else {
		freelancer.DisplayName = freelancer.Username
	}
	if freelancerAvatar != nil {
		freelancer.AvatarURL = freelancerAvatar
	}

	order.Service = service
	order.Client = client
	order.Freelancer = freelancer

	return order, nil
}

func (r *ServiceOrderRepository) GetByClientID(ctx context.Context, clientID uuid.UUID, status string, limit, offset int) ([]domain.ServiceOrder, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	conditions = append(conditions, fmt.Sprintf("o.client_id = $%d", argNum))
	args = append(args, clientID)
	argNum++

	if status != "" && status != "all" {
		conditions = append(conditions, fmt.Sprintf("o.status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	whereClause := " WHERE " + strings.Join(conditions, " AND ")

	countQuery := `SELECT COUNT(*) FROM service_orders o` + whereClause
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT o.id, o.service_id, o.client_id, o.freelancer_id,
			   o.package_tier, o.price_sol, o.delivery_days, o.revisions_allowed, o.revisions_used,
			   o.requirements, o.status,
			   o.started_at, o.expected_delivery_at, o.delivered_at, o.completed_at,
			   o.escrow_account_address, o.escrow_funded,
			   o.created_at, o.updated_at,
			   s.title as service_title, s.thumbnail_url,
			   fu.username as freelancer_username,
			   fp.display_name as freelancer_display_name, fp.avatar_url as freelancer_avatar
		FROM service_orders o
		JOIN services s ON o.service_id = s.id
		JOIN users fu ON o.freelancer_id = fu.id
		LEFT JOIN profiles fp ON fu.id = fp.user_id` + whereClause +
		fmt.Sprintf(` ORDER BY o.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []domain.ServiceOrder
	for rows.Next() {
		var order domain.ServiceOrder
		var serviceTitle string
		var thumbnailURL *string
		var freelancerUsername string
		var freelancerDisplayName, freelancerAvatar *string

		if err := rows.Scan(
			&order.ID, &order.ServiceID, &order.ClientID, &order.FreelancerID,
			&order.PackageTier, &order.PriceSOL, &order.DeliveryDays, &order.RevisionsAllowed, &order.RevisionsUsed,
			&order.Requirements, &order.Status,
			&order.StartedAt, &order.ExpectedDeliveryAt, &order.DeliveredAt, &order.CompletedAt,
			&order.EscrowAccountAddress, &order.EscrowFunded,
			&order.CreatedAt, &order.UpdatedAt,
			&serviceTitle, &thumbnailURL,
			&freelancerUsername,
			&freelancerDisplayName, &freelancerAvatar,
		); err != nil {
			return nil, 0, err
		}

		order.Service = &domain.Service{
			ID:           order.ServiceID,
			Title:        serviceTitle,
			ThumbnailURL: thumbnailURL,
		}

		freelancer := &domain.User{
			ID:       order.FreelancerID,
			Username: freelancerUsername,
		}
		if freelancerDisplayName != nil {
			freelancer.DisplayName = *freelancerDisplayName
		} else {
			freelancer.DisplayName = freelancerUsername
		}
		if freelancerAvatar != nil {
			freelancer.AvatarURL = freelancerAvatar
		}
		order.Freelancer = freelancer

		orders = append(orders, order)
	}

	return orders, total, rows.Err()
}

func (r *ServiceOrderRepository) GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) ([]domain.ServiceOrder, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	conditions = append(conditions, fmt.Sprintf("o.freelancer_id = $%d", argNum))
	args = append(args, freelancerID)
	argNum++

	if status != "" && status != "all" {
		conditions = append(conditions, fmt.Sprintf("o.status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	whereClause := " WHERE " + strings.Join(conditions, " AND ")

	countQuery := `SELECT COUNT(*) FROM service_orders o` + whereClause
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT o.id, o.service_id, o.client_id, o.freelancer_id,
			   o.package_tier, o.price_sol, o.delivery_days, o.revisions_allowed, o.revisions_used,
			   o.requirements, o.status,
			   o.started_at, o.expected_delivery_at, o.delivered_at, o.completed_at,
			   o.escrow_account_address, o.escrow_funded,
			   o.created_at, o.updated_at,
			   s.title as service_title, s.thumbnail_url,
			   cu.username as client_username,
			   cp.display_name as client_display_name, cp.avatar_url as client_avatar
		FROM service_orders o
		JOIN services s ON o.service_id = s.id
		JOIN users cu ON o.client_id = cu.id
		LEFT JOIN profiles cp ON cu.id = cp.user_id` + whereClause +
		fmt.Sprintf(` ORDER BY o.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []domain.ServiceOrder
	for rows.Next() {
		var order domain.ServiceOrder
		var serviceTitle string
		var thumbnailURL *string
		var clientUsername string
		var clientDisplayName, clientAvatar *string

		if err := rows.Scan(
			&order.ID, &order.ServiceID, &order.ClientID, &order.FreelancerID,
			&order.PackageTier, &order.PriceSOL, &order.DeliveryDays, &order.RevisionsAllowed, &order.RevisionsUsed,
			&order.Requirements, &order.Status,
			&order.StartedAt, &order.ExpectedDeliveryAt, &order.DeliveredAt, &order.CompletedAt,
			&order.EscrowAccountAddress, &order.EscrowFunded,
			&order.CreatedAt, &order.UpdatedAt,
			&serviceTitle, &thumbnailURL,
			&clientUsername,
			&clientDisplayName, &clientAvatar,
		); err != nil {
			return nil, 0, err
		}

		order.Service = &domain.Service{
			ID:           order.ServiceID,
			Title:        serviceTitle,
			ThumbnailURL: thumbnailURL,
		}

		client := &domain.User{
			ID:       order.ClientID,
			Username: clientUsername,
		}
		if clientDisplayName != nil {
			client.DisplayName = *clientDisplayName
		} else {
			client.DisplayName = clientUsername
		}
		if clientAvatar != nil {
			client.AvatarURL = clientAvatar
		}
		order.Client = client

		orders = append(orders, order)
	}

	return orders, total, rows.Err()
}

func (r *ServiceOrderRepository) GetByServiceID(ctx context.Context, serviceID uuid.UUID, limit, offset int) ([]domain.ServiceOrder, int, error) {
	countQuery := `SELECT COUNT(*) FROM service_orders WHERE service_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, serviceID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT o.id, o.service_id, o.client_id, o.freelancer_id,
			   o.package_tier, o.price_sol, o.delivery_days, o.revisions_allowed, o.revisions_used,
			   o.requirements, o.status,
			   o.started_at, o.expected_delivery_at, o.delivered_at, o.completed_at,
			   o.escrow_account_address, o.escrow_funded,
			   o.created_at, o.updated_at
		FROM service_orders o
		WHERE o.service_id = $1
		ORDER BY o.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, serviceID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []domain.ServiceOrder
	for rows.Next() {
		var order domain.ServiceOrder
		if err := rows.Scan(
			&order.ID, &order.ServiceID, &order.ClientID, &order.FreelancerID,
			&order.PackageTier, &order.PriceSOL, &order.DeliveryDays, &order.RevisionsAllowed, &order.RevisionsUsed,
			&order.Requirements, &order.Status,
			&order.StartedAt, &order.ExpectedDeliveryAt, &order.DeliveredAt, &order.CompletedAt,
			&order.EscrowAccountAddress, &order.EscrowFunded,
			&order.CreatedAt, &order.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		orders = append(orders, order)
	}

	return orders, total, rows.Err()
}

func (r *ServiceOrderRepository) Update(ctx context.Context, order *domain.ServiceOrder) error {
	query := `
		UPDATE service_orders SET
			status = $2, revisions_used = $3,
			started_at = $4, expected_delivery_at = $5, delivered_at = $6, completed_at = $7,
			escrow_account_address = $8, escrow_funded = $9,
			updated_at = $10
		WHERE id = $1`

	order.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		order.ID, order.Status, order.RevisionsUsed,
		order.StartedAt, order.ExpectedDeliveryAt, order.DeliveredAt, order.CompletedAt,
		order.EscrowAccountAddress, order.EscrowFunded,
		order.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

// Message methods

func (r *ServiceOrderRepository) CreateMessage(ctx context.Context, message *domain.ServiceOrderMessage) error {
	query := `
		INSERT INTO service_order_messages (
			id, order_id, sender_id, message_text, attachment_urls, message_type, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	message.ID = uuid.New()
	message.CreatedAt = time.Now()
	if message.MessageType == "" {
		message.MessageType = domain.OrderMessageTypeText
	}

	_, err := r.db.Exec(ctx, query,
		message.ID, message.OrderID, message.SenderID, message.MessageText,
		message.AttachmentURLs, message.MessageType, message.CreatedAt,
	)
	return err
}

func (r *ServiceOrderRepository) GetMessages(ctx context.Context, orderID uuid.UUID, limit, offset int) ([]domain.ServiceOrderMessage, int, error) {
	countQuery := `SELECT COUNT(*) FROM service_order_messages WHERE order_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, orderID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT m.id, m.order_id, m.sender_id, m.message_text, m.attachment_urls, m.message_type, m.created_at,
			   u.username, p.display_name, p.avatar_url
		FROM service_order_messages m
		JOIN users u ON m.sender_id = u.id
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE m.order_id = $1
		ORDER BY m.created_at ASC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, orderID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var messages []domain.ServiceOrderMessage
	for rows.Next() {
		var msg domain.ServiceOrderMessage
		var username string
		var displayName, avatarURL *string

		if err := rows.Scan(
			&msg.ID, &msg.OrderID, &msg.SenderID, &msg.MessageText, &msg.AttachmentURLs, &msg.MessageType, &msg.CreatedAt,
			&username, &displayName, &avatarURL,
		); err != nil {
			return nil, 0, err
		}

		sender := &domain.User{
			ID:       msg.SenderID,
			Username: username,
		}
		if displayName != nil {
			sender.DisplayName = *displayName
		} else {
			sender.DisplayName = username
		}
		if avatarURL != nil {
			sender.AvatarURL = avatarURL
		}
		msg.Sender = sender

		messages = append(messages, msg)
	}

	return messages, total, rows.Err()
}

// Review methods

func (r *ServiceOrderRepository) CreateReview(ctx context.Context, review *domain.ServiceReview) error {
	query := `
		INSERT INTO service_reviews (
			id, order_id, service_id, reviewer_id, rating, review_text, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`

	review.ID = uuid.New()
	review.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		review.ID, review.OrderID, review.ServiceID, review.ReviewerID,
		review.Rating, review.ReviewText, review.CreatedAt,
	)
	return err
}

func (r *ServiceOrderRepository) GetReviewByOrderID(ctx context.Context, orderID uuid.UUID) (*domain.ServiceReview, error) {
	query := `
		SELECT r.id, r.order_id, r.service_id, r.reviewer_id, r.rating, r.review_text, r.created_at,
			   u.username, p.display_name, p.avatar_url
		FROM service_reviews r
		JOIN users u ON r.reviewer_id = u.id
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE r.order_id = $1`

	review := &domain.ServiceReview{}
	var username string
	var displayName, avatarURL *string

	err := r.db.QueryRow(ctx, query, orderID).Scan(
		&review.ID, &review.OrderID, &review.ServiceID, &review.ReviewerID,
		&review.Rating, &review.ReviewText, &review.CreatedAt,
		&username, &displayName, &avatarURL,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	reviewer := &domain.User{
		ID:       review.ReviewerID,
		Username: username,
	}
	if displayName != nil {
		reviewer.DisplayName = *displayName
	} else {
		reviewer.DisplayName = username
	}
	if avatarURL != nil {
		reviewer.AvatarURL = avatarURL
	}
	review.Reviewer = reviewer

	return review, nil
}

func (r *ServiceOrderRepository) GetReviewsByServiceID(ctx context.Context, serviceID uuid.UUID, limit, offset int) ([]domain.ServiceReview, int, error) {
	countQuery := `SELECT COUNT(*) FROM service_reviews WHERE service_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, serviceID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT r.id, r.order_id, r.service_id, r.reviewer_id, r.rating, r.review_text, r.created_at,
			   u.username, p.display_name, p.avatar_url
		FROM service_reviews r
		JOIN users u ON r.reviewer_id = u.id
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE r.service_id = $1
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.Query(ctx, query, serviceID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var reviews []domain.ServiceReview
	for rows.Next() {
		var review domain.ServiceReview
		var username string
		var displayName, avatarURL *string

		if err := rows.Scan(
			&review.ID, &review.OrderID, &review.ServiceID, &review.ReviewerID,
			&review.Rating, &review.ReviewText, &review.CreatedAt,
			&username, &displayName, &avatarURL,
		); err != nil {
			return nil, 0, err
		}

		reviewer := &domain.User{
			ID:       review.ReviewerID,
			Username: username,
		}
		if displayName != nil {
			reviewer.DisplayName = *displayName
		} else {
			reviewer.DisplayName = username
		}
		if avatarURL != nil {
			reviewer.AvatarURL = avatarURL
		}
		review.Reviewer = reviewer

		reviews = append(reviews, review)
	}

	return reviews, total, rows.Err()
}
