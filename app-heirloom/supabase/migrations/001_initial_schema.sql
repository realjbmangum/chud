-- Heirloom Database Schema
-- Migration: 001_initial_schema
-- Created: December 2, 2025

-- ============================================
-- 1. USERS TABLE (extends Supabase Auth)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. FAMILIES TABLE
-- ============================================

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FAMILY_MEMBERS TABLE (junction)
-- ============================================

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_family ON family_members(family_id);

-- ============================================
-- 4. VAULTS TABLE
-- ============================================

CREATE TABLE vaults (
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

CREATE INDEX idx_vaults_user ON vaults(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_vaults_family ON vaults(owner_family_id) WHERE owner_family_id IS NOT NULL;

-- Auto-create personal vault for new users
CREATE OR REPLACE FUNCTION public.create_personal_vault()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vaults (type, owner_user_id)
  VALUES ('personal', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_vault
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_personal_vault();

-- ============================================
-- 5. PROMPTS TABLE
-- ============================================

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT CHECK (category IN ('childhood', 'career', 'family', 'faith', 'legacy', 'general')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompts_category ON prompts(category) WHERE is_active = true;

-- Seed initial prompts
INSERT INTO prompts (text, category) VALUES
  ('What is your favorite childhood memory?', 'childhood'),
  ('What games did you play as a kid?', 'childhood'),
  ('What was your first job?', 'career'),
  ('What are you most proud of in your career?', 'career'),
  ('How did you meet your spouse?', 'family'),
  ('What traditions did your family have?', 'family'),
  ('What does faith mean to you?', 'faith'),
  ('How has your faith shaped your life?', 'faith'),
  ('What do you want your grandchildren to know about you?', 'legacy'),
  ('What was the best advice you ever received?', 'legacy'),
  ('Describe a moment that changed your life.', 'legacy'),
  ('What lesson took you the longest to learn?', 'legacy'),
  ('What makes you laugh?', 'general'),
  ('What are you grateful for today?', 'general');

-- ============================================
-- 6. STORIES TABLE
-- ============================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Content
  title TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video', 'photo')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,

  -- Categorization
  category TEXT CHECK (category IN ('childhood', 'career', 'family', 'faith', 'legacy', 'general')),
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,

  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Privacy
  is_shared_to_family BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_stories_vault ON stories(vault_id);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_created_by ON stories(created_by);
CREATE INDEX idx_stories_recorded_at ON stories(recorded_at DESC);

-- ============================================
-- 7. TIME_CAPSULES TABLE
-- ============================================

CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  release_at TIMESTAMPTZ NOT NULL,
  released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capsules_release ON time_capsules(release_at) WHERE NOT released;
CREATE INDEX idx_capsules_user ON time_capsules(created_by);

-- ============================================
-- 8. CAPSULE_RECIPIENTS TABLE
-- ============================================

CREATE TABLE capsule_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(capsule_id, user_id)
);

CREATE INDEX idx_capsule_recipients_capsule ON capsule_recipients(capsule_id);
CREATE INDEX idx_capsule_recipients_user ON capsule_recipients(user_id);

-- ============================================
-- 9. CAPSULE_ITEMS TABLE
-- ============================================

CREATE TABLE capsule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  UNIQUE(capsule_id, story_id)
);

CREATE INDEX idx_capsule_items_capsule ON capsule_items(capsule_id);

-- ============================================
-- 10. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_items ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- FAMILIES policies
CREATE POLICY "Users can view families they belong to"
  ON families FOR SELECT
  USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create families"
  ON families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their families"
  ON families FOR UPDATE
  USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can delete their families"
  ON families FOR DELETE
  USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- FAMILY_MEMBERS policies
CREATE POLICY "Users can view family members of their families"
  ON family_members FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM family_members fm WHERE fm.user_id = auth.uid())
  );

CREATE POLICY "Admins can add family members"
  ON family_members FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    OR NOT EXISTS (SELECT 1 FROM family_members WHERE family_id = family_members.family_id)
  );

CREATE POLICY "Admins can remove family members"
  ON family_members FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- VAULTS policies
CREATE POLICY "Users can view their vaults"
  ON vaults FOR SELECT
  USING (
    owner_user_id = auth.uid() OR
    owner_family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create personal vaults"
  ON vaults FOR INSERT
  WITH CHECK (
    (type = 'personal' AND owner_user_id = auth.uid()) OR
    (type = 'family' AND owner_family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ))
  );

-- STORIES policies
CREATE POLICY "Users can view stories in their vaults"
  ON stories FOR SELECT
  USING (
    vault_id IN (
      SELECT id FROM vaults WHERE
        owner_user_id = auth.uid() OR
        owner_family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create stories in their vaults"
  ON stories FOR INSERT
  WITH CHECK (
    vault_id IN (
      SELECT id FROM vaults WHERE
        owner_user_id = auth.uid() OR
        owner_family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member'))
    )
  );

CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (created_by = auth.uid());

-- PROMPTS policies (public read)
CREATE POLICY "Anyone can read active prompts"
  ON prompts FOR SELECT
  USING (is_active = true);

-- TIME_CAPSULES policies
CREATE POLICY "Users can view their time capsules"
  ON time_capsules FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (SELECT capsule_id FROM capsule_recipients WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create time capsules"
  ON time_capsules FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their time capsules"
  ON time_capsules FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their time capsules"
  ON time_capsules FOR DELETE
  USING (created_by = auth.uid());

-- CAPSULE_RECIPIENTS policies
CREATE POLICY "Users can view recipients of their capsules"
  ON capsule_recipients FOR SELECT
  USING (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can add recipients to their capsules"
  ON capsule_recipients FOR INSERT
  WITH CHECK (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can remove recipients from their capsules"
  ON capsule_recipients FOR DELETE
  USING (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid())
  );

-- CAPSULE_ITEMS policies
CREATE POLICY "Users can view items in their capsules"
  ON capsule_items FOR SELECT
  USING (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid()) OR
    capsule_id IN (SELECT capsule_id FROM capsule_recipients WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add items to their capsules"
  ON capsule_items FOR INSERT
  WITH CHECK (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can remove items from their capsules"
  ON capsule_items FOR DELETE
  USING (
    capsule_id IN (SELECT id FROM time_capsules WHERE created_by = auth.uid())
  );

-- ============================================
-- 11. STORAGE BUCKET
-- ============================================

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  false,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a']
);

-- Storage policies
CREATE POLICY "Users can upload to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stories' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'stories' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stories' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Function to get user's personal vault
CREATE OR REPLACE FUNCTION get_personal_vault(user_uuid UUID)
RETURNS UUID AS $$
  SELECT id FROM vaults WHERE type = 'personal' AND owner_user_id = user_uuid LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
