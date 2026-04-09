-- Pet age + health enrichment for pets and legacy dogs tables

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS age_years INTEGER,
  ADD COLUMN IF NOT EXISTS age_months INTEGER,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS health_issues TEXT;

ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS age_years INTEGER,
  ADD COLUMN IF NOT EXISTS age_months INTEGER,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS health_issues TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_age_years_check'
  ) THEN
    ALTER TABLE public.pets
      ADD CONSTRAINT pets_age_years_check
      CHECK (age_years IS NULL OR age_years >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_age_months_check'
  ) THEN
    ALTER TABLE public.pets
      ADD CONSTRAINT pets_age_months_check
      CHECK (age_months IS NULL OR (age_months >= 0 AND age_months <= 11));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dogs_age_years_check'
  ) THEN
    ALTER TABLE public.dogs
      ADD CONSTRAINT dogs_age_years_check
      CHECK (age_years IS NULL OR age_years >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dogs_age_months_check'
  ) THEN
    ALTER TABLE public.dogs
      ADD CONSTRAINT dogs_age_months_check
      CHECK (age_months IS NULL OR (age_months >= 0 AND age_months <= 11));
  END IF;
END $$;

