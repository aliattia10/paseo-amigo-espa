-- Add payout-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payout_method TEXT CHECK (payout_method IN ('paypal', 'bank')),
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_payout_method ON users(payout_method);

-- Add comment for documentation
COMMENT ON COLUMN users.payout_method IS 'Preferred payout method: paypal or bank';
COMMENT ON COLUMN users.paypal_email IS 'PayPal email address for payouts';
COMMENT ON COLUMN users.bank_name IS 'Bank name for SEPA transfers';
COMMENT ON COLUMN users.iban IS 'IBAN for bank transfers';
COMMENT ON COLUMN users.account_holder_name IS 'Name of the bank account holder';
