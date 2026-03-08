-- ============================================================================
-- RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR (one time) to fix "Failed to save like"
-- 1. Makes likes table reference public.users (so demo users count)
-- 2. Inserts the 6 demo sitters and 6 demo owners (with pets) into public.users
-- 3. Updates the like/match function (reverse likes for both so you can match with owners)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PART 1: Point likes at public.users and ensure demo sitters + demo owners exist
-- ----------------------------------------------------------------------------

-- 1a. Drop existing FKs on likes so we can point them at public.users
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_liked_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_liker_id_fkey;

-- 1b. Ensure columns exist and insert the 6 demo sitters into public.users (do this before re-adding FK)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 5.0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS longitude DECIMAL;

INSERT INTO public.users (id, name, email, phone, city, postal_code, user_type, bio, profile_image, hourly_rate, rating, review_count, verified, latitude, longitude, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Sophie Martin', 'sophie.martin@demo.petflik.com', '+33612345601', 'Paris', '75001', 'walker',
   'Passionate animal lover with 5 years of professional pet sitting experience. I treat every pet like family! Certified in pet first aid.',
   '["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800","https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"]',
   18.00, 4.9, 23, true, 48.8566, 2.3522, NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'Carlos Rodriguez', 'carlos.rodriguez@demo.petflik.com', '+34612345602', 'Madrid', '28001', 'walker',
   'Former veterinary technician turned full-time pet sitter. I specialize in anxious dogs and senior pets. Available weekends!',
   '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"]',
   15.00, 4.8, 18, true, 40.4168, -3.7038, NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'Emma Dubois', 'emma.dubois@demo.petflik.com', '+33612345603', 'Lyon', '69001', 'walker',
   'Dog trainer and walker based in Lyon. I love long nature walks with energetic pups. Your dog will come back tired and happy!',
   '["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"]',
   20.00, 5.0, 31, true, 45.7640, 4.8357, NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'Lucas García', 'lucas.garcia@demo.petflik.com', '+34612345604', 'Barcelona', '08001', 'walker',
   'Beach walks specialist! Based near Barceloneta, I take dogs on the best seaside routes. Also experienced with cats.',
   '["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800","https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800"]',
   22.00, 4.7, 15, true, 41.3874, 2.1686, NOW()),
  ('a1000000-0000-0000-0000-000000000005', 'Léa Bernard', 'lea.bernard@demo.petflik.com', '+33612345605', 'Paris', '75011', 'walker',
   'Part-time student, full-time animal enthusiast! I offer affordable walks and overnight pet sitting in the 11th arrondissement.',
   '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800","https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800"]',
   12.00, 4.6, 9, true, 48.8590, 2.3800, NOW()),
  ('a1000000-0000-0000-0000-000000000006', 'Marco Rossi', 'marco.rossi@demo.petflik.com', '+39612345606', 'Barcelona', '08002', 'walker',
   'Italian expat in Barcelona who grew up on a farm with animals. I have a big garden where your pets can play freely!',
   '["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800","https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800"]',
   25.00, 4.9, 27, true, 41.3910, 2.1650, NOW())
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

