-- Run in Supabase SQL Editor if create_booking fails with:
--   insert or update on table "bookings" violates foreign key constraint "bookings_dog_id_fkey"
-- The app uses the "pets" table but bookings.dog_id may reference "dogs". This switches the FK to pets(id).

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_dog_id_fkey;

-- Only add FK to pets if the table exists (and you use pets for pet profiles)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_dog_id_fkey
      FOREIGN KEY (dog_id) REFERENCES public.pets(id) ON DELETE CASCADE;
    RAISE NOTICE 'bookings.dog_id now references pets(id)';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_dog_id_fkey
      FOREIGN KEY (dog_id) REFERENCES public.dogs(id) ON DELETE CASCADE;
    RAISE NOTICE 'bookings.dog_id references dogs(id)';
  END IF;
END $$;
