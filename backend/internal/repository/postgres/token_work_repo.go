package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/trenchjob/backend/internal/domain"
	apperrors "github.com/trenchjob/backend/internal/pkg/errors"
)

// TokenWorkRepository implements repository.TokenWorkRepository
type TokenWorkRepository struct {
	db *pgxpool.Pool
}

func NewTokenWorkRepository(db *pgxpool.Pool) *TokenWorkRepository {
	return &TokenWorkRepository{db: db}
}

func (r *TokenWorkRepository) Create(ctx context.Context, item *domain.TokenWorkItem) error {
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}

	query := `
		INSERT INTO token_work_items (
			id, profile_id, contract_address, chain, token_name, token_symbol,
			token_image_url, ath_market_cap, last_fetched_at, sort_order, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`

	_, err := r.db.Exec(ctx, query,
		item.ID, item.ProfileID, item.ContractAddress, item.Chain,
		item.TokenName, item.TokenSymbol, item.TokenImageURL,
		item.ATHMarketCap, item.LastFetchedAt, item.SortOrder)

	return err
}

func (r *TokenWorkRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.TokenWorkItem, error) {
	query := `
		SELECT id, profile_id, contract_address, chain, token_name, token_symbol,
			token_image_url, ath_market_cap, last_fetched_at, sort_order, created_at
		FROM token_work_items
		WHERE id = $1`

	item := &domain.TokenWorkItem{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&item.ID, &item.ProfileID, &item.ContractAddress, &item.Chain,
		&item.TokenName, &item.TokenSymbol, &item.TokenImageURL,
		&item.ATHMarketCap, &item.LastFetchedAt, &item.SortOrder, &item.CreatedAt)

	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return item, nil
}

func (r *TokenWorkRepository) GetByProfileID(ctx context.Context, profileID uuid.UUID) ([]domain.TokenWorkItem, error) {
	query := `
		SELECT id, profile_id, contract_address, chain, token_name, token_symbol,
			token_image_url, ath_market_cap, last_fetched_at, sort_order, created_at
		FROM token_work_items
		WHERE profile_id = $1
		ORDER BY sort_order, created_at DESC`

	rows, err := r.db.Query(ctx, query, profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.TokenWorkItem
	for rows.Next() {
		var item domain.TokenWorkItem
		if err := rows.Scan(
			&item.ID, &item.ProfileID, &item.ContractAddress, &item.Chain,
			&item.TokenName, &item.TokenSymbol, &item.TokenImageURL,
			&item.ATHMarketCap, &item.LastFetchedAt, &item.SortOrder, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (r *TokenWorkRepository) Update(ctx context.Context, item *domain.TokenWorkItem) error {
	query := `
		UPDATE token_work_items SET
			token_name = $2, token_symbol = $3, token_image_url = $4,
			ath_market_cap = $5, last_fetched_at = $6, sort_order = $7
		WHERE id = $1`

	result, err := r.db.Exec(ctx, query,
		item.ID, item.TokenName, item.TokenSymbol, item.TokenImageURL,
		item.ATHMarketCap, item.LastFetchedAt, item.SortOrder)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}

	return nil
}

func (r *TokenWorkRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM token_work_items WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return apperrors.ErrNotFound
	}

	return nil
}
