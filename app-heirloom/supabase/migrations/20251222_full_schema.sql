-- Heirloom Full Database Schema
-- Run this to set up all tables for the MVP

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members junction table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('personal', 'family')),
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vault_owner CHECK (
    (type = 'personal' AND owner_user_id IS NOT NULL AND owner_family_id IS NULL) OR
    (type = 'family' AND owner_family_id IS NOT NULL AND owner_user_id IS NULL)
  )
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'photo')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  category TEXT,
  prompt_id UUID REFERENCES prompts(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_shared_to_family BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_vault ON stories(vault_id);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_created_by ON stories(created_by);
CREATE INDEX IF NOT EXISTS idx_vaults_user ON vaults(owner_user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: can read/update own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vaults: users can view their own vaults
CREATE POLICY "View own vaults" ON vaults
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Insert own vault" ON vaults
  FOR INSERT WITH CHECK (owner_user_id = auth.uid() AND type = 'personal');

-- Stories: users can CRUD their own stories
CREATE POLICY "View stories in own vaults" ON stories
  FOR SELECT USING (
    vault_id IN (SELECT id FROM vaults WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Insert stories to own vault" ON stories
  FOR INSERT WITH CHECK (
    vault_id IN (SELECT id FROM vaults WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Update own stories" ON stories
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Delete own stories" ON stories
  FOR DELETE USING (created_by = auth.uid());

-- Prompts: public read
CREATE POLICY "Anyone can read active prompts" ON prompts
  FOR SELECT USING (is_active = true);

-- Seed prompts
INSERT INTO prompts (text, category) VALUES
  ('What is your favorite childhood memory?', 'childhood'),
  ('What games did you love to play as a child?', 'childhood'),
  ('Describe your childhood home.', 'childhood'),
  ('Who was your best friend growing up?', 'childhood'),
  ('What was school like for you?', 'childhood'),
  ('What was your first job?', 'career'),
  ('What are you most proud of in your career?', 'career'),
  ('Who was a mentor that shaped your professional life?', 'career'),
  ('What was the biggest risk you took in your career?', 'career'),
  ('How did you meet your spouse or partner?', 'family'),
  ('What traditions does your family have?', 'family'),
  ('What do you want your children to know about you?', 'family'),
  ('Describe your wedding day.', 'family'),
  ('What does family mean to you?', 'family'),
  ('What does faith mean to you?', 'faith'),
  ('Was there a moment that shaped your beliefs?', 'faith'),
  ('What values guide your life?', 'faith'),
  ('What do you want your grandchildren to know about you?', 'legacy'),
  ('What was the best advice you ever received?', 'legacy'),
  ('Describe a moment that changed your life.', 'legacy'),
  ('What are you most grateful for?', 'legacy'),
  ('If you could give one piece of advice, what would it be?', 'legacy')
ON CONFLICT DO NOTHING;

-- Storage bucket (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true);
