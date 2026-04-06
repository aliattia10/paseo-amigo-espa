-- Rename legacy demo dog name from "Moha" to "Momo"
-- Safe for repeated runs and supports both pets and dogs tables.

UPDATE public.pets
SET name = 'Momo'
WHERE lower(name) = 'moha';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'dogs'
  ) THEN
    UPDATE public.dogs
    SET name = 'Momo'
    WHERE lower(name) = 'moha';
  END IF;
END $$;
