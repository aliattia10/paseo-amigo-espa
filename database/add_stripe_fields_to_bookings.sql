-- Add Stripe payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'released', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS commission_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent 
ON bookings(stripe_payment_intent_id);

-- Add comment
COMMENT ON COLUMN bookings.stripe_payment_intent_id IS 'Stripe Payment Intent ID for this booking';
COMMENT ON COLUMN bookings.payment_status IS 'Status of payment: pending, held, released, refunded, failed';
COMMENT ON COLUMN bookings.commission_fee IS 'Platform commission fee for this booking';
