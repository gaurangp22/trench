-- TrenchJobs Database Schema
-- PostgreSQL Migration: Services Marketplace (Rollback)

-- Drop triggers
DROP TRIGGER IF EXISTS update_service_stats_on_review ON service_reviews;
DROP TRIGGER IF EXISTS update_service_order_count_trigger ON service_orders;
DROP TRIGGER IF EXISTS update_service_orders_updated_at ON service_orders;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;

-- Drop functions
DROP FUNCTION IF EXISTS update_service_review_stats();
DROP FUNCTION IF EXISTS update_service_order_count();

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS service_reviews;
DROP TABLE IF EXISTS service_order_messages;
DROP TABLE IF EXISTS service_orders;
DROP TABLE IF EXISTS service_faqs;
DROP TABLE IF EXISTS service_skills;
DROP TABLE IF EXISTS services;
