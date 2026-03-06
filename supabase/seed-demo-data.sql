-- ============================================================================
-- PETFLIK DEMO DATA SEED
-- ============================================================================
-- INSTRUCTIONS:
-- 1. First, sign up as test@test.com / test123 via the app (creates Auth user)
-- 2. Then run this entire script in Supabase SQL Editor
-- 3. This creates 6 sitters, 6 owners (with pets), matches, bookings,
--    notifications, messages, and reviews for the test account.
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure columns exist (safe for re-runs)
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 5.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Ensure matches table has both column patterns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'user1_id') THEN
    ALTER TABLE matches ADD COLUMN user1_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'user2_id') THEN
    ALTER TABLE matches ADD COLUMN user2_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure messages table exists for match-based chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: SITTER / WALKER PROFILES (6 sitters)
-- ============================================================================
-- Use fixed UUIDs so we can reference them for matches, bookings, etc.

INSERT INTO users (id, name, email, phone, city, postal_code, user_type, bio, profile_image, hourly_rate, rating, review_count, verified, latitude, longitude, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Sophie Martin', 'sophie.martin@demo.petflik.com', '+33612345601', 'Paris', '75001', 'walker',
   'Passionate animal lover with 5 years of professional pet sitting experience. I treat every pet like family! Certified in pet first aid.',
   '["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800","https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"]',
   18.00, 4.9, 23, true, 48.8566, 2.3522, NOW() - INTERVAL '60 days'),

  ('a1000000-0000-0000-0000-000000000002', 'Carlos Rodriguez', 'carlos.rodriguez@demo.petflik.com', '+34612345602', 'Madrid', '28001', 'walker',
   'Former veterinary technician turned full-time pet sitter. I specialize in anxious dogs and senior pets. Available weekends!',
   '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"]',
   15.00, 4.8, 18, true, 40.4168, -3.7038, NOW() - INTERVAL '45 days'),

  ('a1000000-0000-0000-0000-000000000003', 'Emma Dubois', 'emma.dubois@demo.petflik.com', '+33612345603', 'Lyon', '69001', 'walker',
   'Dog trainer and walker based in Lyon. I love long nature walks with energetic pups. Your dog will come back tired and happy!',
   '["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"]',
   20.00, 5.0, 31, true, 45.7640, 4.8357, NOW() - INTERVAL '30 days'),

  ('a1000000-0000-0000-0000-000000000004', 'Lucas García', 'lucas.garcia@demo.petflik.com', '+34612345604', 'Barcelona', '08001', 'walker',
   'Beach walks specialist! Based near Barceloneta, I take dogs on the best seaside routes. Also experienced with cats.',
   '["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800","https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800"]',
   22.00, 4.7, 15, true, 41.3874, 2.1686, NOW() - INTERVAL '20 days'),

  ('a1000000-0000-0000-0000-000000000005', 'Léa Bernard', 'lea.bernard@demo.petflik.com', '+33612345605', 'Paris', '75011', 'walker',
   'Part-time student, full-time animal enthusiast! I offer affordable walks and overnight pet sitting in the 11th arrondissement.',
   '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800","https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800"]',
   12.00, 4.6, 9, true, 48.8590, 2.3800, NOW() - INTERVAL '15 days'),

  ('a1000000-0000-0000-0000-000000000006', 'Marco Rossi', 'marco.rossi@demo.petflik.com', '+39612345606', 'Barcelona', '08002', 'walker',
   'Italian expat in Barcelona who grew up on a farm with animals. I have a big garden where your pets can play freely!',
   '["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800","https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800"]',
   25.00, 4.9, 27, true, 41.3910, 2.1650, NOW() - INTERVAL '10 days')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  profile_image = EXCLUDED.profile_image,
  hourly_rate = EXCLUDED.hourly_rate,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  verified = EXCLUDED.verified,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- ============================================================================
