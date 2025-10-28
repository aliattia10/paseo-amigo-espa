-- Add payment fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'released', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

-- Create index for payment intent lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON bookings(stripe_payment_intent_id);

-- Function to release payment to sitter
CREATE OR REPLACE FUNCTION release_payment_to_sitter(p_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = p_booking_id 
  AND status = 'completed'
  AND payment_status = 'held';
  
  IF v_booking IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update payment status
  UPDATE bookings 
  SET payment_status = 'released'
  WHERE id = p_booking_id;
  
  -- Notify sitter
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.sitter_id,
    'payment_released',
    'Payment Released',
    'Payment for your completed service has been released',
    p_booking_id
  );
  
  RETURN TRUE;
END;
$$;