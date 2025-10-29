-- =====================================================
-- MINIMAL SAFE UPDATE FOR PETFLIK
-- Only adds new columns and tables without data migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN RAISE NOTICE '🚀 Starting minimal safe update...'; END $$;

-- =====================================================
-- 1. UPDATE USERS TABLE - Add missing columns
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='location_enabled') THEN
        ALTER TABLE users ADD COLUMN location_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='location_updated_at') THEN
        ALTER TABLE users ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='filter_preferences') THEN
        ALTER TABLE users ADD COLUMN filter_preferences JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='pet_preferences') THEN
        ALTER TABLE users ADD COLUMN pet_preferences JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='max_distance_km') THEN
        ALTER TABLE users ADD COLUMN max_distance_km INTEGER DEFAULT 50;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='min_rating') THEN
        ALTER TABLE users ADD COLUMN min_rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='max_hourly_rate') THEN
        ALTER TABLE users ADD COLUMN max_hourly_rate DECIMAL(10,2);
    END IF;
    
    RAISE NOTICE '✅ Users table updated';
END $$;

-- =====================================================
-- 2. CREATE PETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pet_type TEXT NOT NULL DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat')),
    age TEXT NOT NULL,
    breed TEXT,
    notes TEXT,
    image_url TEXT,
    temperament TEXT[],
    special_needs TEXT,
    energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type ON pets(pet_type);

DO $$ BEGIN RAISE NOTICE '✅ Pets table ready'; END $$;

-- =====================================================
-- 3. UPDATE BOOKINGS TABLE - Add pet_id
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pet_id') THEN
        ALTER TABLE bookings ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added pet_id to bookings';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='dog_id' AND is_nullable='NO') THEN
        ALTER TABLE bookings ALTER COLUMN dog_id DROP NOT NULL;
        RAISE NOTICE '✅ Made dog_id nullable';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);

-- =====================================================
-- 4. UPDATE REVIEWS TABLE - Add new columns
-- =====================================================

DO $$ 
BEGIN
    -- Add booking_id (nullable, for future use)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='booking_id') THEN
        ALTER TABLE reviews ADD COLUMN booking_id UUID;
        RAISE NOTICE '✅ Added booking_id to reviews (nullable)';
    END IF;
    
    -- Add reviewee_id (nullable, alias for reviewed_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='reviewee_id') THEN
        ALTER TABLE reviews ADD COLUMN reviewee_id UUID;
        RAISE NOTICE '✅ Added reviewee_id to reviews (nullable)';
    END IF;
    
    -- Add updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='updated_at') THEN
        ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at to reviews';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- =====================================================
-- 5. CREATE WALKER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS walker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 15.00,
    availability TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_walks INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON walker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_rating ON walker_profiles(rating DESC);

DO $$ BEGIN RAISE NOTICE '✅ Walker profiles table ready'; END $$;

-- =====================================================
-- 6. CREATE AVAILABILITY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_sitter_id ON availability(sitter_id);
CREATE INDEX IF NOT EXISTS idx_availability_start_time ON availability(start_time);

DO $$ BEGIN RAISE NOTICE '✅ Availability table ready'; END $$;

-- =====================================================
-- 7. ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets policies
DROP POLICY IF EXISTS "Users can view all pets" ON pets;
CREATE POLICY "Users can view all pets" ON pets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own pets" ON pets;
CREATE POLICY "Users can manage own pets" ON pets FOR ALL USING (auth.uid() = owner_id);

-- Walker profiles policies
DROP POLICY IF EXISTS "Anyone can view walker profiles" ON walker_profiles;
CREATE POLICY "Anyone can view walker profiles" ON walker_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Walkers can manage own profile" ON walker_profiles;
CREATE POLICY "Walkers can manage own profile" ON walker_profiles FOR ALL USING (auth.uid() = user_id);

-- Availability policies
DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
CREATE POLICY "Anyone can view availability" ON availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sitters can manage own availability" ON availability;
CREATE POLICY "Sitters can manage own availability" ON availability FOR ALL USING (auth.uid() = sitter_id);

DO $$ BEGIN RAISE NOTICE '✅ RLS policies created'; END $$;

-- =====================================================
-- 9. CREATE STORAGE POLICIES
-- =====================================================

-- Ensure avatars bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DO $$ BEGIN RAISE NOTICE '✅ Storage policies created'; END $$;

-- =====================================================
-- 10. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walker_profiles_updated_at ON walker_profiles;
CREATE TRIGGER update_walker_profiles_updated_at BEFORE UPDATE ON walker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN RAISE NOTICE '✅ Helper functions created'; END $$;

-- =====================================================
-- 11. MIGRATE DOGS TO PETS (Safe)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dogs') THEN
        INSERT INTO pets (id, owner_id, name, pet_type, age, breed, notes, image_url, created_at, updated_at)
        SELECT id, owner_id, name, 'dog', age, breed, notes, image_url, created_at, updated_at
        FROM dogs
        WHERE NOT EXISTS (SELECT 1 FROM pets WHERE pets.id = dogs.id);
        
        RAISE NOTICE '✅ Migrated dogs to pets';
    END IF;
END $$;

-- =====================================================
-- COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MINIMAL SAFE UPDATE COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 What was updated:';
    RAISE NOTICE '  ✓ Users table - added new columns';
    RAISE NOTICE '  ✓ Pets table - created';
    RAISE NOTICE '  ✓ Bookings - added pet_id column';
    RAISE NOTICE '  ✓ Reviews - added new columns (nullable)';
    RAISE NOTICE '  ✓ Walker profiles - created';
    RAISE NOTICE '  ✓ Availability - created';
    RAISE NOTICE '  ✓ RLS policies - created';
    RAISE NOTICE '  ✓ Storage policies - created';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Note: Existing data was NOT migrated';
    RAISE NOTICE '   to avoid foreign key conflicts.';
    RAISE NOTICE '   New features will work with new data.';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your app can now use all new features!';
    RAISE NOTICE '';
END $$;