-- STEP 3: OWNER PROFILES (6 owners)
-- ============================================================================
INSERT INTO users (id, name, email, phone, city, postal_code, user_type, bio, profile_image, verified, latitude, longitude, created_at)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Marie Laurent', 'marie.laurent@demo.petflik.com', '+33612345611', 'Paris', '75003', 'owner',
   'Proud mama of a golden retriever named Luna. Looking for reliable walkers for weekday afternoons.',
   '["https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800"]',
   true, 48.8630, 2.3600, NOW() - INTERVAL '50 days'),

  ('b2000000-0000-0000-0000-000000000002', 'Pablo Fernández', 'pablo.fernandez@demo.petflik.com', '+34612345612', 'Madrid', '28002', 'owner',
   'Cat lover with two rescue cats. Need a sitter who understands feline personalities.',
   '["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800"]',
   true, 40.4200, -3.7010, NOW() - INTERVAL '40 days'),

  ('b2000000-0000-0000-0000-000000000003', 'Chloé Moreau', 'chloe.moreau@demo.petflik.com', '+33612345613', 'Lyon', '69002', 'owner',
   'Working mom with a playful border collie. He needs lots of exercise while I am at the office!',
   '["https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800"]',
   true, 45.7580, 4.8320, NOW() - INTERVAL '35 days'),

  ('b2000000-0000-0000-0000-000000000004', 'Antonio Ruiz', 'antonio.ruiz@demo.petflik.com', '+34612345614', 'Barcelona', '08003', 'owner',
   'Retired professor with a senior labrador. Looking for gentle, patient walkers.',
   '["https://images.unsplash.com/photo-1463453091185-61582044d556?w=800"]',
   true, 41.3900, 2.1700, NOW() - INTERVAL '25 days'),

  ('b2000000-0000-0000-0000-000000000005', 'Camille Petit', 'camille.petit@demo.petflik.com', '+33612345615', 'Paris', '75015', 'owner',
   'Busy entrepreneur with an adorable French bulldog. Need morning walks 3x per week.',
   '["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"]',
   true, 48.8420, 2.2950, NOW() - INTERVAL '12 days'),

  ('b2000000-0000-0000-0000-000000000006', 'Elena Martínez', 'elena.martinez@demo.petflik.com', '+34612345616', 'Madrid', '28003', 'owner',
   'Animal rescue volunteer with a rescued greyhound named Bella. She needs gentle care!',
   '["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"]',
   true, 40.4250, -3.6900, NOW() - INTERVAL '8 days')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  profile_image = EXCLUDED.profile_image,
  verified = EXCLUDED.verified,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- ============================================================================
-- STEP 4: PETS (1-2 per owner)
-- ============================================================================
INSERT INTO pets (id, owner_id, name, breed, age, pet_type, image_url, created_at)
VALUES
  ('c3000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'Luna', 'Golden Retriever', '3', 'dog',
   '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=800","https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]',
   NOW() - INTERVAL '50 days'),

  ('c3000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'Mochi', 'Persian', '5', 'cat',
   '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800","https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800"]',
   NOW() - INTERVAL '40 days'),

  ('c3000000-0000-0000-0000-000000000003', 'b2000000-0000-0000-0000-000000000002', 'Whiskers', 'Tabby', '2', 'cat',
   '["https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800"]',
   NOW() - INTERVAL '40 days'),

  ('c3000000-0000-0000-0000-000000000004', 'b2000000-0000-0000-0000-000000000003', 'Max', 'Border Collie', '2', 'dog',
   '["https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800","https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=800"]',
   NOW() - INTERVAL '35 days'),

  ('c3000000-0000-0000-0000-000000000005', 'b2000000-0000-0000-0000-000000000004', 'Rocky', 'Labrador Retriever', '9', 'dog',
   '["https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=800"]',
   NOW() - INTERVAL '25 days'),

  ('c3000000-0000-0000-0000-000000000006', 'b2000000-0000-0000-0000-000000000005', 'Coco', 'French Bulldog', '1', 'dog',
   '["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800","https://images.unsplash.com/photo-1575425186775-b8de9a427e67?w=800"]',
   NOW() - INTERVAL '12 days'),

  ('c3000000-0000-0000-0000-000000000007', 'b2000000-0000-0000-0000-000000000006', 'Bella', 'Greyhound', '4', 'dog',
   '["https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800"]',
   NOW() - INTERVAL '8 days'),

  ('c3000000-0000-0000-0000-000000000008', 'b2000000-0000-0000-0000-000000000001', 'Simba', 'Maine Coon', '1', 'cat',
   '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800"]',
   NOW() - INTERVAL '20 days')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  breed = EXCLUDED.breed,
  image_url = EXCLUDED.image_url;

-- ============================================================================
-- STEP 5: TEST ACCOUNT (test@test.com)
-- The user must be created via the app first (sign up as test@test.com / test123).
-- Then we update their profile and create associated data.
-- ============================================================================

