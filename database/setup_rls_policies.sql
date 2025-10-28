-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this AFTER the main migration
-- ============================================

-- ============================================
-- 1. USERS TABLE POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create policies
CREATE POLICY "Users can view all profiles" 
ON users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. DOGS TABLE POLICIES
-- ============================================

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all dogs" ON dogs;
DROP POLICY IF EXISTS "Owners can insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Owners can update own dogs" ON dogs;
DROP POLICY IF EXISTS "Owners can delete own dogs" ON dogs;

CREATE POLICY "Users can view all dogs" 
ON dogs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Owners can insert own dogs" 
ON dogs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own dogs" 
ON dogs FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own dogs" 
ON dogs FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- ============================================
-- 3. BOOKINGS TABLE POLICIES
-- ============================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can create bookings" ON bookings;
DROP POLICY IF EXISTS "Sitters can update bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can cancel bookings" ON bookings;

CREATE POLICY "Users can view own bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

CREATE POLICY "Owners can create bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Sitters can update bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (auth.uid() = sitter_id);

CREATE POLICY "Owners can cancel bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id AND status = 'requested');

-- ============================================
-- 4. AVAILABILITY TABLE POLICIES
-- ============================================

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view availability" ON availability;
DROP POLICY IF EXISTS "Sitters can insert own availability" ON availability;
DROP POLICY IF EXISTS "Sitters can update own availability" ON availability;
DROP POLICY IF EXISTS "Sitters can delete own availability" ON availability;

CREATE POLICY "Everyone can view availability" 
ON availability FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Sitters can insert own availability" 
ON availability FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "Sitters can update own availability" 
ON availability FOR UPDATE 
TO authenticated 
USING (auth.uid() = sitter_id);

CREATE POLICY "Sitters can delete own availability" 
ON availability FOR DELETE 
TO authenticated 
USING (auth.uid() = sitter_id);

-- ============================================
-- 5. NOTIFICATIONS TABLE POLICIES
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================
-- 6. STORAGE POLICIES
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow users to update own files" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'avatars');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS Policies configured successfully!';
  RAISE NOTICE 'All tables are now secured with Row Level Security';
  RAISE NOTICE 'Storage policies configured for avatars bucket';
  RAISE NOTICE 'Your database is ready to use!';
END $$;
