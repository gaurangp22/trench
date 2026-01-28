-- TrenchJobs Database Schema
-- PostgreSQL Migration: Services Marketplace (Freelancer Gigs)

-- ============================================
-- SERVICES (Freelancer-created gigs)
-- ============================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES job_categories(id),

    -- Pricing tiers (basic/standard/premium)
    basic_price_sol DECIMAL(18, 9),
    basic_description TEXT,
    basic_delivery_days INTEGER,
    basic_revisions INTEGER DEFAULT 1,

    standard_price_sol DECIMAL(18, 9),
    standard_description TEXT,
    standard_delivery_days INTEGER,
    standard_revisions INTEGER DEFAULT 2,

    premium_price_sol DECIMAL(18, 9),
    premium_description TEXT,
    premium_delivery_days INTEGER,
    premium_revisions INTEGER DEFAULT 3,

    -- Metadata
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, archived
    visibility VARCHAR(20) DEFAULT 'public',
    thumbnail_url TEXT,
    gallery_urls TEXT[],

    -- Statistics
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE SKILLS (Many-to-many junction)
-- ============================================

CREATE TABLE service_skills (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, skill_id)
);

-- ============================================
-- SERVICE FAQS
-- ============================================

CREATE TABLE service_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE ORDERS (Client purchases)
-- ============================================

CREATE TABLE service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id),
    client_id UUID NOT NULL REFERENCES users(id),
    freelancer_id UUID NOT NULL REFERENCES users(id),

    -- Selected package
    package_tier VARCHAR(20) NOT NULL, -- basic, standard, premium
    price_sol DECIMAL(18, 9) NOT NULL,
    delivery_days INTEGER NOT NULL,
    revisions_allowed INTEGER NOT NULL,
    revisions_used INTEGER DEFAULT 0,

    -- Custom requirements from client
    requirements TEXT,

    -- Status tracking
    status VARCHAR(30) DEFAULT 'pending', -- pending, active, delivered, revision_requested, completed, cancelled, disputed

    -- Timeline
    started_at TIMESTAMP WITH TIME ZONE,
    expected_delivery_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Escrow integration
    escrow_account_address VARCHAR(44),
    escrow_funded BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE ORDER MESSAGES
-- ============================================

CREATE TABLE service_order_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_text TEXT NOT NULL,
    attachment_urls TEXT[],
    message_type VARCHAR(20) DEFAULT 'text', -- text, delivery, revision_request, system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE REVIEWS
-- ============================================

CREATE TABLE service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES service_orders(id),
    service_id UUID NOT NULL REFERENCES services(id),
    reviewer_id UUID NOT NULL REFERENCES users(id), -- client
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Services
CREATE INDEX idx_services_freelancer ON services(freelancer_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_visibility_status ON services(visibility, status);
CREATE INDEX idx_services_created ON services(created_at DESC);

-- Full-text search for services
CREATE INDEX idx_services_search ON services USING GIN(to_tsvector('english', title || ' ' || description));

-- Service skills
CREATE INDEX idx_service_skills_service ON service_skills(service_id);
CREATE INDEX idx_service_skills_skill ON service_skills(skill_id);

-- Service FAQs
CREATE INDEX idx_service_faqs_service ON service_faqs(service_id);

-- Service orders
CREATE INDEX idx_service_orders_service ON service_orders(service_id);
CREATE INDEX idx_service_orders_client ON service_orders(client_id);
CREATE INDEX idx_service_orders_freelancer ON service_orders(freelancer_id);
CREATE INDEX idx_service_orders_status ON service_orders(status);
CREATE INDEX idx_service_orders_created ON service_orders(created_at DESC);

-- Service order messages
CREATE INDEX idx_service_order_messages_order ON service_order_messages(order_id);
CREATE INDEX idx_service_order_messages_created ON service_order_messages(created_at DESC);

-- Service reviews
CREATE INDEX idx_service_reviews_service ON service_reviews(service_id);
CREATE INDEX idx_service_reviews_reviewer ON service_reviews(reviewer_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Apply updated_at trigger to services
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to service_orders
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update service order count
CREATE OR REPLACE FUNCTION update_service_order_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE services SET orders_count = orders_count + 1 WHERE id = NEW.service_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE services SET orders_count = orders_count - 1 WHERE id = OLD.service_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_order_count_trigger
AFTER INSERT OR DELETE ON service_orders
FOR EACH ROW EXECUTE FUNCTION update_service_order_count();

-- Function to update service review stats
CREATE OR REPLACE FUNCTION update_service_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE services
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM service_reviews
            WHERE service_id = NEW.service_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM service_reviews
            WHERE service_id = NEW.service_id
        )
    WHERE id = NEW.service_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_stats_on_review
AFTER INSERT OR UPDATE ON service_reviews
FOR EACH ROW EXECUTE FUNCTION update_service_review_stats();
