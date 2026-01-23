package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
)

// SocialRepository implements repository.SocialRepository
type SocialRepository struct {
	db *pgxpool.Pool
}

func NewSocialRepository(db *pgxpool.Pool) *SocialRepository {
	return &SocialRepository{db: db}
}

func (r *SocialRepository) GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.ProfileSocial, error) {
	query := `
		SELECT id, profile_id, platform, url, created_at
		FROM profile_socials
		WHERE profile_id = $1
		ORDER BY platform`

	rows, err := r.db.Query(ctx, query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var socials []domain.ProfileSocial
	for rows.Next() {
		var s domain.ProfileSocial
		if err := rows.Scan(&s.ID, &s.ProfileID, &s.Platform, &s.URL, &s.CreatedAt); err != nil {
			return nil, err
		}
		socials = append(socials, s)
	}

	return socials, nil
}

func (r *SocialRepository) Upsert(ctx context.Context, social *domain.ProfileSocial) error {
	if social.ID == uuid.Nil {
		social.ID = uuid.New()
	}

	query := `
		INSERT INTO profile_socials (id, profile_id, platform, url, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (profile_id, platform)
		DO UPDATE SET url = EXCLUDED.url`

	_, err := r.db.Exec(ctx, query, social.ID, social.ProfileID, social.Platform, social.URL)
	return err
}

func (r *SocialRepository) Delete(ctx context.Context, profileID uuid.UUID, platform string) error {
	query := `DELETE FROM profile_socials WHERE profile_id = $1 AND platform = $2`
	_, err := r.db.Exec(ctx, query, profileID, platform)
	return err
}

func (r *SocialRepository) DeleteAllByProfileID(ctx context.Context, profileID uuid.UUID) error {
	query := `DELETE FROM profile_socials WHERE profile_id = $1`
	_, err := r.db.Exec(ctx, query, profileID)
	return err
}
