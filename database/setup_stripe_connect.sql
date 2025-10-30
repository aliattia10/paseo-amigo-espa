-- ============================================
-- Stripe Connect Setup for Secure Payouts
-- ============================================
-- This migration removes insecure bank account storage
-- and implements Stripe Connect for PCI compliance

-- Drop old insecure table if exists
DROP TABLE IF EXISTS sitter_payout_accounts CASCADE;

-- Create secure Stripe Connect accounts table
CREATE TABLE IF NOT EXISTS stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'express', -- 'standard' or 'express'
  
  -- Account status
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  
  -- Verification status
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'restricted'
  verification_fields_needed TEXT[],
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_link TEXT,
  onboarding_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata (no sensitive data!)
  country TEXT DEFAULT 'ES',
  currency TEXT DEFAULT 'EUR',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update payments table to use Stripe Connect
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS application_fee_amount DECIMAL(10, 2);

-- Add constraint to ensure payment amounts are positive
ALTER TABLE payments ADD CONSTRAINT positive_amount CHECK (amount > 0);
ALTER TABLE payments ADD CONSTRAINT positive_platform_fee CHECK (platform_fee >= 0);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user ON stripe_connect_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_id ON stripe_connect_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payments_transfer ON payments(stripe_transfer_id);
CREATE INDEX IF NOT EXISTS idx_payments_connect_account ON payments(stripe_connect_account_id);

-- RLS Policies
ALTER TABLE stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own Stripe account" ON stripe_connect_accounts;
DROP POLICY IF EXISTS "Users can update own Stripe account" ON stripe_connect_accounts;
DROP POLICY IF EXISTS "Users can insert own Stripe account" ON stripe_connect_accounts;

-- Users can view their own Stripe Connect account
CREATE POLICY "Users can view own Stripe account"
  ON stripe_connect_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own Stripe Connect account
CREATE POLICY "Users can update own Stripe account"
  ON stripe_connect_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own Stripe Connect account
CREATE POLICY "Users can insert own Stripe account"
  ON stripe_connect_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_stripe_account_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_stripe_account_timestamp ON stripe_connect_accounts;
CREATE TRIGGER update_stripe_account_timestamp
  BEFORE UPDATE ON stripe_connect_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_account_timestamp();

-- Function to check if sitter can receive payments
CREATE OR REPLACE FUNCTION can_receive_payments(sitter_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  account_ready BOOLEAN;
BEGIN
  SELECT payouts_enabled AND charges_enabled
  INTO account_ready
  FROM stripe_connect_accounts
  WHERE user_id = sitter_user_id;
  
  RETURN COALESCE(account_ready, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for sitter payout readiness
CREATE OR REPLACE VIEW sitter_payout_status AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  COALESCE(sca.payouts_enabled, FALSE) as can_receive_payments,
  sca.verification_status,
  sca.onboarding_completed,
  sca.stripe_account_id,
  sca.created_at as account_created_at
FROM users u
LEFT JOIN stripe_connect_accounts sca ON u.id = sca.user_id
WHERE u.role = 'sitter';

-- Grant access to the view
GRANT SELECT ON sitter_payout_status TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE stripe_connect_accounts IS 'Stores Stripe Connect account references for sitters. No sensitive financial data is stored here - all handled by Stripe.';
COMMENT ON COLUMN stripe_connect_accounts.stripe_account_id IS 'Reference to Stripe Connect account ID - no sensitive data';
COMMENT ON COLUMN stripe_connect_accounts.onboarding_link IS 'Temporary onboarding link - expires after use';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Stripe Connect setup complete!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Deploy Supabase Edge Functions';
  RAISE NOTICE '2. Set Stripe API keys in Supabase secrets';
  RAISE NOTICE '3. Configure Stripe webhooks';
  RAISE NOTICE '4. Test sitter onboarding flow';
END $$;
