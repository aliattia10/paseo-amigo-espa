-- RLS for pets (and dogs) so dashboard discovery feed returns rows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN
    ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated can read pets for discovery" ON public.pets;
    CREATE POLICY "Authenticated can read pets for discovery" ON public.pets FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN
    ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated can read dogs for discovery" ON public.dogs;
    CREATE POLICY "Authenticated can read dogs for discovery" ON public.dogs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
