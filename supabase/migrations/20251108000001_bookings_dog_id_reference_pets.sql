-- Allow bookings.dog_id to reference pets(id) so owners using the pets table can create bookings.
-- Fixes: insert or update on table "bookings" violates foreign key constraint "bookings_dog_id_fkey"

DO $$
BEGIN
  -- Drop existing FK to dogs if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_dog_id_fkey' AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT bookings_dog_id_fkey;
  END IF;

  -- If pets table exists, add FK to pets(id) so app can pass pet ids
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_dog_id_fkey
      FOREIGN KEY (dog_id) REFERENCES public.pets(id) ON DELETE CASCADE;
    RETURN;
  END IF;

  -- If no pets table, re-add FK to dogs(id) so existing schema still works
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_dog_id_fkey
      FOREIGN KEY (dog_id) REFERENCES public.dogs(id) ON DELETE CASCADE;
  END IF;
END $$;
