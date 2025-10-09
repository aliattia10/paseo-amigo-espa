-- Paseo Amigo España - Security Audit Fix
-- This script addresses the security issues identified in the audit
-- Fixes: Anonymous Access Policies, Walker Profile Security, Missing RLS Policies

-- =====================================================
-- 1. FIX ANONYMOUS ACCESS POLICIES
-- =====================================================

-- Drop problematic policies that allow anonymous access
DROP POLICY IF EXISTS "Walker profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view verified walker profiles" ON walker_profiles;

-- =====================================================
-- 2. ADD MISSING COLUMNS TO USERS TABLE
-- =====================================================

-- Add missing fields to users table for enhanced functionality
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_walks INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 3. FIX RLS POLICIES FOR ALL TABLES
-- =====================================================

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

DROP POLICY IF EXISTS "Users can view their own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can insert their own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can update their own dogs" ON dogs;
DROP POLICY IF EXISTS "Owners can manage their dogs" ON dogs;
DROP POLICY IF EXISTS "Walkers can view dogs for accepted requests" ON dogs;

DROP POLICY IF EXISTS "Anyone can view verified walker profiles" ON walker_profiles;
DROP POLICY IF EXISTS "Users can view their own walker profile" ON walker_profiles;
DROP POLICY IF EXISTS "Users can insert their own walker profile" ON walker_profiles;
DROP POLICY IF EXISTS "Users can update their own walker profile" ON walker_profiles;

-- =====================================================
-- 4. CREATE SECURE RLS POLICIES
-- =====================================================

-- USERS TABLE POLICIES
-- Allow registration (anyone can insert)
CREATE POLICY "Allow user registration" ON users 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role has full access (for backend operations)
CREATE POLICY "Service role full access" ON users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- DOGS TABLE POLICIES
-- Owners can view their own dogs
CREATE POLICY "Owners can view their own dogs" ON dogs 
FOR SELECT 
USING (auth.uid() = owner_id);

-- Owners can insert their own dogs
CREATE POLICY "Owners can insert their own dogs" ON dogs 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own dogs
CREATE POLICY "Owners can update their own dogs" ON dogs 
FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own dogs
CREATE POLICY "Owners can delete their own dogs" ON dogs 
FOR DELETE 
USING (auth.uid() = owner_id);

-- WALKER_PROFILES TABLE POLICIES
-- Users can view their own walker profile
CREATE POLICY "Users can view their own walker profile" ON walker_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own walker profile
CREATE POLICY "Users can insert their own walker profile" ON walker_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own walker profile
CREATE POLICY "Users can update their own walker profile" ON walker_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own walker profile
CREATE POLICY "Users can delete their own walker profile" ON walker_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- WALK_REQUESTS TABLE POLICIES
-- Users can view their own walk requests
CREATE POLICY "Users can view their own walk requests" ON walk_requests 
FOR SELECT 
USING (auth.uid() = owner_id OR auth.uid() = walker_id);

-- Owners can insert walk requests
CREATE POLICY "Owners can insert walk requests" ON walk_requests 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own walk requests
CREATE POLICY "Users can update their own walk requests" ON walk_requests 
FOR UPDATE 
USING (auth.uid() = owner_id OR auth.uid() = walker_id)
WITH CHECK (auth.uid() = owner_id OR auth.uid() = walker_id);

-- CHAT_MESSAGES TABLE POLICIES
-- Users can view messages for their requests
CREATE POLICY "Users can view messages for their requests" ON chat_messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM walk_requests 
        WHERE walk_requests.id = chat_messages.request_id 
        AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid())
    )
);

-- Users can insert messages for their requests
CREATE POLICY "Users can insert messages for their requests" ON chat_messages 
FOR INSERT 
WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
        SELECT 1 FROM walk_requests 
        WHERE walk_requests.id = chat_messages.request_id 
        AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid())
    )
);

-- REVIEWS TABLE POLICIES
-- Users can view reviews for their requests
CREATE POLICY "Users can view reviews for their requests" ON reviews 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM walk_requests 
        WHERE walk_requests.id = reviews.walk_request_id 
        AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid())
    )
);

