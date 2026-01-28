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

type ServiceRepository struct {
	db *pgxpool.Pool
}

func NewServiceRepository(db *pgxpool.Pool) *ServiceRepository {
	return &ServiceRepository{db: db}
}

func (r *ServiceRepository) Create(ctx context.Context, service *domain.Service) error {
	query := `
		INSERT INTO services (
			id, freelancer_id, title, description, category_id,
			basic_price_sol, basic_description, basic_delivery_days, basic_revisions,
			standard_price_sol, standard_description, standard_delivery_days, standard_revisions,
			premium_price_sol, premium_description, premium_delivery_days, premium_revisions,
			status, visibility, thumbnail_url, gallery_urls,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
		)`

	service.ID = uuid.New()
	service.CreatedAt = time.Now()
	service.UpdatedAt = time.Now()
	if service.Status == "" {
		service.Status = domain.ServiceStatusDraft
	}
	if service.Visibility == "" {
		service.Visibility = domain.VisibilityPublic
	}

	_, err := r.db.Exec(ctx, query,
		service.ID, service.FreelancerID, service.Title, service.Description, service.CategoryID,
		service.BasicPriceSOL, service.BasicDescription, service.BasicDeliveryDays, service.BasicRevisions,
		service.StandardPriceSOL, service.StandardDescription, service.StandardDeliveryDays, service.StandardRevisions,
		service.PremiumPriceSOL, service.PremiumDescription, service.PremiumDeliveryDays, service.PremiumRevisions,
		service.Status, service.Visibility, service.ThumbnailURL, service.GalleryURLs,
		service.CreatedAt, service.UpdatedAt,
	)

	return err
}

func (r *ServiceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Service, error) {
	query := `
		SELECT s.id, s.freelancer_id, s.title, s.description, s.category_id,
			   s.basic_price_sol, s.basic_description, s.basic_delivery_days, s.basic_revisions,
			   s.standard_price_sol, s.standard_description, s.standard_delivery_days, s.standard_revisions,
			   s.premium_price_sol, s.premium_description, s.premium_delivery_days, s.premium_revisions,
			   s.status, s.visibility, s.thumbnail_url, s.gallery_urls,
			   s.views_count, s.orders_count, s.average_rating, s.total_reviews,
			   s.created_at, s.updated_at,
			   u.id as user_id, u.username, u.email,
			   p.display_name, p.professional_title, p.avatar_url, p.average_rating as profile_rating, p.total_reviews as profile_reviews
		FROM services s
		JOIN users u ON s.freelancer_id = u.id
		LEFT JOIN profiles p ON u.id = p.user_id
		WHERE s.id = $1`

	service := &domain.Service{}
	user := &domain.User{}
	profile := &domain.Profile{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&service.ID, &service.FreelancerID, &service.Title, &service.Description, &service.CategoryID,
		&service.BasicPriceSOL, &service.BasicDescription, &service.BasicDeliveryDays, &service.BasicRevisions,
		&service.StandardPriceSOL, &service.StandardDescription, &service.StandardDeliveryDays, &service.StandardRevisions,
		&service.PremiumPriceSOL, &service.PremiumDescription, &service.PremiumDeliveryDays, &service.PremiumRevisions,
		&service.Status, &service.Visibility, &service.ThumbnailURL, &service.GalleryURLs,
		&service.ViewsCount, &service.OrdersCount, &service.AverageRating, &service.TotalReviews,
		&service.CreatedAt, &service.UpdatedAt,
		&user.ID, &user.Username, &user.Email,
		&profile.DisplayName, &profile.ProfessionalTitle, &profile.AvatarURL, &profile.AverageRating, &profile.TotalReviews,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	service.Freelancer = user
	service.Profile = profile

	return service, nil
}

func (r *ServiceRepository) GetByFreelancerID(ctx context.Context, freelancerID uuid.UUID, status string, limit, offset int) ([]domain.Service, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	conditions = append(conditions, fmt.Sprintf("freelancer_id = $%d", argNum))
	args = append(args, freelancerID)
	argNum++

	if status != "" && status != "all" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argNum))
		args = append(args, status)
		argNum++
	}

	whereClause := " WHERE " + strings.Join(conditions, " AND ")

	countQuery := `SELECT COUNT(*) FROM services` + whereClause
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, freelancer_id, title, description, category_id,
			   basic_price_sol, basic_description, basic_delivery_days, basic_revisions,
			   standard_price_sol, standard_description, standard_delivery_days, standard_revisions,
			   premium_price_sol, premium_description, premium_delivery_days, premium_revisions,
			   status, visibility, thumbnail_url, gallery_urls,
			   views_count, orders_count, average_rating, total_reviews,
			   created_at, updated_at
		FROM services` + whereClause + fmt.Sprintf(` ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var services []domain.Service
	for rows.Next() {
		var service domain.Service
		if err := rows.Scan(
			&service.ID, &service.FreelancerID, &service.Title, &service.Description, &service.CategoryID,
			&service.BasicPriceSOL, &service.BasicDescription, &service.BasicDeliveryDays, &service.BasicRevisions,
			&service.StandardPriceSOL, &service.StandardDescription, &service.StandardDeliveryDays, &service.StandardRevisions,
			&service.PremiumPriceSOL, &service.PremiumDescription, &service.PremiumDeliveryDays, &service.PremiumRevisions,
			&service.Status, &service.Visibility, &service.ThumbnailURL, &service.GalleryURLs,
			&service.ViewsCount, &service.OrdersCount, &service.AverageRating, &service.TotalReviews,
			&service.CreatedAt, &service.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		services = append(services, service)
	}

	return services, total, rows.Err()
}

