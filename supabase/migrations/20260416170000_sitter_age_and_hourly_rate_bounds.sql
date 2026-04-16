-- Add sitter age and enforce sane hourly rate bounds.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS sitter_age integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_sitter_age_check'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_sitter_age_check
    CHECK (sitter_age IS NULL OR (sitter_age >= 18 AND sitter_age <= 90));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_hourly_rate_check'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_hourly_rate_check
    CHECK (hourly_rate IS NULL OR (hourly_rate >= 5 AND hourly_rate <= 500));
  END IF;
END $$;
