-- Drop and recreate function with consistent parameters
DROP FUNCTION IF EXISTS check_and_create_match(uuid, uuid);

CREATE OR REPLACE FUNCTION check_and_create_match(
  liker_user_id UUID,
  liked_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  match_exists BOOLEAN;
  reverse_like_exists BOOLEAN;
BEGIN
  -- Check if a match already exists
  SELECT EXISTS(
    SELECT 1 FROM matches 
    WHERE (user1_id = liker_user_id AND user2_id = liked_user_id)
       OR (user1_id = liked_user_id AND user2_id = liker_user_id)
  ) INTO match_exists;
  
  IF match_exists THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the other user has liked back
  SELECT EXISTS(
    SELECT 1 FROM likes 
    WHERE liker_id = liked_user_id AND liked_id = liker_user_id
  ) INTO reverse_like_exists;
  
  -- If both users have liked each other, create a match
  IF reverse_like_exists THEN
    INSERT INTO matches (user1_id, user2_id)
    VALUES (liker_user_id, liked_user_id)
    ON CONFLICT DO NOTHING;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the update_user_location function
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_location(UUID, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_create_match(UUID, UUID) TO authenticated;