func (r *ServiceRepository) Update(ctx context.Context, service *domain.Service) error {
	query := `
		UPDATE services SET
			title = $2, description = $3, category_id = $4,
			basic_price_sol = $5, basic_description = $6, basic_delivery_days = $7, basic_revisions = $8,
			standard_price_sol = $9, standard_description = $10, standard_delivery_days = $11, standard_revisions = $12,
			premium_price_sol = $13, premium_description = $14, premium_delivery_days = $15, premium_revisions = $16,
			status = $17, visibility = $18, thumbnail_url = $19, gallery_urls = $20,
			updated_at = $21
		WHERE id = $1`

	service.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		service.ID, service.Title, service.Description, service.CategoryID,
		service.BasicPriceSOL, service.BasicDescription, service.BasicDeliveryDays, service.BasicRevisions,
		service.StandardPriceSOL, service.StandardDescription, service.StandardDeliveryDays, service.StandardRevisions,
		service.PremiumPriceSOL, service.PremiumDescription, service.PremiumDeliveryDays, service.PremiumRevisions,
		service.Status, service.Visibility, service.ThumbnailURL, service.GalleryURLs,
		service.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ServiceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM services WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ServiceRepository) Search(ctx context.Context, query string, categoryID *int, skills []int, limit, offset int) ([]domain.Service, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT DISTINCT s.id, s.freelancer_id, s.title, s.description, s.category_id,
			   s.basic_price_sol, s.basic_description, s.basic_delivery_days, s.basic_revisions,
			   s.standard_price_sol, s.standard_description, s.standard_delivery_days, s.standard_revisions,
			   s.premium_price_sol, s.premium_description, s.premium_delivery_days, s.premium_revisions,
			   s.status, s.visibility, s.thumbnail_url, s.gallery_urls,
			   s.views_count, s.orders_count, s.average_rating, s.total_reviews,
			   s.created_at, s.updated_at,
			   u.username, p.display_name, p.professional_title, p.avatar_url
		FROM services s
		JOIN users u ON s.freelancer_id = u.id
		LEFT JOIN profiles p ON u.id = p.user_id`

	countQuery := `SELECT COUNT(DISTINCT s.id) FROM services s`

	// Add skill join if filtering by skills
	if len(skills) > 0 {
		baseQuery += ` JOIN service_skills ss ON s.id = ss.service_id`
		countQuery += ` JOIN service_skills ss ON s.id = ss.service_id`
	}

	// Only show active services
	conditions = append(conditions, "s.status = 'active'")
	// Public services only
	conditions = append(conditions, "s.visibility = 'public'")

	// Text search
	if query != "" {
		conditions = append(conditions, fmt.Sprintf(`(
			s.title ILIKE $%d OR
			s.description ILIKE $%d
		)`, argNum, argNum))
		args = append(args, "%"+query+"%")
		argNum++
	}

	// Filter by category
	if categoryID != nil {
		conditions = append(conditions, fmt.Sprintf("s.category_id = $%d", argNum))
		args = append(args, *categoryID)
		argNum++
	}

	// Filter by skills
	if len(skills) > 0 {
		conditions = append(conditions, fmt.Sprintf(`ss.skill_id = ANY($%d)`, argNum))
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
	fullQuery := baseQuery + whereClause + fmt.Sprintf(` ORDER BY s.orders_count DESC, s.average_rating DESC, s.created_at DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fullQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var services []domain.Service
	for rows.Next() {
		var service domain.Service
		var username string
		var displayName, professionalTitle, avatarURL *string

		if err := rows.Scan(
			&service.ID, &service.FreelancerID, &service.Title, &service.Description, &service.CategoryID,
			&service.BasicPriceSOL, &service.BasicDescription, &service.BasicDeliveryDays, &service.BasicRevisions,
			&service.StandardPriceSOL, &service.StandardDescription, &service.StandardDeliveryDays, &service.StandardRevisions,
			&service.PremiumPriceSOL, &service.PremiumDescription, &service.PremiumDeliveryDays, &service.PremiumRevisions,
			&service.Status, &service.Visibility, &service.ThumbnailURL, &service.GalleryURLs,
			&service.ViewsCount, &service.OrdersCount, &service.AverageRating, &service.TotalReviews,
			&service.CreatedAt, &service.UpdatedAt,
			&username, &displayName, &professionalTitle, &avatarURL,
		); err != nil {
			return nil, 0, err
		}

		// Populate freelancer info
		service.Freelancer = &domain.User{
			ID:       service.FreelancerID,
			Username: username,
		}
		if displayName != nil {
			service.Freelancer.DisplayName = *displayName
		} else {
			service.Freelancer.DisplayName = username
		}
		if avatarURL != nil {
			service.Freelancer.AvatarURL = avatarURL
		}

		service.Profile = &domain.Profile{
			DisplayName:       displayName,
			ProfessionalTitle: professionalTitle,
			AvatarURL:         avatarURL,
		}

		services = append(services, service)
	}

	return services, total, rows.Err()
}

