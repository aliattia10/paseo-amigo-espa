-- ============================================
-- ADD TEST PETS FOR TESTING
-- This adds some test pets so sitters can see multiple profiles
-- ============================================

-- Get the user IDs first
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM users WHERE email = 'aliattiaa@gmail.com';
  SELECT id INTO user2_id FROM users WHERE email = 'attiaali85@gmail.com';
  
  -- Add test pets for user 1
  INSERT INTO pets (owner_id, name, age, breed, species, image_url, created_at)
  VALUES 
    (user1_id, 'Buddy', '3', 'Golden Retriever', 'dog', '["https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800"]', NOW()),
    (user1_id, 'Luna', '2', 'Husky', 'dog', '["https://images.unsplash.com/photo-1568572933382-74d440642117?w=800"]', NOW()),
    (user1_id, 'Whiskers', '4', 'Persian', 'cat', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800"]', NOW())
  ON CONFLICT DO NOTHING;
  
  -- Add test pets for user 2
  INSERT INTO pets (owner_id, name, age, breed, species, image_url, created_at)
  VALUES 
    (user2_id, 'Charlie', '5', 'Labrador', 'dog', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]', NOW()),
    (user2_id, 'Bella', '1', 'Beagle', 'dog', '["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800"]', NOW()),
    (user2_id, 'Mittens', '3', 'Tabby', 'cat', '["https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800"]', NOW())
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Test pets added successfully!';
  RAISE NOTICE 'User 1 (%) now has 3 test pets', user1_id;
  RAISE NOTICE 'User 2 (%) now has 3 test pets', user2_id;
END $$;

-- Verify the pets were added
SELECT 
  p.id,
  p.name,
  p.species,
  p.breed,
  u.email as owner_email
FROM pets p
JOIN users u ON p.owner_id = u.id
ORDER BY p.created_at DESC;
