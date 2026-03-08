-- KYC columns on profiles table (for projects that use profiles).
-- App primary store is public.users; this adds same columns to profiles if the table exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_confidence NUMERIC(5,4);
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_data JSONB;
    COMMENT ON COLUMN public.profiles.verification_status IS 'KYC status: verified, pending, rejected';
    COMMENT ON COLUMN public.profiles.kyc_confidence IS 'AI face-match confidence 0..1';
    COMMENT ON COLUMN public.profiles.kyc_data IS 'KYC payload: extracted_data, doc_type, etc.';
  END IF;
END $$;
