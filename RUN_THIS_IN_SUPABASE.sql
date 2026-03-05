-- Run in Supabase Dashboard -> SQL Editor -> New query -> Paste and Run
-- Fixes RLS so dashboard, bookings, profiles and pets/sitters load

ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable public read access" ON public.subscription_plans;
CREATE POLICY "Enable public read access" ON public.subscription_plans FOR SELECT TO public USING (true);

ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users and Sitters can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Sitter can view bookings" ON public.bookings;
CREATE POLICY "Users and Sitters can view their own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

DROP POLICY IF EXISTS "Authenticated can read users for joins" ON public.users;
CREATE POLICY "Authenticated can read users for joins" ON public.users FOR SELECT TO authenticated USING (true);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN
    ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated can read pets for discovery" ON public.pets;
    CREATE POLICY "Authenticated can read pets for discovery" ON public.pets FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN
    ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated can read dogs for discovery" ON public.dogs;
    CREATE POLICY "Authenticated can read dogs for discovery" ON public.dogs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- likes / passes / pet_likes / pet_passes (for discovery feed and swipe state)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'likes') THEN
    ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can read own likes" ON public.likes;
    CREATE POLICY "Users can read own likes" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = liker_id);
    DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
    CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = liker_id);
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'passes') THEN
    ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can read own passes" ON public.passes;
    CREATE POLICY "Users can read own passes" ON public.passes FOR SELECT TO authenticated USING (auth.uid() = passer_id);
    DROP POLICY IF EXISTS "Users can insert own passes" ON public.passes;
    CREATE POLICY "Users can insert own passes" ON public.passes FOR INSERT TO authenticated WITH CHECK (auth.uid() = passer_id);
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pet_likes') THEN
    ALTER TABLE public.pet_likes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Sitters can read own pet likes" ON public.pet_likes;
    CREATE POLICY "Sitters can read own pet likes" ON public.pet_likes FOR SELECT TO authenticated USING (auth.uid() = sitter_id);
    DROP POLICY IF EXISTS "Sitters can insert own pet likes" ON public.pet_likes;
    CREATE POLICY "Sitters can insert own pet likes" ON public.pet_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = sitter_id);
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pet_passes') THEN
    ALTER TABLE public.pet_passes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Sitters can read own pet passes" ON public.pet_passes;
    CREATE POLICY "Sitters can read own pet passes" ON public.pet_passes FOR SELECT TO authenticated USING (auth.uid() = sitter_id);
    DROP POLICY IF EXISTS "Sitters can insert own pet passes" ON public.pet_passes;
    CREATE POLICY "Sitters can insert own pet passes" ON public.pet_passes FOR INSERT TO authenticated WITH CHECK (auth.uid() = sitter_id);
  END IF;
END $$;
