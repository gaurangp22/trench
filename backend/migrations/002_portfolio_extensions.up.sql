-- Portfolio Extensions Migration
-- Adds profile socials and token work items for freelancer portfolios

-- ============================================
-- PROFILE SOCIALS
-- ============================================

CREATE TABLE profile_socials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,  -- 'website', 'twitter', 'telegram', 'discord'
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Each profile can only have one link per platform
CREATE UNIQUE INDEX idx_profile_socials_unique ON profile_socials(profile_id, platform);
CREATE INDEX idx_profile_socials_profile ON profile_socials(profile_id);

-- ============================================
-- TOKEN WORK ITEMS
-- ============================================

CREATE TABLE token_work_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contract_address VARCHAR(100) NOT NULL,
    chain VARCHAR(20) DEFAULT 'solana',
    -- Cached token data (fetched from DexScreener or similar)
    token_name VARCHAR(100),
    token_symbol VARCHAR(20),
    token_image_url TEXT,
    ath_market_cap DECIMAL(24, 2),
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_token_work_profile ON token_work_items(profile_id);
CREATE INDEX idx_token_work_ca ON token_work_items(contract_address);

-- Prevent duplicate CA entries for same profile
CREATE UNIQUE INDEX idx_token_work_unique ON token_work_items(profile_id, contract_address, chain);

-- ============================================
-- PORTFOLIO GALLERY ITEMS (extends existing portfolio_items)
-- ============================================

-- Add gallery-specific fields to portfolio_items if needed
-- For now, the existing portfolio_items table with image_urls serves as the gallery
