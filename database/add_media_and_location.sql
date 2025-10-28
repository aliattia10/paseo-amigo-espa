-- ============================================
-- ADD MEDIA SUPPORT TO MESSAGES AND LOCATION-BASED MATCHING
-- Fixed version with proper policy handling
-- ============================================

-- Add media columns to chat_messages table (the actual messages table in use)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS media_thumbnail_url TEXT;

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_messages_media_type_check'
  ) THEN
    ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_media_type_check 
    CHECK (media_type IN ('image', 'video', 'audio'));
  END IF;
END $$;

-- Also add to messages table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_thumbnail_url TEXT;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'messages_media_type_check'
    ) THEN
      ALTER TABLE messages ADD CONSTRAINT messages_media_type_check 
      CHECK (media_type IN ('image', 'video', 'audio'));
    END IF;
  END IF;
END $$;

-- Add location columns to users table for location-based matching
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_enabled BOOLEAN DEFAULT false;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE location_enabled = true;

-- Create a function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth's radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Handle NULL values
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN 999999; -- Return large number for NULL locations
  END IF;
  
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a helper function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
  user_id UUID,
  lat DECIMAL,
  lon DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    latitude = lat,
    longitude = lon,
    location_enabled = true,
    location_updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get nearby users
CREATE OR REPLACE FUNCTION get_nearby_users(
  user_lat DECIMAL,
  user_lon DECIMAL,
  max_distance_km DECIMAL DEFAULT 50,
  user_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  user_type TEXT,
  distance_km DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.user_type,
    calculate_distance(user_lat, user_lon, u.latitude, u.longitude) as distance_km,
    u.latitude,
    u.longitude
  FROM users u
  WHERE 
    u.location_enabled = true
    AND u.latitude IS NOT NULL 
    AND u.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, u.latitude, u.longitude) <= max_distance_km
    AND (user_type_filter IS NULL OR u.user_type = user_type_filter)
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Handle RLS policies safely
DO $$
BEGIN
  -- Drop and recreate location policies
  DROP POLICY IF EXISTS "Users can update own location" ON users;
  DROP POLICY IF EXISTS "Users can view matched users location" ON users;
  
  -- Users can update their own location
  CREATE POLICY "Users can update own location" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
  
  -- Note: The view policy might conflict with existing policies
  -- Only create if matches table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'matches') THEN
    CREATE POLICY "Users can view matched users location" ON users
    FOR SELECT
    USING (
      location_enabled = true 
      AND (
        auth.uid() = id 
        OR EXISTS (
          SELECT 1 FROM matches 
          WHERE (matches.user1_id = auth.uid() AND matches.user2_id = users.id)
             OR (matches.user2_id = auth.uid() AND matches.user1_id = users.id)
        )
      )
    );
  END IF;
END $$;

-- Create storage bucket for message media if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', true)
ON CONFLICT (id) DO NOTHING;

-- Handle storage policies safely
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload message media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view message media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own message media" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Users can upload message media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  
  CREATE POLICY "Users can view message media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-media');
  
  CREATE POLICY "Users can delete own message media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-media' AND auth.uid()::text = (storage.foldername(name))[1]);
END $$;

-- Add comments for documentation
COMMENT ON COLUMN chat_messages.media_url IS 'URL to uploaded media file (image, video, or audio)';
COMMENT ON COLUMN chat_messages.media_type IS 'Type of media: image, video, or audio';
COMMENT ON COLUMN chat_messages.media_thumbnail_url IS 'Thumbnail URL for videos';
COMMENT ON COLUMN users.latitude IS 'User latitude for location-based matching';
COMMENT ON COLUMN users.longitude IS 'User longitude for location-based matching';
COMMENT ON COLUMN users.location_enabled IS 'Whether user has enabled location-based matching';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media and location features added successfully!';
  RAISE NOTICE 'Added columns: media_url, media_type, media_thumbnail_url to chat_messages';
  RAISE NOTICE 'Added columns: latitude, longitude, location_enabled to users';
  RAISE NOTICE 'Created functions: calculate_distance, update_user_location, get_nearby_users';
  RAISE NOTICE 'Created storage bucket: message-media';
END $$;
