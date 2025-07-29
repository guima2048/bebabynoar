
-- Migration para remover campos desnecessários
-- Execute com cuidado!

-- 1. Remover campos do User
ALTER TABLE users DROP COLUMN IF EXISTS verified;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS last_payment_date;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE users DROP COLUMN IF EXISTS email_verification_token;
ALTER TABLE users DROP COLUMN IF EXISTS email_verification_expiry;
ALTER TABLE users DROP COLUMN IF EXISTS last_verification_email_sent;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_token;
ALTER TABLE users DROP COLUMN IF EXISTS password_reset_token_expiry;
ALTER TABLE users DROP COLUMN IF EXISTS password_updated_at;
ALTER TABLE users DROP COLUMN IF EXISTS height;
ALTER TABLE users DROP COLUMN IF EXISTS weight;
ALTER TABLE users DROP COLUMN IF EXISTS has_children;
ALTER TABLE users DROP COLUMN IF EXISTS smokes;
ALTER TABLE users DROP COLUMN IF EXISTS drinks;
ALTER TABLE users DROP COLUMN IF EXISTS relationship_type;
ALTER TABLE users DROP COLUMN IF EXISTS available_for_travel;
ALTER TABLE users DROP COLUMN IF EXISTS receive_travelers;
ALTER TABLE users DROP COLUMN IF EXISTS social;
ALTER TABLE users DROP COLUMN IF EXISTS location;

-- 2. Remover tabelas desnecessárias
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS login_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS payment_links CASCADE;
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS manual_activations CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;
DROP TABLE IF EXISTS blog_post_categories CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_likes CASCADE;
DROP TABLE IF EXISTS blog_views CASCADE;
DROP TABLE IF EXISTS blog_analytics CASCADE;
DROP TABLE IF EXISTS blog_images CASCADE;
DROP TABLE IF EXISTS blog_settings CASCADE;
DROP TABLE IF EXISTS smtp_config CASCADE;
DROP TABLE IF EXISTS email_config CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS landing_settings CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS profile_cards CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
    