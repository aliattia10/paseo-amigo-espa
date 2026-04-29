-- Enforce real-user eligibility for matching/messaging entry points.
-- Goal: prevent demo/bot/inactive accounts from participating in new matches.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS eligibility_reason TEXT;

-- Backfill known synthetic/demo patterns.
UPDATE public.users
SET
  is_demo = TRUE,
  eligibility_reason = COALESCE(eligibility_reason, 'demo id/email pattern')
WHERE id::text ~* '^(a1000000-|b2000000-)'
   OR LOWER(COALESCE(email, '')) LIKE '%@demo.petflik.com'
   OR LOWER(COALESCE(email, '')) LIKE '%@example.com';

CREATE OR REPLACE FUNCTION public.is_user_match_eligible(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user_id
      AND COALESCE(u.is_active, TRUE) = TRUE
      AND COALESCE(u.is_demo, FALSE) = FALSE
      AND COALESCE(u.is_bot, FALSE) = FALSE
      AND LOWER(COALESCE(u.email, '')) NOT LIKE '%@demo.petflik.com'
      AND LOWER(COALESCE(u.email, '')) NOT LIKE '%@example.com'
  );
$$;

-- Keep function grant explicit for frontend checks.
GRANT EXECUTE ON FUNCTION public.is_user_match_eligible(UUID) TO authenticated;

-- Recreate check_and_create_match with eligibility gate + schema compatibility.
DROP FUNCTION IF EXISTS check_and_create_match(UUID, UUID);
CREATE OR REPLACE FUNCTION check_and_create_match(
  liker_user_id UUID,
  liked_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reverse_like_exists BOOLEAN;
  match_exists BOOLEAN;
BEGIN
  IF NOT public.is_user_match_eligible(liker_user_id) OR NOT public.is_user_match_eligible(liked_user_id) THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM likes
    WHERE liker_id = liked_user_id AND liked_id = liker_user_id
  ) INTO reverse_like_exists;

  IF NOT reverse_like_exists THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id'
  ) THEN
    SELECT EXISTS(
      SELECT 1
      FROM matches
      WHERE (user1_id = liker_user_id AND user2_id = liked_user_id)
         OR (user1_id = liked_user_id AND user2_id = liker_user_id)
    ) INTO match_exists;

    IF NOT match_exists THEN
      INSERT INTO matches (user1_id, user2_id, created_at)
      SELECT liker_user_id, liked_user_id, NOW()
      WHERE NOT EXISTS (
        SELECT 1
        FROM matches
        WHERE (user1_id = liker_user_id AND user2_id = liked_user_id)
           OR (user1_id = liked_user_id AND user2_id = liker_user_id)
      );
    END IF;
    RETURN TRUE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id'
  ) THEN
    SELECT EXISTS(
      SELECT 1
      FROM matches
      WHERE (user_id = liker_user_id AND matched_user_id = liked_user_id)
         OR (user_id = liked_user_id AND matched_user_id = liker_user_id)
    ) INTO match_exists;

    IF NOT match_exists THEN
      INSERT INTO matches (user_id, matched_user_id, match_type, created_at)
      SELECT liker_user_id, liked_user_id, 'like', NOW()
      WHERE NOT EXISTS (
        SELECT 1
        FROM matches
        WHERE (user_id = liker_user_id AND matched_user_id = liked_user_id)
           OR (user_id = liked_user_id AND matched_user_id = liker_user_id)
      );
    END IF;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;

-- Recreate save_like_and_check_match with eligibility gate.
CREATE OR REPLACE FUNCTION save_like_and_check_match(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reverse_like_exists BOOLEAN;
BEGIN
  IF NOT public.is_user_match_eligible(p_liker_id) OR NOT public.is_user_match_eligible(p_liked_id) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO likes (id, liker_id, liked_id, created_at)
  SELECT gen_random_uuid(), p_liker_id, p_liked_id, NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM likes WHERE liker_id = p_liker_id AND liked_id = p_liked_id
  );

  SELECT EXISTS(
    SELECT 1 FROM likes WHERE liker_id = p_liked_id AND liked_id = p_liker_id
  ) INTO reverse_like_exists;

  IF NOT reverse_like_exists THEN
    RETURN FALSE;
  END IF;

  RETURN check_and_create_match(p_liker_id, p_liked_id);
END;
$$;

GRANT EXECUTE ON FUNCTION save_like_and_check_match(UUID, UUID) TO authenticated;
