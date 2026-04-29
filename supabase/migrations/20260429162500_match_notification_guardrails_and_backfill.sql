-- Guardrails for match notifications:
-- 1) Prevent type='match' notifications with NULL related_id
-- 2) De-duplicate match notifications per user/match
-- 3) Backfill existing NULL related_id notifications when an unambiguous match exists
-- 4) Keep unresolved rows for manual review

CREATE TABLE IF NOT EXISTS public.notification_match_repair_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.enforce_match_notification_related_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF LOWER(COALESCE(NEW.type, '')) = 'match' AND NEW.related_id IS NULL THEN
    RAISE EXCEPTION 'match notifications require related_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_match_notification_related_id ON public.notifications;
CREATE TRIGGER trg_enforce_match_notification_related_id
BEFORE INSERT OR UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.enforce_match_notification_related_id();

CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_match_user_related
  ON public.notifications (user_id, related_id)
  WHERE LOWER(type) = 'match' AND related_id IS NOT NULL;

DO $$
DECLARE
  has_user12_pair BOOLEAN;
  has_user_pair BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user2_id'
  ) INTO has_user12_pair;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'matched_user_id'
  ) INTO has_user_pair;

  IF has_user12_pair THEN
    EXECUTE $sql$
      WITH unresolved AS (
        SELECT n.id, n.user_id, n.created_at
        FROM public.notifications n
        WHERE LOWER(COALESCE(n.type, '')) = 'match'
          AND n.related_id IS NULL
      ),
      candidates AS (
        SELECT
          u.id AS notification_id,
          m.id AS match_id,
          ABS(EXTRACT(EPOCH FROM (m.created_at - u.created_at))) AS seconds_diff
        FROM unresolved u
        JOIN public.matches m
          ON (m.user1_id = u.user_id OR m.user2_id = u.user_id)
      ),
      ranked AS (
        SELECT
          c.*,
          ROW_NUMBER() OVER (PARTITION BY c.notification_id ORDER BY c.seconds_diff, c.match_id) AS rn,
          COUNT(*) OVER (PARTITION BY c.notification_id) AS cnt
        FROM candidates c
      )
      UPDATE public.notifications n
      SET related_id = r.match_id
      FROM ranked r
      WHERE n.id = r.notification_id
        AND r.rn = 1
        AND r.cnt = 1
        AND n.related_id IS NULL;
    $sql$;
  ELSIF has_user_pair THEN
    EXECUTE $sql$
      WITH unresolved AS (
        SELECT n.id, n.user_id, n.created_at
        FROM public.notifications n
        WHERE LOWER(COALESCE(n.type, '')) = 'match'
          AND n.related_id IS NULL
      ),
      candidates AS (
        SELECT
          u.id AS notification_id,
          m.id AS match_id,
          ABS(EXTRACT(EPOCH FROM (m.created_at - u.created_at))) AS seconds_diff
        FROM unresolved u
        JOIN public.matches m
          ON (m.user_id = u.user_id OR m.matched_user_id = u.user_id)
      ),
      ranked AS (
        SELECT
          c.*,
          ROW_NUMBER() OVER (PARTITION BY c.notification_id ORDER BY c.seconds_diff, c.match_id) AS rn,
          COUNT(*) OVER (PARTITION BY c.notification_id) AS cnt
        FROM candidates c
      )
      UPDATE public.notifications n
      SET related_id = r.match_id
      FROM ranked r
      WHERE n.id = r.notification_id
        AND r.rn = 1
        AND r.cnt = 1
        AND n.related_id IS NULL;
    $sql$;
  END IF;

  INSERT INTO public.notification_match_repair_queue (notification_id, user_id, created_at, reason)
  SELECT n.id, n.user_id, n.created_at, 'No unambiguous match candidate for null related_id'
  FROM public.notifications n
  WHERE LOWER(COALESCE(n.type, '')) = 'match'
    AND n.related_id IS NULL
  ON CONFLICT (notification_id) DO NOTHING;
END $$;
