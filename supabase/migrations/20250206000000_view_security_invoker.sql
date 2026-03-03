-- Fix Security Definer views: run with caller's permissions (RLS applies)
-- See: https://www.postgresql.org/docs/current/sql-alterview.html

-- public.public_profiles: use invoker so RLS of the querying user applies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'public_profiles'
  ) THEN
    ALTER VIEW public.public_profiles SET (security_invoker = on);
  END IF;
END $$;

-- public.sitter_payout_status: use invoker so sitters only see their own data via RLS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'sitter_payout_status'
  ) THEN
    ALTER VIEW public.sitter_payout_status SET (security_invoker = on);
  END IF;
END $$; 
