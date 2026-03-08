-- Ensure every auth.users row has a corresponding public.users row so likes/matches work.
-- Fixes: 406 on users select (user missing), 409 on save_like_and_check_match (FK liker_id -> public.users).

-- 1. Function: on auth.users INSERT, add row to public.users (id = auth id, from meta + email)
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, phone, city, postal_code, user_type)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), 'User'),
    COALESCE(NEW.email, ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'city'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'postal_code'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'user_type'), ''), 'owner')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Trigger: run after every insert on auth.users
DROP TRIGGER IF EXISTS sync_auth_user_to_public_users_trigger ON auth.users;
CREATE TRIGGER sync_auth_user_to_public_users_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_to_public_users();

-- 3. Backfill: insert into public.users any auth.users that don't have a row yet (e.g. existing new user 2d26b582-...)
INSERT INTO public.users (id, name, email, phone, city, postal_code, user_type)
SELECT
  au.id,
  COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'name'), ''), 'User'),
  COALESCE(au.email, ''),
  COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'phone'), ''), ''),
  COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'city'), ''), ''),
  COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'postal_code'), ''), ''),
  COALESCE(NULLIF(TRIM(au.raw_user_meta_data->>'user_type'), ''), 'owner')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;
