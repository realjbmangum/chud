-- Add missing columns to existing waitlist table
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'landing_page';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments
COMMENT ON TABLE waitlist IS 'Email waitlist for Heirloom landing page';
COMMENT ON COLUMN waitlist.source IS 'Where the signup came from (landing_page, social, etc)';
COMMENT ON COLUMN waitlist.converted_at IS 'When the user converted to a real account';
