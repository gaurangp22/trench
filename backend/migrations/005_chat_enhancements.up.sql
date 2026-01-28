-- Chat Enhancements Migration
-- Add user presence tracking for online status

-- User presence table for tracking online/offline status
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick online status lookups
CREATE INDEX IF NOT EXISTS idx_user_presence_online ON user_presence(is_online) WHERE is_online = TRUE;

-- Function to update presence
CREATE OR REPLACE FUNCTION update_user_presence(p_user_id UUID, p_is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_presence (user_id, is_online, last_seen_at, updated_at)
    VALUES (p_user_id, p_is_online, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET is_online = p_is_online,
        last_seen_at = CASE WHEN p_is_online THEN user_presence.last_seen_at ELSE NOW() END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add index for faster attachment lookups
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
