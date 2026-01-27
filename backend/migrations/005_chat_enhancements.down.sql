-- Rollback chat enhancements

DROP INDEX IF EXISTS idx_message_attachments_message;
DROP FUNCTION IF EXISTS update_user_presence(UUID, BOOLEAN);
DROP INDEX IF EXISTS idx_user_presence_online;
DROP TABLE IF EXISTS user_presence;
