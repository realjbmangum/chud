-- Heirloom UX Overhaul Database Migration
-- Adds family tree, milestones, progress tracking, and activity feed

-- ============================================
-- FAMILY TREE TABLES
-- ============================================

-- Family tree members (can be app users or placeholder profiles)
CREATE TABLE IF NOT EXISTS family_tree_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for placeholder profiles
  full_name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE,
  avatar_url TEXT,
  bio TEXT,
  is_placeholder BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family relationships (parent-child, spouse, sibling)
CREATE TABLE IF NOT EXISTS family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID REFERENCES family_tree_members(id) ON DELETE CASCADE,
  related_person_id UUID REFERENCES family_tree_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(person_id, related_person_id, relationship_type)
);

-- ============================================
-- LIFE EVENTS & MILESTONES
-- ============================================

-- Life events (birthdays, anniversaries, holidays, etc.)
CREATE TABLE IF NOT EXISTS life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  family_tree_member_id UUID REFERENCES family_tree_members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'holiday', 'memorial', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('yearly', 'monthly')),
  reminder_days_before INTEGER DEFAULT 7,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROGRESS & ACHIEVEMENTS
-- ============================================

-- User streaks (daily/weekly recording streaks)
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('daily', 'weekly')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);

-- User progress per category
CREATE TABLE IF NOT EXISTS user_category_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  stories_count INTEGER DEFAULT 0,
  total_prompts INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- ============================================
-- ACTIVITY FEED
-- ============================================

-- Activity feed for dashboard
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('story_created', 'story_shared', 'member_joined', 'milestone_reached', 'streak_achieved', 'achievement_earned')),
  title TEXT NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_family_tree_members_family ON family_tree_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_tree_members_user ON family_tree_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_person ON family_relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_related ON family_relationships(related_person_id);
CREATE INDEX IF NOT EXISTS idx_life_events_family ON life_events(family_id);
CREATE INDEX IF NOT EXISTS idx_life_events_date ON life_events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_progress_user ON user_category_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_family ON activity_feed(family_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE family_tree_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Family tree members: viewable by family members
CREATE POLICY "View family tree members" ON family_tree_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Insert family tree members" ON family_tree_members
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Update family tree members" ON family_tree_members
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Delete family tree members" ON family_tree_members
  FOR DELETE USING (created_by = auth.uid());

-- Family relationships: viewable by family members
CREATE POLICY "View family relationships" ON family_relationships
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Manage family relationships" ON family_relationships
  FOR ALL USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Life events: viewable by family members, editable by creator
CREATE POLICY "View life events" ON life_events
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Insert life events" ON life_events
  FOR INSERT WITH CHECK (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Update own life events" ON life_events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Delete own life events" ON life_events
  FOR DELETE USING (created_by = auth.uid());

-- User streaks: only own data
CREATE POLICY "Manage own streaks" ON user_streaks
  FOR ALL USING (user_id = auth.uid());

-- User achievements: only own data
CREATE POLICY "Manage own achievements" ON user_achievements
  FOR ALL USING (user_id = auth.uid());

-- User category progress: only own data
CREATE POLICY "Manage own progress" ON user_category_progress
  FOR ALL USING (user_id = auth.uid());

-- Activity feed: viewable by family members
CREATE POLICY "View activity feed" ON activity_feed
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Insert activity" ON activity_feed
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS FOR PROGRESS TRACKING
-- ============================================

-- Function to update category progress when a story is created
CREATE OR REPLACE FUNCTION update_category_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_category_progress (user_id, category, stories_count)
  VALUES (NEW.created_by, NEW.category, 1)
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    stories_count = user_category_progress.stories_count + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress on story insert
DROP TRIGGER IF EXISTS trigger_update_category_progress ON stories;
CREATE TRIGGER trigger_update_category_progress
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_progress();

-- Function to update streaks
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_daily INTEGER;
BEGIN
  -- Get current streak info
  SELECT last_activity_date, current_streak INTO last_date, current_daily
  FROM user_streaks
  WHERE user_id = NEW.created_by AND streak_type = 'daily';

  IF last_date IS NULL THEN
    -- First activity ever
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.created_by, 'daily', 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id, streak_type) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(user_streaks.longest_streak, 1),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();
  ELSIF last_date = CURRENT_DATE THEN
    -- Already recorded today, no change
    NULL;
  ELSIF last_date = CURRENT_DATE - 1 THEN
    -- Consecutive day, increment streak
    UPDATE user_streaks
    SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.created_by AND streak_type = 'daily';
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_streaks
    SET
      current_streak = 1,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.created_by AND streak_type = 'daily';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak on story insert
DROP TRIGGER IF EXISTS trigger_update_streak ON stories;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Function to add activity feed entry
CREATE OR REPLACE FUNCTION add_story_activity()
RETURNS TRIGGER AS $$
DECLARE
  vault_family_id UUID;
  user_name TEXT;
BEGIN
  -- Get family_id from vault if it's a family vault
  SELECT owner_family_id INTO vault_family_id
  FROM vaults
  WHERE id = NEW.vault_id AND type = 'family';

  -- Get user name
  SELECT full_name INTO user_name
  FROM users
  WHERE id = NEW.created_by;

  -- Add activity entry
  INSERT INTO activity_feed (family_id, user_id, activity_type, title, description, reference_id, reference_type)
  VALUES (
    vault_family_id,
    NEW.created_by,
    'story_created',
    COALESCE(user_name, 'Someone') || ' recorded a new story',
    NEW.title,
    NEW.id,
    'story'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add activity on story insert
DROP TRIGGER IF EXISTS trigger_add_story_activity ON stories;
CREATE TRIGGER trigger_add_story_activity
  AFTER INSERT ON stories
  FOR EACH ROW
  EXECUTE FUNCTION add_story_activity();

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Initialize streaks for existing users (will be created on first story)
-- No seed data needed, triggers handle creation
