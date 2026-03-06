-- ============================================================================
-- Insert only the 6 demo sitter users (fixes "liked_id not present in users")
-- Run this in Supabase SQL Editor if you see FK errors when liking a caretaker.
-- ============================================================================

-- Ensure columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 5.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Insert 6 demo walkers (ids a1000000-...); upsert so safe to re-run
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
