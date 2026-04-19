-- Search vector migration for full-text search on posts
-- Payload CMS stores posts in the 'payload' schema

-- 1. Add the search_vector column
ALTER TABLE payload.posts
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Backfill existing rows
UPDATE payload.posts
SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B');

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_posts_search_vector
ON payload.posts USING GIN (search_vector);

-- 4. Create trigger function to keep search_vector in sync
CREATE OR REPLACE FUNCTION payload.posts_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger (drop first to make script idempotent)
DROP TRIGGER IF EXISTS trg_posts_search_vector ON payload.posts;
CREATE TRIGGER trg_posts_search_vector
BEFORE INSERT OR UPDATE OF title, excerpt ON payload.posts
FOR EACH ROW
EXECUTE FUNCTION payload.posts_search_vector_update();
