-- Add payout fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_method TEXT CHECK (payout_method IN ('paypal', 'bank'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'bank')),
  payout_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_sitter_id ON payout_requests(sitter_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);

-- Add RLS policies for payout_requests
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Sitters can view their own payout requests
CREATE POLICY "Sitters can view own payout requests"
  ON payout_requests FOR SELECT
  USING (auth.uid() = sitter_id);

-- Sitters can create their own payout requests
CREATE POLICY "Sitters can create own payout requests"
  ON payout_requests FOR INSERT
  WITH CHECK (auth.uid() = sitter_id);

-- Add payment_status to bookings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status TEXT DEFAULT 'pending' 
      CHECK (payment_status IN ('pending', 'held', 'released'));
  END IF;
END $$;

-- Add total_amount and commission_fee to bookings if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='total_amount') THEN
    ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='bookings' AND column_name='commission_fee') THEN
    ALTER TABLE bookings ADD COLUMN commission_fee DECIMAL(10, 2);
  END IF;
END $$;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payout_requests
DROP TRIGGER IF EXISTS update_payout_requests_updated_at ON payout_requests;
CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
