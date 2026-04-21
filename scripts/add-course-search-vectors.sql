-- Search vector migration for full-text search on courses and lessons
-- Mirrors the pattern in add-search-vector.sql (posts)

-- ============================================================
-- COURSES — title (A) + excerpt (B)
-- ============================================================

-- 1. Add the search_vector column
ALTER TABLE payload.courses
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Backfill existing rows
UPDATE payload.courses
SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B');

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_courses_search_vector
ON payload.courses USING GIN (search_vector);

-- 4. Create trigger function to keep search_vector in sync
CREATE OR REPLACE FUNCTION payload.courses_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger (drop first to make script idempotent)
DROP TRIGGER IF EXISTS trg_courses_search_vector ON payload.courses;
CREATE TRIGGER trg_courses_search_vector
BEFORE INSERT OR UPDATE OF title, excerpt ON payload.courses
FOR EACH ROW
EXECUTE FUNCTION payload.courses_search_vector_update();

-- ============================================================
-- LESSONS — title (A) only
-- ============================================================

-- 1. Add the search_vector column
ALTER TABLE payload.lessons
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Backfill existing rows
UPDATE payload.lessons
SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A');

-- 3. Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_lessons_search_vector
ON payload.lessons USING GIN (search_vector);

-- 4. Create trigger function to keep search_vector in sync
CREATE OR REPLACE FUNCTION payload.lessons_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger (drop first to make script idempotent)
DROP TRIGGER IF EXISTS trg_lessons_search_vector ON payload.lessons;
CREATE TRIGGER trg_lessons_search_vector
BEFORE INSERT OR UPDATE OF title ON payload.lessons
FOR EACH ROW
EXECUTE FUNCTION payload.lessons_search_vector_update();