-- 1b2. Insert the 6 demo owners (so you can like them and get a match with their owner; link pets via seed-demo-data or pets table owner_id)
INSERT INTO public.users (id, name, email, phone, city, postal_code, user_type, bio, profile_image, verified, latitude, longitude, created_at)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Marie Laurent', 'marie.laurent@demo.petflik.com', '+33612345611', 'Paris', '75003', 'owner',
   'Proud mama of a golden retriever named Luna. Looking for reliable walkers for weekday afternoons.',
   '["https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800"]', true, 48.8630, 2.3600, NOW()),
  ('b2000000-0000-0000-0000-000000000002', 'Pablo Fernández', 'pablo.fernandez@demo.petflik.com', '+34612345612', 'Madrid', '28002', 'owner',
   'Cat lover with two rescue cats. Need a sitter who understands feline personalities.',
   '["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800"]', true, 40.4200, -3.7010, NOW()),
  ('b2000000-0000-0000-0000-000000000003', 'Chloé Moreau', 'chloe.moreau@demo.petflik.com', '+33612345613', 'Lyon', '69002', 'owner',
   'Working mom with a playful border collie. He needs lots of exercise while I am at the office!',
   '["https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800"]', true, 45.7580, 4.8320, NOW()),
  ('b2000000-0000-0000-0000-000000000004', 'Antonio Ruiz', 'antonio.ruiz@demo.petflik.com', '+34612345614', 'Barcelona', '08003', 'owner',
   'Retired professor with a senior labrador. Looking for gentle, patient walkers.',
   '["https://images.unsplash.com/photo-1463453091185-61582044d556?w=800"]', true, 41.3900, 2.1700, NOW()),
  ('b2000000-0000-0000-0000-000000000005', 'Camille Petit', 'camille.petit@demo.petflik.com', '+33612345615', 'Paris', '75015', 'owner',
   'Busy entrepreneur with an adorable French bulldog. Need morning walks 3x per week.',
   '["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"]', true, 48.8420, 2.2950, NOW()),
  ('b2000000-0000-0000-0000-000000000006', 'Elena Martínez', 'elena.martinez@demo.petflik.com', '+34612345616', 'Madrid', '28003', 'owner',
   'Animal rescue volunteer with a rescued greyhound named Bella. She needs gentle care!',
   '["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"]', true, 40.4250, -3.6900, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, bio = EXCLUDED.bio, profile_image = EXCLUDED.profile_image,
  verified = EXCLUDED.verified, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

-- 1c. Remove likes whose user ids are not in public.users, then re-add FK to public.users
DELETE FROM public.likes WHERE liker_id NOT IN (SELECT id FROM public.users) OR liked_id NOT IN (SELECT id FROM public.users);
ALTER TABLE public.likes
  ADD CONSTRAINT likes_liker_id_fkey FOREIGN KEY (liker_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.likes
  ADD CONSTRAINT likes_liked_id_fkey FOREIGN KEY (liked_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- PART 2: Update the like/match function (supports matches with user_id/matched_user_id OR user1_id/user2_id)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION save_like_and_check_match(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reverse_exists BOOLEAN;
  v_match_exists BOOLEAN;
  v_is_demo_profile BOOLEAN;
  v_liked_exists_in_users BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = p_liked_id) INTO v_liked_exists_in_users;
  IF NOT v_liked_exists_in_users THEN
    RETURN FALSE;
  END IF;

  INSERT INTO likes (id, liker_id, liked_id, created_at)
  SELECT gen_random_uuid(), p_liker_id, p_liked_id, NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM likes WHERE liker_id = p_liker_id AND liked_id = p_liked_id
  );

  v_is_demo_profile := (p_liked_id::text LIKE 'a1000000-%') OR (p_liked_id::text LIKE 'b2000000-%');
  IF v_is_demo_profile THEN
    INSERT INTO likes (id, liker_id, liked_id, created_at)
    SELECT gen_random_uuid(), p_liked_id, p_liker_id, NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE liker_id = p_liked_id AND liked_id = p_liker_id
    );
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM likes
    WHERE liker_id = p_liked_id AND liked_id = p_liker_id
  ) INTO v_reverse_exists;

  IF NOT v_reverse_exists THEN
    RETURN FALSE;
  END IF;

  -- Check/create match: support user_id/matched_user_id or user1_id/user2_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id') THEN
    SELECT EXISTS(
      SELECT 1 FROM matches m
      WHERE (m.user_id = p_liker_id AND m.matched_user_id = p_liked_id)
         OR (m.user_id = p_liked_id AND m.matched_user_id = p_liker_id)
    ) INTO v_match_exists;
    IF v_match_exists THEN RETURN TRUE; END IF;
    INSERT INTO matches (user_id, matched_user_id, match_type, is_mutual, matched_at, created_at)
    SELECT p_liker_id, p_liked_id, 'like', TRUE, NOW(), NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_id = p_liker_id AND m.matched_user_id = p_liked_id)
         OR (m.user_id = p_liked_id AND m.matched_user_id = p_liker_id)
    );
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    SELECT EXISTS(
      SELECT 1 FROM matches m
      WHERE (m.user1_id = p_liker_id AND m.user2_id = p_liked_id)
         OR (m.user1_id = p_liked_id AND m.user2_id = p_liker_id)
    ) INTO v_match_exists;
    IF v_match_exists THEN RETURN TRUE; END IF;
    INSERT INTO matches (user1_id, user2_id, created_at)
    SELECT p_liker_id, p_liked_id, NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user1_id = p_liker_id AND m.user2_id = p_liked_id)
         OR (m.user1_id = p_liked_id AND m.user2_id = p_liker_id)
    );
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION save_like_and_check_match(UUID, UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- PART 3: Ensure matches RLS (supports user_id/matched_user_id or user1_id/user2_id)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
  DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() = matched_user_id);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'user1_id') THEN
    CREATE POLICY "Users can view their matches" ON public.matches FOR SELECT
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;