-- Update the test user profile (find by email)
UPDATE users SET
  name = 'Ali Test',
  user_type = 'owner',
  city = 'Paris',
  postal_code = '75001',
  bio = 'Test account for investor demo. Owner of a cute puppy named Buddy!',
  profile_image = '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]',
  verified = true,
  latitude = 48.8566,
  longitude = 2.3522,
  hourly_rate = NULL,
  rating = 5.0,
  review_count = 3
WHERE email = 'test@test.com';

-- Create a pet for the test user
INSERT INTO pets (id, owner_id, name, breed, age, pet_type, image_url, created_at)
SELECT
  'c3000000-0000-0000-0000-000000000099',
  u.id,
  'Buddy',
  'Golden Doodle',
  '2',
  'dog',
  '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800","https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800"]',
  NOW() - INTERVAL '30 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================================
-- STEP 6: MATCHES for test user (with 3 sitters)
-- ============================================================================
-- Test user ↔ Sophie Martin
INSERT INTO matches (id, user1_id, user2_id, created_at)
SELECT 'd4000000-0000-0000-0000-000000000001', u.id, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO NOTHING;

-- Test user ↔ Emma Dubois
INSERT INTO matches (id, user1_id, user2_id, created_at)
SELECT 'd4000000-0000-0000-0000-000000000002', u.id, 'a1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO NOTHING;

-- Test user ↔ Carlos Rodriguez
INSERT INTO matches (id, user1_id, user2_id, created_at)
SELECT 'd4000000-0000-0000-0000-000000000003', u.id, 'a1000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO NOTHING;

-- Also create likes so the relationship makes sense
INSERT INTO likes (id, liker_id, liked_id, created_at)
SELECT gen_random_uuid(), u.id, 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO likes (id, liker_id, liked_id, created_at)
SELECT gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', u.id, NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO likes (id, liker_id, liked_id, created_at)
SELECT gen_random_uuid(), u.id, 'a1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '4 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO likes (id, liker_id, liked_id, created_at)
SELECT gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', u.id, NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: BOOKINGS for test user
-- ============================================================================
INSERT INTO bookings (id, owner_id, sitter_id, pet_id, start_time, end_time, total_price, status, notes, created_at)
SELECT
  'e5000000-0000-0000-0000-000000000001',
  u.id,
  'a1000000-0000-0000-0000-000000000001',
  'c3000000-0000-0000-0000-000000000099',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
  36.00,
  'pending',
  'Please walk Buddy in the park near Tuileries. He loves playing fetch!',
  NOW() - INTERVAL '1 day'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, owner_id, sitter_id, pet_id, start_time, end_time, total_price, status, notes, created_at)
SELECT
  'e5000000-0000-0000-0000-000000000002',
  u.id,
  'a1000000-0000-0000-0000-000000000003',
  'c3000000-0000-0000-0000-000000000099',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '1 hour',
  20.00,
  'confirmed',
  'Morning walk along the river. Buddy is friendly with other dogs.',
  NOW() - INTERVAL '4 days'
FROM users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 8: NOTIFICATIONS for test user
-- ============================================================================
INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
SELECT gen_random_uuid(), u.id, 'welcome',
  '🎉 Welcome to Petflik!',
  'Hi Ali! We''re excited to have you. Start browsing sitters for Buddy!',
  false, NOW() - INTERVAL '30 days'
FROM users u WHERE u.email = 'test@test.com';

INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
SELECT gen_random_uuid(), u.id, 'booking_status_update',
  '✅ Booking Confirmed',
  'Emma Dubois confirmed your booking for Buddy on ' || to_char(NOW() - INTERVAL '3 days', 'Mon DD'),
  false, NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'test@test.com';

INSERT INTO notifications (id, user_id, type, title, message, read, created_at)
SELECT gen_random_uuid(), u.id, 'booking_request',
  '📅 New Booking Request',
  'Your booking request to Sophie Martin is pending. They''ll respond soon!',
  false, NOW() - INTERVAL '1 day'
FROM users u WHERE u.email = 'test@test.com';

-- ============================================================================
-- STEP 9: MESSAGES between test user and matched sitters
-- ============================================================================
-- Conversation with Sophie Martin
INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000001', u.id,
  'Hi Sophie! I saw you have great reviews. Would you be available to walk my dog Buddy this weekend?',
  NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'test@test.com'
  AND EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000001');

INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
  'Hello! Of course, I''d love to walk Buddy! I''m free Saturday afternoon. What time works for you?',
  NOW() - INTERVAL '5 days' + INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000001');

INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000001', u.id,
  'Saturday at 2pm would be perfect! He loves the park near Place des Vosges.',
  NOW() - INTERVAL '4 days'
FROM users u WHERE u.email = 'test@test.com'
  AND EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000001');

INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
  'Great! I know that park well. I''ll bring some treats too 🐾',
  NOW() - INTERVAL '4 days' + INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000001');

-- Conversation with Emma Dubois
INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000002', u.id,
  'Hi Emma! Your experience with energetic dogs sounds perfect for Buddy. He''s a golden doodle with LOTS of energy 😄',
  NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'test@test.com'
  AND EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000002');

INSERT INTO messages (id, match_id, sender_id, content, created_at)
SELECT gen_random_uuid(), 'd4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003',
  'Haha I love energetic dogs! Golden doodles are the best. I''d be happy to take him on some long walks in Lyon!',
  NOW() - INTERVAL '3 days' + INTERVAL '3 hours'
WHERE EXISTS (SELECT 1 FROM matches WHERE id = 'd4000000-0000-0000-0000-000000000002');

-- ============================================================================
-- STEP 10: REVIEWS between demo profiles
-- ============================================================================
-- Ensure reviewee_id column exists (some schemas use reviewed_id)
-- Also make walk_request_id and booking_id nullable so demo reviews can be inserted without real requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewee_id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewed_id') THEN
      ALTER TABLE reviews RENAME COLUMN reviewed_id TO reviewee_id;
    ELSE
      ALTER TABLE reviews ADD COLUMN reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'walk_request_id') THEN
    ALTER TABLE reviews ALTER COLUMN walk_request_id DROP NOT NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'booking_id') THEN
    ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;
  END IF;
END $$;

INSERT INTO reviews (id, reviewer_id, reviewee_id, rating, comment, created_at)
VALUES
  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 5,
   'Sophie was amazing with Luna! She sent photos during the walk and Luna came back so happy. Highly recommend!',
   NOW() - INTERVAL '20 days'),

  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 5,
   'Emma is the best dog walker in Lyon. Max absolutely loves her walks. She goes above and beyond!',
   NOW() - INTERVAL '15 days'),

  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 5,
   'Lucas took Rocky for a beautiful beach walk. He was so gentle and patient with our senior dog. Thank you!',
   NOW() - INTERVAL '10 days'),

  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 4,
   'Carlos understood my cats perfectly. Mochi and Whiskers were relaxed the whole time. Very professional!',
   NOW() - INTERVAL '12 days'),

  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 5,
   'Léa is wonderful! Coco loved her morning walks. Affordable and reliable. Will book again!',
   NOW() - INTERVAL '5 days'),

  (gen_random_uuid(), 'b2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 5,
   'Marco has an amazing garden where Bella could run free. She was so happy when I picked her up!',
   NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Update sitter user profiles with correct rating/review_count from actual reviews
UPDATE users u
SET
  rating = sub.avg_rating,
  review_count = sub.total_reviews
FROM (
  SELECT reviewee_id, AVG(rating)::DECIMAL(3,2) AS avg_rating, COUNT(*) AS total_reviews
  FROM reviews
  GROUP BY reviewee_id
) sub
WHERE u.id = sub.reviewee_id;

-- Also add matches between some demo owners and sitters (to populate Messages page)
INSERT INTO matches (id, user1_id, user2_id, created_at)
VALUES
  ('d4000000-0000-0000-0000-000000000010', 'b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '25 days'),
  ('d4000000-0000-0000-0000-000000000011', 'b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '20 days'),
  ('d4000000-0000-0000-0000-000000000012', 'b2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DONE! The test account (test@test.com) now has:
-- ✅ A complete owner profile with a pet (Buddy)
-- ✅ 3 matches with sitters (Sophie, Emma, Carlos)
-- ✅ 2 bookings (1 pending, 1 confirmed)
-- ✅ 3 unread notifications
-- ✅ Chat messages with Sophie and Emma
-- ✅ 6 realistic sitter profiles and 6 owner profiles with pets
-- ✅ Reviews between demo users
-- ============================================================================
