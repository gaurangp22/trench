package dexscreener

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/shopspring/decimal"
)

// Client is a DexScreener API client
type Client struct {
	httpClient *http.Client
	baseURL    string
}

// TokenInfo contains token information from DexScreener
type TokenInfo struct {
	Name        string           `json:"name"`
	Symbol      string           `json:"symbol"`
	ImageURL    string           `json:"image_url"`
	ATHMarketCap *decimal.Decimal `json:"ath_market_cap"`
	ChainID     string           `json:"chain_id"`
	DexURL      string           `json:"dex_url"`
}

// DexScreener API response structures
type dexResponse struct {
	Pairs []dexPair `json:"pairs"`
}

type dexPair struct {
	ChainID   string    `json:"chainId"`
	DexID     string    `json:"dexId"`
	URL       string    `json:"url"`
	BaseToken dexToken  `json:"baseToken"`
	FDV       float64   `json:"fdv"`
	MarketCap float64   `json:"marketCap"`
	Info      *dexInfo  `json:"info"`
}

type dexToken struct {
	Address string `json:"address"`
	Name    string `json:"name"`
	Symbol  string `json:"symbol"`
}

type dexInfo struct {
	ImageURL string `json:"imageUrl"`
}

// NewClient creates a new DexScreener client
func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: "https://api.dexscreener.com",
	}
}

// GetTokenInfo fetches token information from DexScreener
func (c *Client) GetTokenInfo(ctx context.Context, contractAddress string, chain string) (*TokenInfo, error) {
	// DexScreener API endpoint for token search
	url := fmt.Sprintf("%s/latest/dex/tokens/%s", c.baseURL, contractAddress)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch token info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("DexScreener API returned status %d", resp.StatusCode)
	}

	var dexResp dexResponse
	if err := json.NewDecoder(resp.Body).Decode(&dexResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(dexResp.Pairs) == 0 {
		return nil, fmt.Errorf("token not found on DexScreener")
	}

	// Find the best pair (prefer same chain, highest market cap)
	var bestPair *dexPair
	for i := range dexResp.Pairs {
		pair := &dexResp.Pairs[i]
		// Match chain if specified
		if chain != "" && pair.ChainID != chain {
			continue
		}
		if bestPair == nil || pair.MarketCap > bestPair.MarketCap {
			bestPair = pair
		}
	}

	// If no chain match, use first pair
	if bestPair == nil && len(dexResp.Pairs) > 0 {
		bestPair = &dexResp.Pairs[0]
	}

	if bestPair == nil {
		return nil, fmt.Errorf("no matching token pair found")
	}

	tokenInfo := &TokenInfo{
		Name:    bestPair.BaseToken.Name,
		Symbol:  bestPair.BaseToken.Symbol,
		ChainID: bestPair.ChainID,
		DexURL:  bestPair.URL,
	}

	// Set image URL if available
	if bestPair.Info != nil && bestPair.Info.ImageURL != "" {
		tokenInfo.ImageURL = bestPair.Info.ImageURL
	}

	// Set market cap (use FDV if market cap not available)
	if bestPair.MarketCap > 0 {
		mc := decimal.NewFromFloat(bestPair.MarketCap)
		tokenInfo.ATHMarketCap = &mc
	} else if bestPair.FDV > 0 {
		fdv := decimal.NewFromFloat(bestPair.FDV)
		tokenInfo.ATHMarketCap = &fdv
	}

	return tokenInfo, nil
}
