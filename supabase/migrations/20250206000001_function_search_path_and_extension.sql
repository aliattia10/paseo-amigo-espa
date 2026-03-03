-- Fix "role mutable search_path" for all public schema functions.
-- SECURITY DEFINER (and default) functions should set search_path to prevent search_path injection.
-- See: https://supabase.com/docs/guides/database/database-advisors

DO $$
DECLARE
  r RECORD;
  full_sig text;
BEGIN
  FOR r IN
    SELECT p.oid,
           n.nspname,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
  LOOP
    full_sig := quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || r.args || ')';
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public', full_sig);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not set search_path on %: %', full_sig, SQLERRM;
    END;
  END LOOP;
END $$;

-- Move extension btree_gist from public to extensions schema (only if currently in public)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'btree_gist' AND n.nspname = 'public'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION btree_gist SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'btree_gist move skipped or failed: %', SQLERRM;
END $$;
