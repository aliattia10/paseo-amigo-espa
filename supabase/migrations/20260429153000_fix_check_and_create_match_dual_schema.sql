-- Ensure check_and_create_match works with either matches schema:
-- - user_id / matched_user_id
-- - user1_id / user2_id
-- Idempotent and safe for mixed environments.

DROP FUNCTION IF EXISTS check_and_create_match(uuid, uuid);

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
  SELECT EXISTS(
    SELECT 1
    FROM likes
    WHERE liker_id = liked_user_id
      AND liked_id = liker_user_id
  ) INTO reverse_like_exists;

  IF NOT reverse_like_exists THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'matches'
      AND column_name = 'user1_id'
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
    WHERE table_schema = 'public'
      AND table_name = 'matches'
      AND column_name = 'user_id'
  ) THEN
    SELECT EXISTS(
      SELECT 1
      FROM matches
      WHERE (user_id = liker_user_id AND matched_user_id = liked_user_id)
         OR (user_id = liked_user_id AND matched_user_id = liker_user_id)
    ) INTO match_exists;

    IF NOT match_exists THEN
      INSERT INTO matches (user_id, matched_user_id, match_type, is_mutual, matched_at, created_at)
      SELECT liker_user_id, liked_user_id, 'like', TRUE, NOW(), NOW()
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
