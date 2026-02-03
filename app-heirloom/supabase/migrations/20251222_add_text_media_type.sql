-- Add 'text' as a valid media type for stories
-- This allows written stories to be stored alongside audio, video, and photo

-- First drop the existing constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_media_type_check;

-- Add new constraint that includes 'text'
ALTER TABLE stories ADD CONSTRAINT stories_media_type_check
  CHECK (media_type IN ('audio', 'video', 'photo', 'text'));

-- Update media_url to be nullable for text stories
ALTER TABLE stories ALTER COLUMN media_url DROP NOT NULL;
