-- ============================================
-- FIX NOTIFICATIONS TABLE AND BOOKING FLOW
-- Adds missing related_id column and booking functions
-- ============================================

-- 1. Add related_id column to notifications table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'related_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN related_id UUID;
    RAISE NOTICE '✅ Added related_id column to notifications table';
  ELSE
    RAISE NOTICE 'ℹ️ related_id column already exists';
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
    RAISE NOTICE '✅ Renamed is_read to read in notifications table';
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
  -- Get booking details
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Update booking status
  UPDATE bookings
  SET 
    status = p_new_status,
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- If confirmed, update availability to booked (if availability table exists)
  IF p_new_status = 'confirmed' THEN
    -- Try to update availability if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability') THEN
      UPDATE availability
      SET status = 'booked', updated_at = NOW()
      WHERE sitter_id = v_booking.sitter_id
        AND start_time <= v_booking.start_time
        AND end_time >= v_booking.end_time
        AND status = 'available';
    END IF;
    
    -- Create notification for owner
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id
    ) VALUES (
      v_booking.owner_id,
      'booking_confirmed',
      'Booking Confirmed!',
      'Your booking has been confirmed',
      p_booking_id
    );
  END IF;
  
  -- If cancelled, free up availability
  IF p_new_status = 'cancelled' THEN
    -- Try to update availability if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'availability') THEN
      UPDATE availability
      SET status = 'available', updated_at = NOW()
      WHERE sitter_id = v_booking.sitter_id
        AND start_time <= v_booking.start_time
        AND end_time >= v_booking.end_time
        AND status = 'booked';
    END IF;
    
    -- Notify the other party
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id
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
  -- Get booking details
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
  
  -- Check if booking is in correct status
  IF v_booking.status != 'requested' THEN
    RAISE EXCEPTION 'Booking must be in requested status to initiate payment';
  END IF;
  
  -- Return booking details for payment processing
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

-- 5. Create index on related_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_related_id ON notifications(related_id) WHERE related_id IS NOT NULL;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Notifications table and booking flow fixed successfully!';
  RAISE NOTICE '✅ Added related_id column';
  RAISE NOTICE '✅ Created update_booking_status function';
  RAISE NOTICE '✅ Created initiate_booking_payment function';
END $$;

-- Verify the fix
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

