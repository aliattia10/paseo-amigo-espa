-- =====================================================
-- PAYMENT ESCROW SYSTEM WITH 3-DAY HOLD
-- =====================================================
-- This migration implements:
-- 1. Payment held until service completion
-- 2. 3-day waiting period after completion
-- 3. Owner confirmation required
-- 4. Review system integration
-- =====================================================

-- Add new columns to bookings table for escrow system
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_confirmed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS completion_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS eligible_for_release_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_released_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);
CREATE INDEX IF NOT EXISTS idx_bookings_eligible_for_release ON bookings(eligible_for_release_at) 
WHERE payment_status = 'held' AND status = 'completed';

-- =====================================================
-- FUNCTION: Mark Service as Completed by Sitter
-- =====================================================
CREATE OR REPLACE FUNCTION mark_service_completed(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();
  
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
  
  -- Verify user is the sitter
  IF v_booking.sitter_id != v_current_user THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only the sitter can mark service as completed'
    );
  END IF;
  
  -- Verify booking is in correct status
  IF v_booking.status NOT IN ('confirmed', 'in-progress') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service must be confirmed or in-progress to mark as completed'
    );
  END IF;
  
  -- Update booking status to completed
  UPDATE bookings
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Notify owner that service is completed and needs confirmation
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.owner_id,
    'service_completed',
    '✅ Service Completed!',
    'Your pet care service has been completed. Please confirm and leave a review.',
    p_booking_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service marked as completed. Waiting for owner confirmation.'
  );
END;
$$;

-- =====================================================
-- FUNCTION: Confirm Completion and Start 3-Day Hold
-- =====================================================
CREATE OR REPLACE FUNCTION confirm_service_completion(
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_current_user UUID;
  v_release_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_current_user := auth.uid();
  
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
  
  -- Verify user is the owner
  IF v_booking.owner_id != v_current_user THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only the owner can confirm service completion'
    );
  END IF;
  
  -- Verify booking is completed but not yet confirmed
  IF v_booking.status != 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service must be marked as completed by sitter first'
    );
  END IF;
  
  IF v_booking.completion_confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service completion already confirmed'
    );
  END IF;
  
  -- Calculate release date (3 days from now)
  v_release_date := NOW() + INTERVAL '3 days';
  
  -- Update booking with confirmation
  UPDATE bookings
  SET 
    completion_confirmed_by = v_current_user,
    completion_confirmed_at = NOW(),
    eligible_for_release_at = v_release_date,
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Notify sitter that payment will be released in 3 days
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.sitter_id,
    'completion_confirmed',
    '💰 Payment Processing',
    'Owner confirmed service completion. Payment will be released in 3 days.',
    p_booking_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Service confirmed! Payment will be released in 3 days.',
    'release_date', v_release_date
  );
END;
$$;

-- =====================================================
-- FUNCTION: Release Payment to Sitter (Enhanced)
-- =====================================================
CREATE OR REPLACE FUNCTION release_payment_to_sitter(
  p_booking_id UUID,
  p_force_release BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_current_user UUID;
  v_can_release BOOLEAN := FALSE;
BEGIN
  v_current_user := auth.uid();
  
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
  
  -- Verify payment is held
  IF v_booking.payment_status != 'held' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment is not in held status'
    );
  END IF;
  
  -- Verify service is completed and confirmed
  IF v_booking.status != 'completed' OR v_booking.completion_confirmed_at IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Service must be completed and confirmed by owner first'
    );
  END IF;
  
  -- Check if 3 days have passed OR owner is forcing early release
  IF NOW() >= v_booking.eligible_for_release_at THEN
    v_can_release := TRUE;
  ELSIF p_force_release AND v_current_user = v_booking.owner_id THEN
    v_can_release := TRUE;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment can be released after ' || v_booking.eligible_for_release_at,
      'eligible_at', v_booking.eligible_for_release_at,
      'can_force_release', (v_current_user = v_booking.owner_id)
    );
  END IF;
  
  IF NOT v_can_release THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment cannot be released yet'
    );
  END IF;
  
  -- Update payment status to released
  UPDATE bookings 
  SET 
    payment_status = 'released',
    payment_released_at = NOW(),
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Notify sitter
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    v_booking.sitter_id,
    'payment_released',
    '💵 Payment Released!',
    'Your payment has been released and is being transferred to your account.',
    p_booking_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment released successfully',
    'amount', v_booking.total_price - v_booking.commission_fee,
    'released_at', NOW()
  );
END;
$$;

-- =====================================================
-- FUNCTION: Get Bookings Eligible for Auto-Release
-- =====================================================
CREATE OR REPLACE FUNCTION get_bookings_for_auto_release()
RETURNS TABLE(
  booking_id UUID,
  sitter_id UUID,
  amount NUMERIC,
  stripe_payment_intent_id TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    sitter_id,
    total_price - commission_fee as amount,
    stripe_payment_intent_id
  FROM bookings
  WHERE payment_status = 'held'
    AND status = 'completed'
    AND completion_confirmed_at IS NOT NULL
    AND eligible_for_release_at IS NOT NULL
    AND NOW() >= eligible_for_release_at
    AND payment_released_at IS NULL;
$$;

-- =====================================================
-- REVIEWS TABLE (Create if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reviews_booking_reviewer_unique'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_booking_reviewer_unique 
    UNIQUE(booking_id, reviewer_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = booking_id 
      AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())
      AND bookings.status = 'completed'
    )
  );

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- =====================================================
-- FUNCTION: Create Review and Update Sitter Rating
-- =====================================================
CREATE OR REPLACE FUNCTION create_review(
  p_booking_id UUID,
  p_reviewee_id UUID,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_review_id UUID;
  v_current_user UUID;
  v_booking RECORD;
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  v_current_user := auth.uid();
  
  -- Get booking to verify
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
  END IF;
  
  -- Verify booking is completed
  IF v_booking.status != 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Can only review completed bookings');
  END IF;
  
  -- Verify user is part of the booking
  IF v_current_user NOT IN (v_booking.owner_id, v_booking.sitter_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not part of this booking');
  END IF;
  
  -- Insert review
  INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (p_booking_id, v_current_user, p_reviewee_id, p_rating, p_comment)
  ON CONFLICT (booking_id, reviewer_id) DO UPDATE
  SET rating = p_rating, comment = p_comment, updated_at = NOW()
  RETURNING id INTO v_review_id;
  
  -- Update sitter's average rating if they have a walker_profile
  IF EXISTS (SELECT 1 FROM walker_profiles WHERE user_id = p_reviewee_id) THEN
    SELECT 
      COALESCE(AVG(rating), 0),
      COUNT(*)
    INTO v_avg_rating, v_total_reviews
    FROM reviews
    WHERE reviewee_id = p_reviewee_id;
    
    UPDATE walker_profiles
    SET 
      rating = v_avg_rating,
      total_reviews = v_total_reviews,
      updated_at = NOW()
    WHERE user_id = p_reviewee_id;
  END IF;
  
  -- Notify reviewee
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    p_reviewee_id,
    'review_received',
    '⭐ New Review',
    'You received a new review with ' || p_rating || ' stars!',
    v_review_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'message', 'Review created successfully'
  );
END;
$$;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION mark_service_completed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_service_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION release_payment_to_sitter(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bookings_for_auto_release() TO service_role;
GRANT EXECUTE ON FUNCTION create_review(UUID, UUID, INTEGER, TEXT) TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '✅ Payment escrow system with 3-day hold installed successfully!' as message;

