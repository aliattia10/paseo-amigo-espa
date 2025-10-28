-- Fix dogs table column names to match expected schema
ALTER TABLE dogs RENAME COLUMN age TO age_years_old;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS age VARCHAR;
UPDATE dogs SET age = age_years_old::VARCHAR WHERE age IS NULL;
ALTER TABLE dogs DROP COLUMN IF EXISTS age_years_old;

-- Ensure correct column types
ALTER TABLE dogs ALTER COLUMN age TYPE VARCHAR;
ALTER TABLE dogs ALTER COLUMN notes TYPE TEXT;
ALTER TABLE dogs ALTER COLUMN image_url TYPE TEXT;
