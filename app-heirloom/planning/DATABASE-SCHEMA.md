# Heirloom Database Schema

**Last Updated:** December 1, 2025
**Status:** Draft
**Owner:** Brian

---

## Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │──────<│family_members│>──────│  families   │
└─────────────┘       └─────────────┘       └─────────────┘
      │                                            │
      │ has one                                    │ has one
      ▼                                            ▼
┌─────────────┐                            ┌─────────────┐
│   vaults    │ (personal)                 │   vaults    │ (family)
└─────────────┘                            └─────────────┘
      │                                            │
      │ contains                                   │ contains
      ▼                                            ▼
┌─────────────┐                            ┌─────────────┐
│   stories   │                            │   stories   │
└─────────────┘                            └─────────────┘
      │
      │ can be in
      ▼
┌─────────────┐       ┌─────────────┐
│time_capsules│──────<│capsule_items│
└─────────────┘       └─────────────┘
```

---

## Tables

### users

Core user account.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supabase Auth handles password/auth - this extends it
-- Link to auth.users via id
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches Supabase Auth) |
| email | TEXT | User's email |
| full_name | TEXT | Display name |
| avatar_url | TEXT | Profile photo URL |
| created_at | TIMESTAMPTZ | Account creation |
| updated_at | TIMESTAMPTZ | Last profile update |

---

### families

A family group that users belong to.

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Family name (e.g., "The McCulloughs") |
| created_by | UUID | User who created the family |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

### family_members

Junction table linking users to families (many-to-many).

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| family_id | UUID | FK to families |
| user_id | UUID | FK to users |
| role | TEXT | Permission level |
| joined_at | TIMESTAMPTZ | When they joined |

**Roles:**
- `owner` - Full control, can delete family
- `admin` - Can invite/remove members
- `member` - Can add stories
- `viewer` - Can only view

---

### vaults

Container for stories. Each user has a personal vault; each family has a shared vault.

```sql
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'personal' or 'family'
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vault_owner CHECK (
    (type = 'personal' AND owner_user_id IS NOT NULL AND owner_family_id IS NULL) OR
    (type = 'family' AND owner_family_id IS NOT NULL AND owner_user_id IS NULL)
  )
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | TEXT | 'personal' or 'family' |
| owner_user_id | UUID | FK to users (if personal) |
| owner_family_id | UUID | FK to families (if family) |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

### stories

The core content - a recorded memory.

```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),

  -- Content
  title TEXT,
  media_type TEXT NOT NULL, -- 'audio', 'video', 'photo'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER, -- for audio/video
  transcript TEXT, -- optional transcription

  -- Categorization
  category TEXT, -- 'childhood', 'career', 'family', 'faith', 'legacy'
  prompt_id UUID REFERENCES prompts(id),

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
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vault_id | UUID | FK to vaults |
| created_by | UUID | FK to users (who recorded) |
| title | TEXT | User-given name |
| media_type | TEXT | 'audio', 'video', 'photo' |
| media_url | TEXT | Supabase Storage URL |
| thumbnail_url | TEXT | Preview image URL |
| duration_seconds | INT | Length of audio/video |
| transcript | TEXT | Optional text transcription |
| category | TEXT | Story category |
| prompt_id | UUID | FK to prompt used (if any) |
| recorded_at | TIMESTAMPTZ | When recorded |
| is_shared_to_family | BOOLEAN | Visible in family vault? |

---

### prompts

Guided questions to spark storytelling.

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT, -- matches story categories
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with initial prompts
INSERT INTO prompts (text, category) VALUES
  ('What is your favorite childhood memory?', 'childhood'),
  ('What was your first job?', 'career'),
  ('How did you meet your spouse?', 'family'),
  ('What traditions did your family have?', 'family'),
  ('What do you want your grandchildren to know about you?', 'legacy'),
  ('What was the best advice you ever received?', 'legacy'),
  ('Describe a moment that changed your life.', 'legacy'),
  ('What did you love to do as a child?', 'childhood'),
  ('What are you most proud of in your career?', 'career'),
  ('What does faith mean to you?', 'faith');
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| text | TEXT | The prompt question |
| category | TEXT | Category it belongs to |
| is_active | BOOLEAN | Show in rotation? |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

### time_capsules

Scheduled release of stories to recipients.

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id),
  title TEXT,
  message TEXT, -- optional note to recipients
  release_at TIMESTAMPTZ NOT NULL,
  released BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capsules_release ON time_capsules(release_at) WHERE NOT released;
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_by | UUID | FK to users |
| title | TEXT | Capsule name |
| message | TEXT | Note to recipients |
| release_at | TIMESTAMPTZ | When to reveal |
| released | BOOLEAN | Has it been opened? |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

### capsule_recipients

Who receives a time capsule.

```sql
CREATE TABLE capsule_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(capsule_id, user_id)
);
```

---

### capsule_items

Stories included in a time capsule.

```sql
CREATE TABLE capsule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  UNIQUE(capsule_id, story_id)
);
```

---

## Row Level Security (RLS) Policies

```sql
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

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can view families they belong to
CREATE POLICY "View own families"
  ON families FOR SELECT
  USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Users can view their own vaults and family vaults they belong to
CREATE POLICY "View own vaults"
  ON vaults FOR SELECT
  USING (
    owner_user_id = auth.uid() OR
    owner_family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

-- Users can view stories in their vaults
CREATE POLICY "View stories in own vaults"
  ON stories FOR SELECT
  USING (
    vault_id IN (
      SELECT id FROM vaults WHERE
        owner_user_id = auth.uid() OR
        owner_family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    )
  );

-- Users can insert stories into their personal vault
CREATE POLICY "Insert stories to own vault"
  ON stories FOR INSERT
  WITH CHECK (
    vault_id IN (SELECT id FROM vaults WHERE owner_user_id = auth.uid())
  );

-- Prompts are public read
CREATE POLICY "Anyone can read prompts"
  ON prompts FOR SELECT
  USING (is_active = true);
```

---

## Storage Buckets (Supabase Storage)

```sql
-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', false);

-- RLS for storage
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stories' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'stories' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Folder structure:**
```
stories/
├── {user_id}/
│   ├── {story_id}.mp4
│   ├── {story_id}.m4a
│   └── {story_id}_thumb.jpg
```

---

## Migration Order

Run these in order:

1. `users` (extends Supabase Auth)
2. `families`
3. `family_members`
4. `vaults`
5. `prompts`
6. `stories`
7. `time_capsules`
8. `capsule_recipients`
9. `capsule_items`
10. RLS policies
11. Storage bucket

---

## Notes

- **Encryption:** For zero-knowledge, we'd add `encrypted_key` column to vaults and encrypt media client-side. Deferred to V2.
- **Soft deletes:** Consider adding `deleted_at` columns instead of hard deletes.
- **Audit log:** Consider adding `story_events` table for tracking views, shares, etc.

---

## Next Steps

1. [ ] Review with Oliver
2. [ ] Run migrations in Supabase
3. [ ] Test RLS policies
4. [ ] Set up storage bucket
5. [ ] Build API helpers in app
