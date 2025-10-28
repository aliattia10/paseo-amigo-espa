-- ============================================
-- ADD FILTERS AND DISCOUNT CODES SYSTEM
-- ============================================

-- Add pet type preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS pet_preferences JSONB DEFAULT '{"dogs": true, "cats": true}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN IF NOT EXISTS min_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_hourly_rate INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS filter_preferences JSONB DEFAULT '{}'::jsonb;

-- Create discount codes table for sitters
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discount usage tracking table
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discount_amount DECIMAL(10,2),
  UNIQUE(discount_code_id, user_id, booking_id)
);

-- Add discount code to walker_profiles for easy access
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS discount_code VARCHAR(20);
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_sitter ON discount_codes(sitter_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_users_pet_preferences ON users USING gin(pet_preferences);
CREATE INDEX IF NOT EXISTS idx_users_filter_preferences ON users USING gin(filter_preferences);

-- Function to generate unique discount code
CREATE OR REPLACE FUNCTION generate_discount_code(sitter_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from sitter name (first 6 chars, uppercase, alphanumeric only)
  base_code := UPPER(REGEXP_REPLACE(SUBSTRING(sitter_name, 1, 6), '[^A-Z0-9]', '', 'g'));
  
  -- Add random suffix
  final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM discount_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Prevent infinite loop
    IF counter > 100 THEN
      final_code := 'DISC' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to create discount code for sitter
CREATE OR REPLACE FUNCTION create_sitter_discount(
  p_sitter_id UUID,
  p_sitter_name TEXT,
  p_percentage INTEGER,
  p_description TEXT DEFAULT NULL,
  p_max_uses INTEGER DEFAULT NULL,
  p_valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  code TEXT,
  percentage INTEGER,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_code TEXT;
  v_existing_code TEXT;
BEGIN
  -- Check if sitter already has an active code
  SELECT dc.code INTO v_existing_code
  FROM discount_codes dc
  WHERE dc.sitter_id = p_sitter_id AND dc.is_active = true
  LIMIT 1;
  
  IF v_existing_code IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_code, p_percentage, false, 'Sitter already has an active discount code';
    RETURN;
  END IF;
  
  -- Validate percentage
  IF p_percentage < 1 OR p_percentage > 100 THEN
    RETURN QUERY SELECT NULL::TEXT, p_percentage, false, 'Percentage must be between 1 and 100';
    RETURN;
  END IF;
  
  -- Generate unique code
  v_code := generate_discount_code(p_sitter_name);
  
  -- Insert discount code
  INSERT INTO discount_codes (
    sitter_id,
    code,
    percentage,
    description,
    max_uses,
    valid_until
  ) VALUES (
    p_sitter_id,
    v_code,
    p_percentage,
    p_description,
    p_max_uses,
    p_valid_until
  );
  
  -- Update walker profile
  UPDATE walker_profiles
  SET 
    discount_code = v_code,
    discount_percentage = p_percentage
  WHERE user_id = p_sitter_id;
  
  RETURN QUERY SELECT v_code, p_percentage, true, 'Discount code created successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to validate and apply discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  valid BOOLEAN,
  percentage INTEGER,
  sitter_id UUID,
  message TEXT
) AS $$
DECLARE
  v_discount RECORD;
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if code exists
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'Invalid or inactive discount code';
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'Discount code has expired';
    RETURN;
  END IF;
  
  -- Check if not yet valid
  IF v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'Discount code is not yet valid';
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.usage_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'Discount code has reached maximum uses';
    RETURN;
  END IF;
  
  -- Check if user already used this code
  IF EXISTS (
    SELECT 1 FROM discount_usage 
    WHERE discount_code_id = v_discount.id AND user_id = p_user_id
  ) THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'You have already used this discount code';
    RETURN;
  END IF;
  
  -- Code is valid
  RETURN QUERY SELECT true, v_discount.percentage, v_discount.sitter_id, 'Discount code is valid';
END;
$$ LANGUAGE plpgsql;

-- Function to apply discount code (track usage)
CREATE OR REPLACE FUNCTION apply_discount_code(
  p_code TEXT,
  p_user_id UUID,
  p_booking_id UUID DEFAULT NULL,
  p_discount_amount DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_discount_id UUID;
BEGIN
  -- Get discount code ID
  SELECT id INTO v_discount_id
  FROM discount_codes
  WHERE code = p_code AND is_active = true;
  
  IF v_discount_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Record usage
  INSERT INTO discount_usage (
    discount_code_id,
    user_id,
    booking_id,
    discount_amount
  ) VALUES (
    v_discount_id,
    p_user_id,
    p_booking_id,
    p_discount_amount
  );
  
  -- Increment usage count
  UPDATE discount_codes
  SET usage_count = usage_count + 1
  WHERE id = v_discount_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get filtered profiles with all filters applied
CREATE OR REPLACE FUNCTION get_filtered_profiles(
  p_user_id UUID,
  p_user_type TEXT, -- 'owner' or 'sitter'
  p_pet_type TEXT DEFAULT NULL, -- 'dog', 'cat', or NULL for both
  p_max_distance_km INTEGER DEFAULT 50,
  p_min_rating DECIMAL DEFAULT 0,
  p_max_hourly_rate INTEGER DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'distance', -- 'distance', 'rating', 'price', 'newest'
  p_user_lat DECIMAL DEFAULT NULL,
  p_user_lon DECIMAL DEFAULT NULL,
  p_global_mode BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  user_type TEXT,
  rating DECIMAL,
  hourly_rate INTEGER,
  distance_km DECIMAL,
  profile_image TEXT,
  bio TEXT,
  discount_code TEXT,
  discount_percentage INTEGER,
  pet_types TEXT[]
) AS $$
BEGIN
  IF p_user_type = 'owner' THEN
    -- Return sitters/walkers
    RETURN QUERY
    SELECT 
      u.id,
      u.name,
      u.user_type,
      COALESCE(wp.rating, 0) as rating,
      wp.hourly_rate,
      CASE 
        WHEN p_global_mode OR p_user_lat IS NULL OR u.latitude IS NULL THEN 999999
        ELSE calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude)
      END as distance_km,
      u.profile_image,
      wp.bio,
      wp.discount_code,
      wp.discount_percentage,
      COALESCE(wp.tags, ARRAY[]::TEXT[]) as pet_types
    FROM users u
    LEFT JOIN walker_profiles wp ON u.id = wp.user_id
    WHERE 
      u.user_type = 'walker'
      AND u.id != p_user_id
      -- Pet type filter
      AND (
        p_pet_type IS NULL 
        OR p_pet_type = ANY(wp.tags)
        OR (p_pet_type = 'dog' AND 'dogs' = ANY(wp.tags))
        OR (p_pet_type = 'cat' AND 'cats' = ANY(wp.tags))
      )
      -- Distance filter (only in local mode)
      AND (
        p_global_mode 
        OR p_user_lat IS NULL 
        OR u.latitude IS NULL
        OR calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude) <= p_max_distance_km
      )
      -- Rating filter
      AND COALESCE(wp.rating, 0) >= p_min_rating
      -- Price filter
      AND (p_max_hourly_rate IS NULL OR wp.hourly_rate <= p_max_hourly_rate)
    ORDER BY
      CASE 
        WHEN p_sort_by = 'distance' THEN calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude)
        WHEN p_sort_by = 'rating' THEN -COALESCE(wp.rating, 0)
        WHEN p_sort_by = 'price' THEN wp.hourly_rate
        ELSE 0
      END,
      u.created_at DESC;
  ELSE
    -- Return pet owners (for sitters browsing)
    RETURN QUERY
    SELECT 
      u.id,
      u.name,
      u.user_type,
      0::DECIMAL as rating,
      0 as hourly_rate,
      CASE 
        WHEN p_global_mode OR p_user_lat IS NULL OR u.latitude IS NULL THEN 999999
        ELSE calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude)
      END as distance_km,
      u.profile_image,
      ''::TEXT as bio,
      NULL::TEXT as discount_code,
      NULL::INTEGER as discount_percentage,
      ARRAY[]::TEXT[] as pet_types
    FROM users u
    WHERE 
      u.user_type = 'owner'
      AND u.id != p_user_id
      -- Distance filter (only in local mode)
      AND (
        p_global_mode 
        OR p_user_lat IS NULL 
        OR u.latitude IS NULL
        OR calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude) <= p_max_distance_km
      )
    ORDER BY
      CASE 
        WHEN p_sort_by = 'distance' THEN calculate_distance(p_user_lat, p_user_lon, u.latitude, u.longitude)
        ELSE 0
      END,
      u.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for discount codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

