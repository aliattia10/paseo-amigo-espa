-- Fix notifications table and booking flow

-- 1. Add related_id column to notifications table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'related_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN related_id UUID;
  END IF;
END $$;

-- 2. Rename is_read to read for consistency (if needed)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    ALTER TABLE notifications RENAME COLUMN is_read TO read;
  END IF;
END $$;

-- 3. Create or replace function to update booking status
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT,
  p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  UPDATE bookings
  SET 
    status = p_new_status,
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  IF p_new_status = 'confirmed' THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability') THEN
      UPDATE availability
      SET status = 'booked', updated_at = NOW()
      WHERE sitter_id = v_booking.sitter_id
        AND start_time <= v_booking.start_time
        AND end_time >= v_booking.end_time
        AND status = 'available';
    END IF;
    
    INSERT INTO notifications (
      user_id, type, title, message, related_id
    ) VALUES (
      v_booking.owner_id,
      'booking_confirmed',
      'Booking Confirmed!',
      'Your booking has been confirmed',
      p_booking_id
    );
  END IF;
  
  IF p_new_status = 'cancelled' THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability') THEN
      UPDATE availability
      SET status = 'available', updated_at = NOW()
      WHERE sitter_id = v_booking.sitter_id
        AND start_time <= v_booking.start_time
        AND end_time >= v_booking.end_time
        AND status = 'booked';
    END IF;
    
    INSERT INTO notifications (
      user_id, type, title, message, related_id
    ) VALUES (
      CASE 
        WHEN v_booking.status = 'requested' THEN v_booking.owner_id
        ELSE v_booking.sitter_id
      END,
      'booking_cancelled',
      'Booking Cancelled',
      'A booking has been cancelled',
      p_booking_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 4. Create function to initiate booking payment
CREATE OR REPLACE FUNCTION initiate_booking_payment(
  p_booking_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_result JSON;
BEGIN
  SELECT 
    b.*,
    s.name as sitter_name,
    o.name as owner_name,
    o.email as owner_email
  INTO v_booking 
  FROM bookings b
  JOIN users s ON b.sitter_id = s.id
  JOIN users o ON b.owner_id = o.id
  WHERE b.id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  IF v_booking.status != 'requested' THEN
    RAISE EXCEPTION 'Booking must be in requested status to initiate payment';
  END IF;
  
  v_result := json_build_object(
    'booking_id', v_booking.id,
    'amount', v_booking.total_price,
    'commission_fee', v_booking.commission_fee,
    'sitter_amount', v_booking.total_price - v_booking.commission_fee,
    'sitter_id', v_booking.sitter_id,
    'owner_email', v_booking.owner_email,
    'description', 'Booking with ' || v_booking.sitter_name
  );
  
  RETURN v_result;
END;
$$;

-- 5. Create index on related_id
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id) WHERE related_id IS NOT NULL;

