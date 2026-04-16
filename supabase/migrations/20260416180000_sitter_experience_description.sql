-- Add free-text sitter experience description and ensure base columns exist.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS experience_description TEXT,
  ADD COLUMN IF NOT EXISTS has_pet_experience BOOLEAN,
  ADD COLUMN IF NOT EXISTS pets_cared_for INTEGER,
  ADD COLUMN IF NOT EXISTS years_experience INTEGER,
  ADD COLUMN IF NOT EXISTS sitter_age INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_experience_description_length_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_experience_description_length_check
      CHECK (experience_description IS NULL OR char_length(experience_description) <= 200);
  END IF;
END $$;
