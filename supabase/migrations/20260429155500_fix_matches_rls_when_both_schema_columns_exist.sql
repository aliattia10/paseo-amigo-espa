-- Fix matches/messages visibility when DB has mixed schema columns.
-- Some projects contain BOTH:
--   - matches.user_id / matches.matched_user_id
--   - matches.user1_id / matches.user2_id
-- Earlier policies/functions selected only one variant, which could hide valid rows.

DO $$
DECLARE
  has_user_pair BOOLEAN;
  has_user12_pair BOOLEAN;
  using_expr TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'matched_user_id'
  ) INTO has_user_pair;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user2_id'
  ) INTO has_user12_pair;

  DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
  DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;

  IF has_user_pair AND has_user12_pair THEN
    using_expr := '(auth.uid() = user_id OR auth.uid() = matched_user_id OR auth.uid() = user1_id OR auth.uid() = user2_id)';
  ELSIF has_user_pair THEN
    using_expr := '(auth.uid() = user_id OR auth.uid() = matched_user_id)';
  ELSIF has_user12_pair THEN
    using_expr := '(auth.uid() = user1_id OR auth.uid() = user2_id)';
  ELSE
    using_expr := 'false';
  END IF;

  EXECUTE format(
    'CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT USING (%s)',
    using_expr
  );
END $$;

CREATE OR REPLACE FUNCTION public.is_user_in_match(p_match_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_user_pair BOOLEAN;
  has_user12_pair BOOLEAN;
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'matched_user_id'
  ) INTO has_user_pair;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user2_id'
  ) INTO has_user12_pair;

  IF has_user_pair AND has_user12_pair THEN
    EXECUTE
      'SELECT EXISTS (
         SELECT 1
         FROM public.matches m
         WHERE m.id = $1
           AND (
             m.user_id = $2 OR m.matched_user_id = $2
             OR m.user1_id = $2 OR m.user2_id = $2
           )
       )'
    INTO result
    USING p_match_id, p_user_id;
    RETURN result;
  ELSIF has_user_pair THEN
    EXECUTE
      'SELECT EXISTS (
         SELECT 1
         FROM public.matches m
         WHERE m.id = $1
           AND (m.user_id = $2 OR m.matched_user_id = $2)
       )'
    INTO result
    USING p_match_id, p_user_id;
    RETURN result;
  ELSIF has_user12_pair THEN
    EXECUTE
      'SELECT EXISTS (
         SELECT 1
         FROM public.matches m
         WHERE m.id = $1
           AND (m.user1_id = $2 OR m.user2_id = $2)
       )'
    INTO result
    USING p_match_id, p_user_id;
    RETURN result;
  END IF;

  RETURN FALSE;
END;
$$;
