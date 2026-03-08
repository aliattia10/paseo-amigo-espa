-- Save like and check/create match for all users (demos and real).
-- 1. Saves the liker's like. 2. For demo profiles (a1000000-* sitters, b2000000-* owners) only, inserts
-- a reverse like server-side so they match instantly; for real users the other person
-- must like back from their app. 3. If a reverse like exists (either way), creates the match.
-- Demo sitters (a1000000-*) and demo owners (b2000000-*, owners of demo pets) missing from users
-- are auto-inserted so likes work (SECURITY DEFINER).

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
  -- 0. Liked user must exist in users (FK). If missing, auto-insert demo sitters (a1000000-*) or demo owners (b2000000-*, owners of demo pets).
  SELECT EXISTS (SELECT 1 FROM users WHERE id = p_liked_id) INTO v_liked_exists_in_users;
  IF NOT v_liked_exists_in_users THEN
    IF p_liked_id::text LIKE 'a1000000-%' THEN
      BEGIN
        INSERT INTO users (id, name, email, phone, city, postal_code, user_type, profile_image, created_at, updated_at)
        SELECT v.id, v.name, v.email, v.phone, v.city, v.postal_code, v.user_type, v.profile_image, NOW(), NOW()
        FROM (VALUES
          ('a1000000-0000-0000-0000-000000000001'::uuid, 'Sophie Martin', 'sophie.martin@demo.petflik.com', '+33612345601', 'Paris', '75001', 'walker', '["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"]'),
          ('a1000000-0000-0000-0000-000000000002'::uuid, 'Carlos Rodriguez', 'carlos.rodriguez@demo.petflik.com', '+34612345602', 'Madrid', '28001', 'walker', '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]'),
          ('a1000000-0000-0000-0000-000000000003'::uuid, 'Emma Dubois', 'emma.dubois@demo.petflik.com', '+33612345603', 'Lyon', '69001', 'walker', '["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800"]'),
          ('a1000000-0000-0000-0000-000000000004'::uuid, 'Lucas García', 'lucas.garcia@demo.petflik.com', '+34612345604', 'Barcelona', '08001', 'walker', '["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800"]'),
          ('a1000000-0000-0000-0000-000000000005'::uuid, 'Léa Bernard', 'lea.bernard@demo.petflik.com', '+33612345605', 'Paris', '75011', 'walker', '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800"]'),
          ('a1000000-0000-0000-0000-000000000006'::uuid, 'Marco Rossi', 'marco.rossi@demo.petflik.com', '+39612345606', 'Barcelona', '08002', 'walker', '["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800"]')
        ) AS v(id, name, email, phone, city, postal_code, user_type, profile_image)
        WHERE v.id = p_liked_id AND NOT EXISTS (SELECT 1 FROM users WHERE id = p_liked_id);
      EXCEPTION WHEN foreign_key_violation OR unique_violation THEN NULL;
      END;
    ELSIF p_liked_id::text LIKE 'b2000000-%' THEN
      BEGIN
        INSERT INTO users (id, name, email, phone, city, postal_code, user_type, bio, profile_image, verified, latitude, longitude, created_at)
        SELECT v.id, v.name, v.email, v.phone, v.city, v.postal_code, v.user_type, v.bio, v.profile_image, v.verified, v.latitude, v.longitude, NOW()
        FROM (VALUES
          ('b2000000-0000-0000-0000-000000000001'::uuid, 'Marie Laurent', 'marie.laurent@demo.petflik.com', '+33612345611', 'Paris', '75003', 'owner', 'Proud mama of a golden retriever named Luna. Looking for reliable walkers for weekday afternoons.', '["https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800"]', true, 48.8630, 2.3600),
          ('b2000000-0000-0000-0000-000000000002'::uuid, 'Pablo Fernández', 'pablo.fernandez@demo.petflik.com', '+34612345612', 'Madrid', '28002', 'owner', 'Cat lover with two rescue cats. Need a sitter who understands feline personalities.', '["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800"]', true, 40.4200, -3.7010),
          ('b2000000-0000-0000-0000-000000000003'::uuid, 'Chloé Moreau', 'chloe.moreau@demo.petflik.com', '+33612345613', 'Lyon', '69002', 'owner', 'Working mom with a playful border collie. He needs lots of exercise while I am at the office!', '["https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800"]', true, 45.7580, 4.8320),
          ('b2000000-0000-0000-0000-000000000004'::uuid, 'Antonio Ruiz', 'antonio.ruiz@demo.petflik.com', '+34612345614', 'Barcelona', '08003', 'owner', 'Retired professor with a senior labrador. Looking for gentle, patient walkers.', '["https://images.unsplash.com/photo-1463453091185-61582044d556?w=800"]', true, 41.3900, 2.1700),
          ('b2000000-0000-0000-0000-000000000005'::uuid, 'Camille Petit', 'camille.petit@demo.petflik.com', '+33612345615', 'Paris', '75015', 'owner', 'Busy entrepreneur with an adorable French bulldog. Need morning walks 3x per week.', '["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800"]', true, 48.8420, 2.2950),
          ('b2000000-0000-0000-0000-000000000006'::uuid, 'Elena Martínez', 'elena.martinez@demo.petflik.com', '+34612345616', 'Madrid', '28003', 'owner', 'Animal rescue volunteer with a rescued greyhound named Bella. She needs gentle care!', '["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"]', true, 40.4250, -3.6900)
        ) AS v(id, name, email, phone, city, postal_code, user_type, bio, profile_image, verified, latitude, longitude)
        WHERE v.id = p_liked_id AND NOT EXISTS (SELECT 1 FROM users WHERE id = p_liked_id);
      EXCEPTION WHEN foreign_key_violation OR unique_violation THEN NULL;
      END;
    END IF;
    SELECT EXISTS (SELECT 1 FROM users WHERE id = p_liked_id) INTO v_liked_exists_in_users;
    IF NOT v_liked_exists_in_users THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- 1. Save the liker's like (current user -> profile); skip if already exists
  INSERT INTO likes (id, liker_id, liked_id, created_at)
  SELECT gen_random_uuid(), p_liker_id, p_liked_id, NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM likes WHERE liker_id = p_liker_id AND liked_id = p_liked_id
  );

  -- 2. Demo profiles only: add reverse like so they match instantly. Real users match when the other person likes back.
  v_is_demo_profile := (p_liked_id::text LIKE 'a1000000-%') OR (p_liked_id::text LIKE 'b2000000-%');
  IF v_is_demo_profile THEN
    INSERT INTO likes (id, liker_id, liked_id, created_at)
    SELECT gen_random_uuid(), p_liked_id, p_liker_id, NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE liker_id = p_liked_id AND liked_id = p_liker_id
    );
  END IF;

  -- 4. If reverse like exists (other user liked back, or we inserted it for a demo), create match.
  SELECT EXISTS(
    SELECT 1 FROM likes
    WHERE liker_id = p_liked_id AND liked_id = p_liker_id
  ) INTO v_reverse_exists;

  IF NOT v_reverse_exists THEN
    RETURN FALSE;
  END IF;

  -- 3 & 5. Check if match already exists and create if not (support user_id/matched_user_id or user1_id/user2_id)
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

COMMENT ON FUNCTION save_like_and_check_match(UUID, UUID) IS 'Saves a like; creates a match when there is a mutual like (works for all users; demo profiles get an automatic reverse like for instant match).';

GRANT EXECUTE ON FUNCTION save_like_and_check_match(UUID, UUID) TO authenticated;
