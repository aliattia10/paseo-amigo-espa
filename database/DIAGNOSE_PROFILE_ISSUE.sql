-- ============================================
-- DIAGNOSTIC QUERY FOR PROFILE VISIBILITY
-- Run this to see what's happening
-- ============================================

-- 1. Check all users and their types
SELECT 
  id,
  email,
  name,
  user_type,
  created_at
FROM users
ORDER BY created_at DESC;

-- 2. Check all pets
SELECT 
  id,
  name,
  owner_id,
  age,
  created_at
FROM pets
ORDER BY created_at DESC;

-- 3. Check likes (user-to-user)
SELECT 
  l.id,
  l.liker_id,
  u1.email as liker_email,
  l.liked_id,
  u2.email as liked_email,
  l.created_at
FROM likes l
LEFT JOIN users u1 ON l.liker_id = u1.id
LEFT JOIN users u2 ON l.liked_id = u2.id
ORDER BY l.created_at DESC;

-- 4. Check passes (user-to-user)
SELECT 
  p.id,
  p.passer_id,
  u1.email as passer_email,
  p.passed_id,
  u2.email as passed_email,
  p.created_at
FROM passes p
LEFT JOIN users u1 ON p.passer_id = u1.id
LEFT JOIN users u2 ON p.passed_id = u2.id
ORDER BY p.created_at DESC;

-- 5. Check pet_likes (sitter-to-pet)
SELECT 
  pl.id,
  pl.sitter_id,
  u.email as sitter_email,
  pl.pet_id,
  pet.name as pet_name,
  pl.created_at
FROM pet_likes pl
LEFT JOIN users u ON pl.sitter_id = u.id
LEFT JOIN pets pet ON pl.pet_id = pet.id
ORDER BY pl.created_at DESC;

-- 6. Check pet_passes (sitter-to-pet)
SELECT 
  pp.id,
  pp.sitter_id,
  u.email as sitter_email,
  pp.pet_id,
  pet.name as pet_name,
  pp.created_at
FROM pet_passes pp
LEFT JOIN users u ON pp.sitter_id = u.id
LEFT JOIN pets pet ON pp.pet_id = pet.id
ORDER BY pp.created_at DESC;

-- 7. Find specific user IDs
SELECT 
  id,
  email,
  user_type
FROM users
WHERE email IN ('aliattiaa@gmail.com', 'attiaali85@gmail.com');

-- 8. Check what profiles attiaali85@gmail.com should see
-- (Assuming they are a sitter looking for pets)
SELECT 
  p.id,
  p.name,
  p.owner_id,
  u.email as owner_email
FROM pets p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id != (SELECT id FROM users WHERE email = 'attiaali85@gmail.com')
ORDER BY p.created_at DESC;

-- 9. Check what profiles aliattiaa@gmail.com should see
-- (Assuming they are an owner looking for sitters)
SELECT 
  u.id,
  u.name,
  u.email,
  u.user_type
FROM users u
WHERE u.id != (SELECT id FROM users WHERE email = 'aliattiaa@gmail.com')
AND (u.user_type = 'walker' OR u.user_type = 'sitter' OR u.user_type = 'both')
ORDER BY u.created_at DESC;
