-- Seed Data: Mock Freelancers with Portfolios
-- Run this after the main migrations to populate demo data

-- ============================================
-- CREATE DEMO USERS (Freelancers)
-- ============================================

-- Password for all demo users: "demo123" (bcrypt hash)
INSERT INTO users (id, email, username, password_hash, is_freelancer, email_verified, account_status) VALUES
('a1000000-0000-0000-0000-000000000001', 'alex.solana@demo.com', 'AlexSolana', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active'),
('a1000000-0000-0000-0000-000000000002', 'maya.rust@demo.com', 'MayaRust', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active'),
('a1000000-0000-0000-0000-000000000003', 'defi.dan@demo.com', 'DeFiDan', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active'),
('a1000000-0000-0000-0000-000000000004', 'nft.nina@demo.com', 'NFTNina', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active'),
('a1000000-0000-0000-0000-000000000005', 'raid.master@demo.com', 'RaidMaster', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active'),
('a1000000-0000-0000-0000-000000000006', 'tokenomics.tim@demo.com', 'TokenomicsTim', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CREATE DEMO PROFILES
-- ============================================

INSERT INTO profiles (id, user_id, display_name, professional_title, avatar_url, overview, country, hourly_rate_sol, available_for_hire, availability_status, average_rating, total_reviews) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Alex Solana', 'Senior Solana Developer', 'https://i.pravatar.cc/150?u=alexsolana', 'Building the future of DeFi on Solana. 5+ years of blockchain experience. Shipped 20+ projects including DEXs, NFT marketplaces, and token launches. Expert in Rust, Anchor, and React.', 'Remote', 65.00, true, 'available', 4.9, 47),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Maya Rust', 'Smart Contract Auditor', 'https://i.pravatar.cc/150?u=mayarust', 'Security researcher and smart contract auditor. Found critical bugs in major protocols. Specializing in Solana program security and Anchor audits.', 'Singapore', 90.00, true, 'available', 5.0, 32),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'DeFi Dan', 'DeFi Protocol Developer', 'https://i.pravatar.cc/150?u=defidan', 'Full-stack DeFi developer with experience building AMMs, lending protocols, and yield aggregators. Previously at major Solana protocols.', 'USA', 75.00, true, 'available', 4.8, 28),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'NFT Nina', 'NFT & Web3 Designer', 'https://i.pravatar.cc/150?u=nftnina', 'Creative director specializing in NFT collections and Web3 branding. Designed for 50+ successful NFT drops. Expert in Figma, Blender, and AI art tools.', 'Germany', 45.00, true, 'available', 4.9, 85),
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Raid Master', 'Community & Marketing Expert', 'https://i.pravatar.cc/150?u=raidmaster', 'Crypto marketing specialist with 100M+ impressions generated. Expert in community building, Twitter raids, and viral campaigns. Grew 10+ projects to 100k+ holders.', 'Dubai', 35.00, true, 'available', 4.7, 120),
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'Tokenomics Tim', 'Tokenomics & Strategy Consultant', 'https://i.pravatar.cc/150?u=tokenomicstim', 'Ex-TradFi quant turned crypto. Designed tokenomics for $500M+ combined market cap. Specializing in sustainable token models and mechanism design.', 'UK', 80.00, true, 'available', 4.8, 23)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ASSIGN SKILLS TO PROFILES
-- ============================================

-- Alex Solana - Full Stack Dev
INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level) VALUES
('b1000000-0000-0000-0000-000000000001', 7, 5, 'expert'),   -- Rust
('b1000000-0000-0000-0000-000000000001', 8, 4, 'expert'),   -- Solana
('b1000000-0000-0000-0000-000000000001', 9, 3, 'expert'),   -- Anchor
('b1000000-0000-0000-0000-000000000001', 3, 5, 'expert'),   -- React
('b1000000-0000-0000-0000-000000000001', 2, 4, 'expert')    -- TypeScript
ON CONFLICT DO NOTHING;

-- Maya Rust - Auditor
INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level) VALUES
('b1000000-0000-0000-0000-000000000002', 7, 6, 'expert'),   -- Rust
('b1000000-0000-0000-0000-000000000002', 10, 4, 'expert'),  -- Smart Contracts
('b1000000-0000-0000-0000-000000000002', 8, 4, 'expert'),   -- Solana
('b1000000-0000-0000-0000-000000000002', 9, 3, 'expert')    -- Anchor
ON CONFLICT DO NOTHING;

-- DeFi Dan - DeFi Dev
INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level) VALUES
('b1000000-0000-0000-0000-000000000003', 12, 4, 'expert'),  -- DeFi
('b1000000-0000-0000-0000-000000000003', 7, 4, 'expert'),   -- Rust
('b1000000-0000-0000-0000-000000000003', 8, 3, 'expert'),   -- Solana
('b1000000-0000-0000-0000-000000000003', 11, 4, 'expert')   -- Web3
ON CONFLICT DO NOTHING;

-- NFT Nina - Designer
INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level) VALUES
('b1000000-0000-0000-0000-000000000004', 14, 6, 'expert'),  -- UI/UX Design
('b1000000-0000-0000-0000-000000000004', 15, 5, 'expert'),  -- Graphic Design
('b1000000-0000-0000-0000-000000000004', 16, 5, 'expert'),  -- Figma
('b1000000-0000-0000-0000-000000000004', 13, 3, 'expert')   -- NFT
ON CONFLICT DO NOTHING;

-- Raid Master - Marketing
INSERT INTO profile_skills (profile_id, skill_id, years_experience, proficiency_level) VALUES
('b1000000-0000-0000-0000-000000000005', 22, 5, 'expert'),  -- Social Media Marketing
('b1000000-0000-0000-0000-000000000005', 21, 4, 'expert'),  -- SEO
('b1000000-0000-0000-0000-000000000005', 18, 4, 'expert')   -- Content Writing
ON CONFLICT DO NOTHING;

-- ============================================
-- ADD SOCIAL LINKS
-- ============================================

INSERT INTO profile_socials (id, profile_id, platform, url) VALUES
-- Alex Solana
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'website', 'https://alexsolana.dev'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'twitter', 'https://twitter.com/alexsolana'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'telegram', 'https://t.me/alexsolana'),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'discord', 'https://discord.gg/alexsolana'),
-- Maya Rust
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'twitter', 'https://twitter.com/mayarust'),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'website', 'https://mayarust.security'),
-- DeFi Dan
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'twitter', 'https://twitter.com/defidan'),
('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'discord', 'https://discord.gg/defidan'),
-- NFT Nina
('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 'website', 'https://nftnina.art'),
('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'twitter', 'https://twitter.com/nftnina'),
-- Raid Master
('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005', 'twitter', 'https://twitter.com/raidmaster'),
('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005', 'telegram', 'https://t.me/raidmaster')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADD TOKEN WORK (Real Solana Token CAs)
-- ============================================

INSERT INTO token_work_items (id, profile_id, contract_address, chain, token_name, token_symbol, token_image_url, ath_market_cap, sort_order) VALUES
-- Alex Solana's work
('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'solana', 'Bonk', 'BONK', 'https://img.fotofolio.xyz/?url=https%3A%2F%2Farweave.net%2FhQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I', 2400000000, 0),
('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', 'solana', 'dogwifhat', 'WIF', 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreibk3covs5ltyqxa272uodhculbr6kea6betidfwy3ajsav2vjzyum.ipfs.nftstorage.link', 4800000000, 1),

-- Maya Rust's audited tokens
('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', 'solana', 'Jupiter', 'JUP', 'https://static.jup.ag/jup/icon.png', 2100000000, 0),
('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'RaydiumXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'solana', 'Raydium', 'RAY', 'https://img.raydium.io/icon/logo.png', 1500000000, 1),

-- DeFi Dan's projects
('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', 'solana', 'Orca', 'ORCA', 'https://www.orca.so/static/media/orca.3f746f54.svg', 800000000, 0),
('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', 'solana', 'Mango', 'MNGO', 'https://trade.mango.markets/assets/icons/logo.svg', 500000000, 1),

-- Raid Master's campaigns
('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', 'solana', 'cat in a dogs world', 'MEW', 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fbafkreidlwyr565dxtao2ipsze6bmzpszqzybz7sqi2zaet5fs7k262jf4a.ipfs.nftstorage.link', 1100000000, 0),
('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000005', 'POPCAT', 'solana', 'Popcat', 'POPCAT', 'https://img.fotofolio.xyz/?url=https%3A%2F%2Fdd.dexscreener.com%2Fds-data%2Ftokens%2Fsolana%2F7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr.png', 1500000000, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- ADD PORTFOLIO GALLERY ITEMS
-- ============================================

INSERT INTO portfolio_items (id, profile_id, title, description, project_url, image_urls, sort_order) VALUES
-- Alex Solana
('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Raydium V3 UI', 'Complete frontend redesign for Raydium DEX V3', 'https://raydium.io', ARRAY['https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400'], 0),
('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'NFT Marketplace', 'Built full-stack NFT marketplace with Metaplex', 'https://example.com', ARRAY['https://images.unsplash.com/photo-1642751227050-feb02d59013a?w=400'], 1),

-- NFT Nina
('e1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 'DeGods Rebrand', 'Brand identity refresh for DeGods NFT collection', 'https://degods.com', ARRAY['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'], 0),
('e1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Mad Lads Website', 'Landing page design for Mad Lads collection', 'https://madlads.com', ARRAY['https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=400'], 1),
('e1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Tensorians Art', 'Character design for Tensorians NFT', 'https://tensor.trade', ARRAY['https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400'], 2),

-- DeFi Dan
('e1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'Drift Protocol V2', 'Perpetuals DEX smart contracts', 'https://drift.trade', ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'], 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE A DEMO CLIENT USER
-- ============================================

INSERT INTO users (id, email, username, password_hash, is_client, email_verified, account_status) VALUES
('a2000000-0000-0000-0000-000000000001', 'client@demo.com', 'DemoClient', '$2a$10$N9qR8YqZwQH5OvIlq8qZeO5N7k4Z8CZqZpQ2eZ5qZeO5N7k4Z8CZq', true, true, 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (id, user_id, display_name, professional_title, avatar_url, overview, country, available_for_hire, availability_status) VALUES
('b2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'Demo Client', 'Project Manager', 'https://i.pravatar.cc/150?u=democlient', 'Looking for talented Solana developers for various DeFi projects.', 'USA', false, 'not_available')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- CREATE SAMPLE JOBS
-- ============================================

INSERT INTO jobs (id, client_id, title, description, category_id, payment_type, budget_min_sol, budget_max_sol, complexity, visibility, status, posted_at) VALUES
('f1000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', 'Build a Solana DEX Frontend', 'Looking for an experienced React developer to build the frontend for our new Solana DEX. Must have experience with wallet integration and DeFi protocols.', 2, 'fixed', 50, 150, 'intermediate', 'public', 'open', NOW()),
('f1000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001', 'Smart Contract Audit for Token Launch', 'Need a security expert to audit our token smart contract before launch. Must have proven track record with Solana programs.', 2, 'fixed', 100, 300, 'expert', 'public', 'open', NOW()),
('f1000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000001', 'NFT Collection Design', 'Creating a 10k PFP collection. Need original character designs with traits and variations. Looking for Web3 native artist.', 3, 'fixed', 30, 80, 'intermediate', 'public', 'open', NOW()),
('f1000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000001', 'Community Manager for Token Launch', 'Hiring experienced community manager for upcoming token launch. Must have experience growing Telegram/Discord communities.', 5, 'hourly', 20, 40, 'entry', 'public', 'open', NOW())
ON CONFLICT DO NOTHING;
