-- Pet profile enhancements:
-- 1) breed_custom for "Other" free-text breed
-- 2) pet_size for small/medium/large

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS breed_custom TEXT,
  ADD COLUMN IF NOT EXISTS pet_size TEXT;

ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS breed_custom TEXT,
  ADD COLUMN IF NOT EXISTS pet_size TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pets_pet_size_check'
  ) THEN
    ALTER TABLE public.pets
      ADD CONSTRAINT pets_pet_size_check
      CHECK (pet_size IS NULL OR pet_size IN ('small', 'medium', 'large'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dogs_pet_size_check'
  ) THEN
    ALTER TABLE public.dogs
      ADD CONSTRAINT dogs_pet_size_check
      CHECK (pet_size IS NULL OR pet_size IN ('small', 'medium', 'large'));
  END IF;
END $$;

