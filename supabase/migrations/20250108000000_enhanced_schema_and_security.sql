-- Enhanced Schema and Security Fix
-- Adds missing fields and fixes RLS policies

-- =====================================================
-- 1. ADD MISSING COLUMNS TO USERS TABLE
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
-- 2. FIX RLS POLICIES - REMOVE ANONYMOUS ACCESS
-- =====================================================

-- Drop problematic policies that allow anonymous access
DROP POLICY IF EXISTS "Walker profiles are publicly viewable" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view verified walker profiles" ON walker_profiles;

-- =====================================================
-- 3. CREATE SECURE RLS POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create secure policies for users table
CREATE POLICY "Allow user registration" ON users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access" ON users 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Fix dogs table policies
DROP POLICY IF EXISTS "Users can view their own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can insert their own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can update their own dogs" ON dogs;

CREATE POLICY "Owners can manage their dogs" ON dogs 
FOR ALL 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Fix walker_profiles table policies
DROP POLICY IF EXISTS "Anyone can view verified walker profiles" ON walker_profiles;
DROP POLICY IF EXISTS "Users can view their own walker profile" ON walker_profiles;
DROP POLICY IF EXISTS "Users can insert their own walker profile" ON walker_profiles;
DROP POLICY IF EXISTS "Users can update their own walker profile" ON walker_profiles;

CREATE POLICY "Users can manage their own walker profile" ON walker_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE PROXIMITY SEARCH FUNCTION
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
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for proximity search
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_location ON users(user_type, latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating) WHERE rating > 0;
