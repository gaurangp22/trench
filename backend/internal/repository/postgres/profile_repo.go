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

type ProfileRepository struct {
	db *pgxpool.Pool
}

func NewProfileRepository(db *pgxpool.Pool) *ProfileRepository {
	return &ProfileRepository{db: db}
}

func (r *ProfileRepository) Create(ctx context.Context, profile *domain.Profile) error {
	query := `
		INSERT INTO profiles (
			id, user_id, display_name, professional_title, avatar_url, cover_image_url,
			overview, country, city, timezone, hourly_rate_sol, minimum_project_sol,
			available_for_hire, availability_status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
		)`

	profile.ID = uuid.New()
	profile.CreatedAt = time.Now()
	profile.UpdatedAt = time.Now()
	if profile.AvailabilityStatus == "" {
		profile.AvailabilityStatus = domain.AvailabilityAvailable
	}

	_, err := r.db.Exec(ctx, query,
		profile.ID, profile.UserID, profile.DisplayName, profile.ProfessionalTitle,
		profile.AvatarURL, profile.CoverImageURL, profile.Overview, profile.Country,
		profile.City, profile.Timezone, profile.HourlyRateSOL, profile.MinimumProjectSOL,
		profile.AvailableForHire, profile.AvailabilityStatus, profile.CreatedAt, profile.UpdatedAt,
	)

	return err
}