-- Users can insert reviews for their requests
CREATE POLICY "Users can insert reviews for their requests" ON reviews 
FOR INSERT 
WITH CHECK (
    auth.uid() = reviewer_id AND 
    EXISTS (
        SELECT 1 FROM walk_requests 
        WHERE walk_requests.id = reviews.walk_request_id 
        AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid())
    )
);

-- USER_SUBSCRIPTIONS TABLE POLICIES
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PAYMENT_METHODS TABLE POLICIES
-- Users can view their own payment methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users can insert their own payment methods" ON payment_methods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update their own payment methods" ON payment_methods 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete their own payment methods" ON payment_methods 
FOR DELETE 
USING (auth.uid() = user_id);

-- WALK_SESSIONS TABLE POLICIES
-- Users can view their own walk sessions
CREATE POLICY "Users can view their own walk sessions" ON walk_sessions 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM walk_requests 
        WHERE walk_requests.id = walk_sessions.walk_request_id 
        AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid())
    )
);

-- GEO_POINTS TABLE POLICIES
-- Users can view geo points for their sessions
CREATE POLICY "Users can view geo points for their sessions" ON geo_points 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM walk_sessions ws 
        JOIN walk_requests wr ON wr.id = ws.walk_request_id 
        WHERE ws.id = geo_points.session_id 
        AND (wr.owner_id = auth.uid() OR wr.walker_id = auth.uid())
    )
);

-- NOTIFICATIONS TABLE POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- SUBSCRIPTION_PLANS TABLE POLICIES
-- Anyone can view subscription plans (for public pricing)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans 
FOR SELECT 
USING (true);

-- Service role can manage subscription plans
CREATE POLICY "Service role can manage subscription plans" ON subscription_plans 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- =====================================================
-- 5. CREATE PROXIMITY SEARCH FUNCTION
-- =====================================================

-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL(10,8),
    lon1 DECIMAL(11,8),
    lat2 DECIMAL(10,8),
    lon2 DECIMAL(11,8)
) RETURNS DECIMAL(8,2) AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby users based on role
CREATE OR REPLACE FUNCTION get_nearby_users(
    user_lat DECIMAL(10,8),
    user_lon DECIMAL(11,8),
    target_role TEXT,
    max_distance_km DECIMAL(8,2) DEFAULT 50.0,
    limit_count INTEGER DEFAULT 20
) RETURNS TABLE (
    id UUID,
    name TEXT,
    user_type TEXT,
    bio TEXT,
    experience INTEGER,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2),
    total_walks INTEGER,
    verified BOOLEAN,
    profile_image TEXT,
    distance_km DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.user_type,
        u.bio,
        u.experience,
        u.hourly_rate,
        u.rating,
        u.total_walks,
        u.verified,
        u.profile_image,
        calculate_distance(user_lat, user_lon, u.latitude, u.longitude) as distance_km
    FROM users u
    WHERE 
        u.user_type = target_role
        AND u.latitude IS NOT NULL 
        AND u.longitude IS NOT NULL
        AND calculate_distance(user_lat, user_lon, u.latitude, u.longitude) <= max_distance_km
        AND u.id != auth.uid() -- Don't include the requesting user
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for proximity search
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_location ON users(user_type, latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating) WHERE rating > 0;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'dogs', 'walker_profiles', 'walk_requests', 'chat_messages', 'reviews', 'user_subscriptions', 'payment_methods', 'walk_sessions', 'geo_points', 'notifications', 'subscription_plans')
ORDER BY tablename;

-- Check that policies are created
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 8. TEST DATA INSERTION (FOR TESTING ONLY)
-- =====================================================

-- Uncomment these lines to test the policies
/*
-- Test user insertion (should work)
INSERT INTO users (id, name, email, phone, city, postal_code, user_type, latitude, longitude, bio, experience)
VALUES (
    'test-user-123', 
    'Test User', 
    'test@example.com', 
    '123456789', 
    'Madrid', 
    '28001', 
    'owner',
    40.4168,
    -3.7038,
    'Test bio',
    0
);

-- Test dog insertion (should work for the owner)
INSERT INTO dogs (owner_id, name, age, breed, notes)
VALUES ('test-user-123', 'Test Dog', '2 years', 'Labrador', 'Friendly dog');
*/
