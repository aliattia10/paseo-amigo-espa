-- =====================================================
-- Enhance Review System
-- =====================================================
-- This migration ensures:
-- 1. Reviews automatically update users table rating
-- 2. Reviews are properly displayed on all profiles
-- 3. Rating is calculated from all reviews

-- Add review_count column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- =====================================================
-- Update create_review function to update users table
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
  
  -- Calculate average rating and total reviews for the reviewee
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE reviewee_id = p_reviewee_id;
  
  -- Update users table rating (for all users, not just walkers)
  UPDATE users
  SET 
    rating = v_avg_rating,
    review_count = v_total_reviews,
    updated_at = NOW()
  WHERE id = p_reviewee_id;
  
  -- Also update walker_profiles if it exists (for backward compatibility)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'walker_profiles') THEN
    IF EXISTS (SELECT 1 FROM walker_profiles WHERE user_id = p_reviewee_id) THEN
      UPDATE walker_profiles
      SET 
        rating = v_avg_rating,
        total_reviews = v_total_reviews,
        updated_at = NOW()
      WHERE user_id = p_reviewee_id;
    END IF;
  END IF;
  
  -- Notify reviewee
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (
    p_reviewee_id,
    'review_received',
    '⭐ New Review',
    'You received a new ' || p_rating || '-star review!',
    v_review_id
  )
  ON CONFLICT DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'message', 'Review created successfully',
    'avg_rating', v_avg_rating,
    'total_reviews', v_total_reviews
  );
END;
$$;

-- =====================================================
-- Function: Get reviews for a user (for profile display)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_reviews(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  booking_id UUID,
  reviewer_id UUID,
  reviewer_name TEXT,
  reviewer_image TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.booking_id,
    r.reviewer_id,
    u.name as reviewer_name,
    u.profile_image as reviewer_image,
    r.rating,
    r.comment,
    r.created_at
  FROM reviews r
  LEFT JOIN users u ON r.reviewer_id = u.id
  WHERE r.reviewee_id = p_user_id
  ORDER BY r.created_at DESC
  LIMIT p_limit;
END;
$$;

-- =====================================================
-- Function: Get user rating summary
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_rating_summary(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
  v_rating_distribution JSONB;
BEGIN
  -- Get average rating and total count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE reviewee_id = p_user_id;
  
  -- Get rating distribution (1-5 stars)
  SELECT jsonb_build_object(
    '1', (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p_user_id AND rating = 1),
    '2', (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p_user_id AND rating = 2),
    '3', (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p_user_id AND rating = 3),
    '4', (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p_user_id AND rating = 4),
    '5', (SELECT COUNT(*) FROM reviews WHERE reviewee_id = p_user_id AND rating = 5)
  ) INTO v_rating_distribution;
  
  RETURN jsonb_build_object(
    'avg_rating', v_avg_rating,
    'total_reviews', v_total_reviews,
    'rating_distribution', v_rating_distribution
  );
END;
$$;

-- =====================================================
-- Trigger: Auto-update user rating when review is deleted
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_rating_on_review_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_total_reviews INTEGER;
BEGIN
  -- Recalculate rating for the user whose review was deleted
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE reviewee_id = OLD.reviewee_id;
  
  -- Update users table
  UPDATE users
  SET 
    rating = v_avg_rating,
    review_count = v_total_reviews,
    updated_at = NOW()
  WHERE id = OLD.reviewee_id;
  
  RETURN OLD;
END;
$$;

-- Create trigger for review deletion
DROP TRIGGER IF EXISTS update_rating_on_review_delete ON reviews;
CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating_on_review_delete();

-- =====================================================
-- GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION create_review(UUID, UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reviews(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rating_summary(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION create_review IS 'Creates a review and automatically updates user rating in users table';
COMMENT ON FUNCTION get_user_reviews IS 'Gets reviews for a user with reviewer information';
COMMENT ON FUNCTION get_user_rating_summary IS 'Gets rating summary including distribution for a user';

