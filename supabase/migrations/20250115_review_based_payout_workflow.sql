-- =====================================================
-- Review-Based Payout Workflow (BlaBlaCar-like)
-- =====================================================
-- This migration implements:
-- 1. Payment released to balance only after review is submitted
-- 2. 2-week withdrawal restriction for sitters
-- 3. Balance calculation based on released payments with reviews

-- Add column to track if review was submitted (triggers payment release)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS review_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS balance_released_at TIMESTAMPTZ;

-- Add column to track last withdrawal date for sitters
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_withdrawal_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_withdrawal_eligible_date TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_review_submitted ON bookings(review_submitted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_balance_released ON bookings(balance_released_at);
CREATE INDEX IF NOT EXISTS idx_users_next_withdrawal ON users(next_withdrawal_eligible_date);

-- =====================================================
-- Function: Release payment to balance after review
-- =====================================================
CREATE OR REPLACE FUNCTION release_payment_after_review(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_sitter_amount NUMERIC;
  v_review_exists BOOLEAN;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;
  
  -- Verify booking is completed and confirmed
  IF v_booking.status != 'completed' OR v_booking.completion_confirmed_at IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service must be completed and confirmed by owner first'
    );
  END IF;
  
  -- Verify payment is held
  IF v_booking.payment_status != 'held' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment is not in held status'
    );
  END IF;
  
  -- Check if review exists for this booking
  SELECT EXISTS(
    SELECT 1 FROM reviews 
    WHERE booking_id = p_booking_id
  ) INTO v_review_exists;
  
  IF NOT v_review_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Review must be submitted before payment can be released to balance'
    );
  END IF;
  
  -- Check if already released
  IF v_booking.balance_released_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment already released to balance'
    );
  END IF;
  
  -- Calculate sitter amount (total - commission)
  v_sitter_amount := v_booking.total_price - COALESCE(v_booking.commission_fee, 0);
  
  -- Update booking: mark payment as released and set balance_released_at
  UPDATE bookings 
  SET 
    payment_status = 'released',
    balance_released_at = NOW(),
    payment_released_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Notify sitter
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.sitter_id,
    'payment_released',
    '💰 Payment Added to Balance',
    '€' || v_sitter_amount || ' has been added to your balance and is available for withdrawal',
    p_booking_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'sitter_amount', v_sitter_amount,
    'message', 'Payment released to sitter balance'
  );
END;
$$;

-- =====================================================
-- Function: Get sitter available balance
-- =====================================================
-- Only includes payments that have been:
-- 1. Released (payment_status = 'released')
-- 2. Have review submitted (review_submitted_at IS NOT NULL)
-- 3. Balance released (balance_released_at IS NOT NULL)
CREATE OR REPLACE FUNCTION get_sitter_available_balance(
  p_sitter_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(total_price - COALESCE(commission_fee, 0)), 0)
  INTO v_balance
  FROM bookings
  WHERE sitter_id = p_sitter_id
    AND status = 'completed'
    AND payment_status = 'released'
    AND review_submitted_at IS NOT NULL
    AND balance_released_at IS NOT NULL;
  
  RETURN v_balance;
END;
$$;

-- =====================================================
-- Function: Check if sitter can withdraw
-- =====================================================
-- Sitters can withdraw every 2 weeks (14 days)
CREATE OR REPLACE FUNCTION can_sitter_withdraw(
  p_sitter_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_next_eligible_date TIMESTAMPTZ;
  v_can_withdraw BOOLEAN := FALSE;
  v_days_remaining INTEGER;
BEGIN
  -- Get user info
  SELECT * INTO v_user FROM users WHERE id = p_sitter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_withdraw', false,
      'error', 'User not found'
    );
  END IF;
  
  -- If never withdrawn, can withdraw immediately
  IF v_user.last_withdrawal_date IS NULL THEN
    RETURN jsonb_build_object(
      'can_withdraw', true,
      'next_eligible_date', NOW(),
      'days_remaining', 0,
      'message', 'You can withdraw now'
    );
  END IF;
  
  -- Calculate next eligible date (2 weeks after last withdrawal)
  v_next_eligible_date := v_user.last_withdrawal_date + INTERVAL '14 days';
  
  -- Check if 2 weeks have passed
  IF NOW() >= v_next_eligible_date THEN
    v_can_withdraw := TRUE;
    v_days_remaining := 0;
  ELSE
    v_days_remaining := EXTRACT(DAY FROM (v_next_eligible_date - NOW()))::INTEGER;
  END IF;
  
  RETURN jsonb_build_object(
    'can_withdraw', v_can_withdraw,
    'next_eligible_date', v_next_eligible_date,
    'days_remaining', v_days_remaining,
    'last_withdrawal_date', v_user.last_withdrawal_date,
    'message', CASE 
      WHEN v_can_withdraw THEN 'You can withdraw now'
      ELSE 'You can withdraw in ' || v_days_remaining || ' days'
    END
  );
END;
$$;

-- =====================================================
-- Function: Update last withdrawal date
-- =====================================================
CREATE OR REPLACE FUNCTION update_withdrawal_date(
  p_sitter_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_eligible_date TIMESTAMPTZ;
BEGIN
  -- Calculate next eligible date (2 weeks from now)
  v_next_eligible_date := NOW() + INTERVAL '14 days';
  
  -- Update user's withdrawal dates
  UPDATE users
  SET 
    last_withdrawal_date = NOW(),
    next_withdrawal_eligible_date = v_next_eligible_date,
    updated_at = NOW()
  WHERE id = p_sitter_id;
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- Trigger: Auto-release payment when review is submitted
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_release_payment_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_result JSONB;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking 
  FROM bookings 
  WHERE id = NEW.booking_id;
  
  -- Only proceed if booking is completed and confirmed
  IF v_booking.status = 'completed' 
     AND v_booking.completion_confirmed_at IS NOT NULL
     AND v_booking.payment_status = 'held'
     AND v_booking.balance_released_at IS NULL THEN
    
    -- Mark review as submitted
    UPDATE bookings
    SET review_submitted_at = NOW()
    WHERE id = NEW.booking_id;
    
    -- Release payment to balance
    SELECT release_payment_after_review(NEW.booking_id) INTO v_result;
    
    -- Log result (optional, for debugging)
    IF NOT (v_result->>'success')::BOOLEAN THEN
      RAISE WARNING 'Failed to release payment: %', v_result->>'error';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on reviews table
DROP TRIGGER IF EXISTS release_payment_on_review ON reviews;
CREATE TRIGGER release_payment_on_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_release_payment_on_review();

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION release_payment_after_review(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sitter_available_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_sitter_withdraw(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_withdrawal_date(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION release_payment_after_review IS 'Releases payment to sitter balance after review is submitted';
COMMENT ON FUNCTION get_sitter_available_balance IS 'Calculates available balance from released payments with reviews';
COMMENT ON FUNCTION can_sitter_withdraw IS 'Checks if sitter can withdraw (2-week restriction)';
COMMENT ON FUNCTION update_withdrawal_date IS 'Updates last withdrawal date when sitter requests payout';