func (r *ProfileRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Profile, error) {
	query := `
		SELECT id, user_id, display_name, professional_title, avatar_url, cover_image_url,
			   overview, country, city, timezone, hourly_rate_sol, minimum_project_sol,
			   total_jobs_completed, total_earnings_sol, average_rating, total_reviews,
			   available_for_hire, availability_status, created_at, updated_at
		FROM profiles WHERE id = $1`

	profile := &domain.Profile{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&profile.ID, &profile.UserID, &profile.DisplayName, &profile.ProfessionalTitle,
		&profile.AvatarURL, &profile.CoverImageURL, &profile.Overview, &profile.Country,
		&profile.City, &profile.Timezone, &profile.HourlyRateSOL, &profile.MinimumProjectSOL,
		&profile.TotalJobsCompleted, &profile.TotalEarningsSOL, &profile.AverageRating,
		&profile.TotalReviews, &profile.AvailableForHire, &profile.AvailabilityStatus,
		&profile.CreatedAt, &profile.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return profile, err
}

func (r *ProfileRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*domain.Profile, error) {
	query := `
		SELECT id, user_id, display_name, professional_title, avatar_url, cover_image_url,
			   overview, country, city, timezone, hourly_rate_sol, minimum_project_sol,
			   total_jobs_completed, total_earnings_sol, average_rating, total_reviews,
			   available_for_hire, availability_status, created_at, updated_at
		FROM profiles WHERE user_id = $1`

	profile := &domain.Profile{}
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&profile.ID, &profile.UserID, &profile.DisplayName, &profile.ProfessionalTitle,
		&profile.AvatarURL, &profile.CoverImageURL, &profile.Overview, &profile.Country,
		&profile.City, &profile.Timezone, &profile.HourlyRateSOL, &profile.MinimumProjectSOL,
		&profile.TotalJobsCompleted, &profile.TotalEarningsSOL, &profile.AverageRating,
		&profile.TotalReviews, &profile.AvailableForHire, &profile.AvailabilityStatus,
		&profile.CreatedAt, &profile.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return profile, err
}

func (r *ProfileRepository) Update(ctx context.Context, profile *domain.Profile) error {
	query := `
		UPDATE profiles SET
			display_name = $2, professional_title = $3, avatar_url = $4, cover_image_url = $5,
			overview = $6, country = $7, city = $8, timezone = $9, hourly_rate_sol = $10,
			minimum_project_sol = $11, available_for_hire = $12, availability_status = $13,
			updated_at = $14
		WHERE id = $1`

	profile.UpdatedAt = time.Now()
	result, err := r.db.Exec(ctx, query,
		profile.ID, profile.DisplayName, profile.ProfessionalTitle, profile.AvatarURL,
		profile.CoverImageURL, profile.Overview, profile.Country, profile.City,
		profile.Timezone, profile.HourlyRateSOL, profile.MinimumProjectSOL,
		profile.AvailableForHire, profile.AvailabilityStatus, profile.UpdatedAt,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ProfileRepository) Search(ctx context.Context, query string, skills []int, limit, offset int) ([]domain.Profile, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT DISTINCT p.id, p.user_id, p.display_name, p.professional_title, p.avatar_url,
			   p.cover_image_url, p.overview, p.country, p.city, p.timezone,
			   p.hourly_rate_sol, p.minimum_project_sol, p.total_jobs_completed,
			   p.total_earnings_sol, p.average_rating, p.total_reviews,
			   p.available_for_hire, p.availability_status, p.created_at, p.updated_at
		FROM profiles p
		JOIN users u ON p.user_id = u.id`

	countQuery := `SELECT COUNT(DISTINCT p.id) FROM profiles p JOIN users u ON p.user_id = u.id`

	// Add skill join if filtering by skills
	if len(skills) > 0 {
		baseQuery += ` JOIN profile_skills ps ON p.id = ps.profile_id`
		countQuery += ` JOIN profile_skills ps ON p.id = ps.profile_id`
	}

	// Only show freelancers
	conditions = append(conditions, "u.is_freelancer = TRUE")

	// Text search
	if query != "" {
		conditions = append(conditions, fmt.Sprintf(`(
			p.display_name ILIKE $%d OR
			p.professional_title ILIKE $%d OR
			p.overview ILIKE $%d
		)`, argNum, argNum, argNum))
		args = append(args, "%"+query+"%")
		argNum++
	}

	// Filter by skills
	if len(skills) > 0 {
		conditions = append(conditions, fmt.Sprintf(`ps.skill_id = ANY($%d)`, argNum))
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
	fullQuery := baseQuery + whereClause + fmt.Sprintf(` ORDER BY p.average_rating DESC, p.total_jobs_completed DESC LIMIT $%d OFFSET $%d`, argNum, argNum+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, fullQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var profiles []domain.Profile
	for rows.Next() {
		var profile domain.Profile
		if err := rows.Scan(
			&profile.ID, &profile.UserID, &profile.DisplayName, &profile.ProfessionalTitle,
			&profile.AvatarURL, &profile.CoverImageURL, &profile.Overview, &profile.Country,
			&profile.City, &profile.Timezone, &profile.HourlyRateSOL, &profile.MinimumProjectSOL,
			&profile.TotalJobsCompleted, &profile.TotalEarningsSOL, &profile.AverageRating,
			&profile.TotalReviews, &profile.AvailableForHire, &profile.AvailabilityStatus,
			&profile.CreatedAt, &profile.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		profiles = append(profiles, profile)
	}

	return profiles, total, rows.Err()
}

func (r *ProfileRepository) GetSkills(ctx context.Context, profileID uuid.UUID) ([]domain.ProfileSkill, error) {
	query := `
		SELECT ps.profile_id, ps.skill_id, ps.years_experience, ps.proficiency_level,
			   s.name, s.slug, s.category
		FROM profile_skills ps
		JOIN skills s ON ps.skill_id = s.id
		WHERE ps.profile_id = $1
		ORDER BY ps.proficiency_level DESC, s.name`

	rows, err := r.db.Query(ctx, query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []domain.ProfileSkill
	for rows.Next() {
		var ps domain.ProfileSkill
		var skillName, skillSlug string
		var skillCategory *string

		if err := rows.Scan(
			&ps.ProfileID, &ps.SkillID, &ps.YearsExperience, &ps.ProficiencyLevel,
			&skillName, &skillSlug, &skillCategory,
		); err != nil {
			return nil, err
		}
		skills = append(skills, ps)
	}

	return skills, rows.Err()
}

func (r *ProfileRepository) AddSkill(ctx context.Context, ps *domain.ProfileSkill) error {
	query := `
		INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (profile_id, skill_id) DO UPDATE SET
			years_experience = EXCLUDED.years_experience,
			proficiency_level = EXCLUDED.proficiency_level`

	_, err := r.db.Exec(ctx, query, ps.ProfileID, ps.SkillID, ps.YearsExperience, ps.ProficiencyLevel)
	return err
}

func (r *ProfileRepository) RemoveSkill(ctx context.Context, profileID uuid.UUID, skillID int) error {
	query := `DELETE FROM profile_skills WHERE profile_id = $1 AND skill_id = $2`
	result, err := r.db.Exec(ctx, query, profileID, skillID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *ProfileRepository) SetSkills(ctx context.Context, profileID uuid.UUID, skills []domain.ProfileSkill) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Remove all existing skills
	_, err = tx.Exec(ctx, `DELETE FROM profile_skills WHERE profile_id = $1`, profileID)
	if err != nil {
		return err
	}

	// Add new skills
	for _, skill := range skills {
		_, err = tx.Exec(ctx, `
			INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level)
			VALUES ($1, $2, $3, $4)`,
			profileID, skill.SkillID, skill.YearsExperience, skill.ProficiencyLevel,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

// SkillRepository implementation
type SkillRepository struct {
	db *pgxpool.Pool
}

func NewSkillRepository(db *pgxpool.Pool) *SkillRepository {
	return &SkillRepository{db: db}
}

func (r *SkillRepository) GetAll(ctx context.Context) ([]domain.Skill, error) {
	query := `SELECT id, name, slug, category, created_at FROM skills ORDER BY category, name`

	rows, err := r.db.Query(ctx, query)
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

func (r *SkillRepository) GetByID(ctx context.Context, id int) (*domain.Skill, error) {
	query := `SELECT id, name, slug, category, created_at FROM skills WHERE id = $1`

	skill := &domain.Skill{}
	err := r.db.QueryRow(ctx, query, id).Scan(&skill.ID, &skill.Name, &skill.Slug, &skill.Category, &skill.CreatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return skill, err
}

func (r *SkillRepository) GetByCategory(ctx context.Context, category string) ([]domain.Skill, error) {
	query := `SELECT id, name, slug, category, created_at FROM skills WHERE category = $1 ORDER BY name`

	rows, err := r.db.Query(ctx, query, category)
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

func (r *SkillRepository) Search(ctx context.Context, query string) ([]domain.Skill, error) {
	sqlQuery := `
		SELECT id, name, slug, category, created_at
		FROM skills
		WHERE name ILIKE $1 OR slug ILIKE $1
		ORDER BY name
		LIMIT 20`

	rows, err := r.db.Query(ctx, sqlQuery, "%"+query+"%")
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

// PortfolioRepository implementation
type PortfolioRepository struct {
	db *pgxpool.Pool
}

func NewPortfolioRepository(db *pgxpool.Pool) *PortfolioRepository {
	return &PortfolioRepository{db: db}
}

func (r *PortfolioRepository) Create(ctx context.Context, item *domain.PortfolioItem) error {
	query := `
		INSERT INTO portfolio_items (id, profile_id, title, description, project_url, image_urls, skills_used, completion_date, sort_order, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	item.ID = uuid.New()
	item.CreatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		item.ID, item.ProfileID, item.Title, item.Description, item.ProjectURL,
		item.ImageURLs, item.SkillsUsed, item.CompletionDate,
		item.SortOrder, item.CreatedAt,
	)
	return err
}

func (r *PortfolioRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.PortfolioItem, error) {
	query := `
		SELECT id, profile_id, title, description, project_url, image_urls, skills_used, completion_date, sort_order, created_at
		FROM portfolio_items WHERE id = $1`

	item := &domain.PortfolioItem{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&item.ID, &item.ProfileID, &item.Title, &item.Description, &item.ProjectURL,
		&item.ImageURLs, &item.SkillsUsed, &item.CompletionDate,
		&item.SortOrder, &item.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperrors.ErrNotFound
	}
	return item, err
}

func (r *PortfolioRepository) GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.PortfolioItem, error) {
	query := `
		SELECT id, profile_id, title, description, project_url, image_urls, skills_used, completion_date, sort_order, created_at
		FROM portfolio_items WHERE profile_id = $1
		ORDER BY sort_order, created_at DESC`

	rows, err := r.db.Query(ctx, query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.PortfolioItem
	for rows.Next() {
		var item domain.PortfolioItem
		if err := rows.Scan(
			&item.ID, &item.ProfileID, &item.Title, &item.Description, &item.ProjectURL,
			&item.ImageURLs, &item.SkillsUsed, &item.CompletionDate,
			&item.SortOrder, &item.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (r *PortfolioRepository) Update(ctx context.Context, item *domain.PortfolioItem) error {
	query := `
		UPDATE portfolio_items SET
			title = $2, description = $3, project_url = $4, image_urls = $5,
			skills_used = $6, completion_date = $7, sort_order = $8
		WHERE id = $1`

	result, err := r.db.Exec(ctx, query,
		item.ID, item.Title, item.Description, item.ProjectURL,
		item.ImageURLs, item.SkillsUsed, item.CompletionDate, item.SortOrder,
	)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}

func (r *PortfolioRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM portfolio_items WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}
	return nil
}
