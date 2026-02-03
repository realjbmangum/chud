-- Enable RLS on waitlist table
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the signup form)
CREATE POLICY "Allow anon waitlist signup"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No public SELECT/UPDATE/DELETE - only service role can read waitlist entries
