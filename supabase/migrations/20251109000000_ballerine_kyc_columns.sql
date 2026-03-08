-- Ballerine KYC: optional columns for verification status and payload storage.
-- Webhook sets verified = true and stores payload in kyc_data on workflow.completed.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_data JSONB;

COMMENT ON COLUMN public.users.verification_status IS 'Ballerine workflow status e.g. approved, rejected';
COMMENT ON COLUMN public.users.kyc_data IS 'Ballerine workflow result payload (documents, risk, etc.)';