func (r *ServiceRepository) IncrementViews(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE services SET views_count = views_count + 1 WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *ServiceRepository) AddSkills(ctx context.Context, serviceID uuid.UUID, skillIDs []int) error {
	if len(skillIDs) == 0 {
		return nil
	}

	query := `INSERT INTO service_skills (service_id, skill_id) VALUES ($1, $2)
			  ON CONFLICT (service_id, skill_id) DO NOTHING`

	for _, skillID := range skillIDs {
		_, err := r.db.Exec(ctx, query, serviceID, skillID)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *ServiceRepository) RemoveSkills(ctx context.Context, serviceID uuid.UUID) error {
	query := `DELETE FROM service_skills WHERE service_id = $1`
	_, err := r.db.Exec(ctx, query, serviceID)
	return err
}

func (r *ServiceRepository) GetSkills(ctx context.Context, serviceID uuid.UUID) ([]domain.Skill, error) {
	query := `
		SELECT s.id, s.name, s.slug, s.category, s.created_at
		FROM skills s
		JOIN service_skills ss ON s.id = ss.skill_id
		WHERE ss.service_id = $1`

	rows, err := r.db.Query(ctx, query, serviceID)
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

// FAQ methods

func (r *ServiceRepository) AddFAQ(ctx context.Context, faq *domain.ServiceFAQ) error {
	query := `
		INSERT INTO service_faqs (id, service_id, question, answer, sort_order, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)`

	faq.ID = uuid.New()
	faq.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		faq.ID, faq.ServiceID, faq.Question, faq.Answer, faq.SortOrder, faq.CreatedAt,
	)
	return err
}

func (r *ServiceRepository) GetFAQs(ctx context.Context, serviceID uuid.UUID) ([]domain.ServiceFAQ, error) {
	query := `
		SELECT id, service_id, question, answer, sort_order, created_at
		FROM service_faqs
		WHERE service_id = $1
		ORDER BY sort_order ASC`

	rows, err := r.db.Query(ctx, query, serviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var faqs []domain.ServiceFAQ
	for rows.Next() {
		var faq domain.ServiceFAQ
		if err := rows.Scan(&faq.ID, &faq.ServiceID, &faq.Question, &faq.Answer, &faq.SortOrder, &faq.CreatedAt); err != nil {
			return nil, err
		}
		faqs = append(faqs, faq)
	}

	return faqs, rows.Err()
}

func (r *ServiceRepository) UpdateFAQ(ctx context.Context, faq *domain.ServiceFAQ) error {
	query := `
		UPDATE service_faqs SET
			question = $2, answer = $3, sort_order = $4
		WHERE id = $1`

	result, err := r.db.Exec(ctx, query, faq.ID, faq.Question, faq.Answer, faq.SortOrder)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ServiceRepository) DeleteFAQ(ctx context.Context, faqID uuid.UUID) error {
	query := `DELETE FROM service_faqs WHERE id = $1`
	result, err := r.db.Exec(ctx, query, faqID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