-- Sitters can view and manage their own discount codes
CREATE POLICY "Sitters can view own discount codes" ON discount_codes
FOR SELECT
USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can create own discount codes" ON discount_codes
FOR INSERT
WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can update own discount codes" ON discount_codes
FOR UPDATE
USING (auth.uid() = sitter_id);

-- Anyone can view active discount codes (to validate them)
CREATE POLICY "Anyone can view active discount codes" ON discount_codes
FOR SELECT
USING (is_active = true);

-- Users can view their own discount usage
CREATE POLICY "Users can view own discount usage" ON discount_usage
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert discount usage
CREATE POLICY "System can insert discount usage" ON discount_usage
FOR INSERT
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE discount_codes IS 'Discount codes created by sitters to offer to pet owners';
COMMENT ON TABLE discount_usage IS 'Tracks when and by whom discount codes are used';
COMMENT ON COLUMN users.pet_preferences IS 'User preferences for pet types (dogs, cats)';
COMMENT ON COLUMN users.max_distance_km IS 'Maximum distance filter for matching';
COMMENT ON COLUMN users.filter_preferences IS 'Additional filter preferences (JSON)';
COMMENT ON FUNCTION create_sitter_discount IS 'Creates a unique discount code for a sitter';
COMMENT ON FUNCTION validate_discount_code IS 'Validates if a discount code can be used';
COMMENT ON FUNCTION apply_discount_code IS 'Records usage of a discount code';
COMMENT ON FUNCTION get_filtered_profiles IS 'Returns filtered and sorted profiles based on user preferences';
