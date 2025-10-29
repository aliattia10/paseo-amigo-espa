-- =====================================================
-- SAFE SCHEMA UPDATE FOR PETFLIK
-- This file safely updates existing tables without breaking them
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. UPDATE USERS TABLE - Add missing columns
-- =====================================================

DO $$ 
BEGIN
    -- Add columns only if they don't exist
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
-- 2. CREATE/UPDATE PETS TABLE
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
-- 3. UPDATE BOOKINGS TABLE
-- =====================================================

DO $$ 
BEGIN
    -- Add pet_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pet_id') THEN
        ALTER TABLE bookings ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added pet_id to bookings';
    END IF;
    
    -- Make dog_id nullable if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='dog_id' AND is_nullable='NO') THEN
        ALTER TABLE bookings ALTER COLUMN dog_id DROP NOT NULL;
        RAISE NOTICE '✅ Made dog_id nullable';
    END IF;
    
    -- Migrate dog_id to pet_id if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='dog_id') THEN
        UPDATE bookings SET pet_id = dog_id WHERE pet_id IS NULL AND dog_id IS NOT NULL;
        RAISE NOTICE '✅ Migrated dog_id to pet_id';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);

DO $$ BEGIN RAISE NOTICE '✅ Bookings table updated'; END $$;

-- =====================================================
-- 4. UPDATE REVIEWS TABLE - Work with existing structure
-- =====================================================

DO $$ 
BEGIN
    -- Add booking_id column if it doesn't exist (for future use)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='booking_id') THEN
        ALTER TABLE reviews ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added booking_id to reviews';
    END IF;
    
    -- Add reviewee_id column if it doesn't exist (alias for reviewed_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='reviewee_id') THEN
        ALTER TABLE reviews ADD COLUMN reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE;
        -- Copy data from reviewed_id if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='reviewed_id') THEN
            UPDATE reviews SET reviewee_id = reviewed_id WHERE reviewee_id IS NULL;
        END IF;
        RAISE NOTICE '✅ Added reviewee_id to reviews';
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='updated_at') THEN
        ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at to reviews';
    END IF;
    
    -- Migrate walk_request_id to booking_id if possible
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='walk_request_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='booking_id') THEN
        -- Note: This assumes walk_requests and bookings might be related
        -- Adjust this logic based on your actual data structure
        RAISE NOTICE 'ℹ️  walk_request_id exists - manual migration may be needed';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

DO $$ BEGIN RAISE NOTICE '✅ Reviews table updated'; END $$;

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
-- 7. CREATE NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'review', 'match', 'welcome', 'reminder', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

DO $$ BEGIN RAISE NOTICE '✅ Notifications table ready'; END $$;

-- =====================================================
-- 8. UPDATE CHAT MESSAGES TABLE
-- =====================================================

DO $$
BEGIN
    -- Check if chat_messages exists and has booking_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='chat_messages') THEN
        -- Add booking_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='booking_id') THEN
            ALTER TABLE chat_messages ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
            RAISE NOTICE '✅ Added booking_id to chat_messages';
        END IF;
        
        -- Migrate request_id to booking_id if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='request_id') THEN
            UPDATE chat_messages SET booking_id = request_id WHERE booking_id IS NULL;
            RAISE NOTICE '✅ Migrated request_id to booking_id';
        END IF;
    ELSE
        -- Create table if it doesn't exist
        CREATE TABLE chat_messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            media_url TEXT,
            media_type TEXT,
            media_thumbnail_url TEXT,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Created chat_messages table';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);

DO $$ BEGIN RAISE NOTICE '✅ Chat messages table ready'; END $$;

-- =====================================================
-- 9. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE '✅ RLS enabled on all tables'; END $$;

-- =====================================================
-- 10. CREATE BASIC RLS POLICIES
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Pets policies
DROP POLICY IF EXISTS "Users can view all pets" ON pets;
CREATE POLICY "Users can view all pets" ON pets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own pets" ON pets;
CREATE POLICY "Users can manage own pets" ON pets FOR ALL USING (auth.uid() = owner_id);

-- Bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

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

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

DO $$ BEGIN RAISE NOTICE '✅ Basic RLS policies created'; END $$;

-- =====================================================
-- 11. CREATE HELPER FUNCTIONS
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

DO $$ BEGIN RAISE NOTICE '✅ Helper functions and triggers created'; END $$;

-- =====================================================
-- 12. FUNCTION TO UPDATE WALKER RATINGS
-- =====================================================

CREATE OR REPLACE FUNCTION update_walker_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update using reviewee_id if it exists, otherwise use reviewed_id
    UPDATE walker_profiles
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE COALESCE(reviewee_id, reviewed_id) = NEW.COALESCE(reviewee_id, reviewed_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE COALESCE(reviewee_id, reviewed_id) = NEW.COALESCE(reviewee_id, reviewed_id)
        ),
        updated_at = NOW()
    WHERE user_id = COALESCE(NEW.reviewee_id, NEW.reviewed_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_walker_rating_trigger ON reviews;
CREATE TRIGGER update_walker_rating_trigger AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_walker_rating();

DO $$ BEGIN RAISE NOTICE '✅ Walker rating function created'; END $$;

-- =====================================================
-- 13. DATA MIGRATION
-- =====================================================

-- Migrate dogs to pets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dogs') THEN
        INSERT INTO pets (id, owner_id, name, pet_type, age, breed, notes, image_url, created_at, updated_at)
        SELECT id, owner_id, name, 'dog', age, breed, notes, image_url, created_at, updated_at
        FROM dogs
        WHERE NOT EXISTS (SELECT 1 FROM pets WHERE pets.id = dogs.id);
        
        RAISE NOTICE '✅ Migrated dogs to pets table';
    END IF;
END $$;

-- =====================================================
-- COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SCHEMA UPDATE COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Updated:';
    RAISE NOTICE '  ✓ Users table with all new columns';
    RAISE NOTICE '  ✓ Pets table (dogs & cats)';
    RAISE NOTICE '  ✓ Bookings with pet_id support';
    RAISE NOTICE '  ✓ Reviews with new columns';
    RAISE NOTICE '  ✓ Walker profiles';
    RAISE NOTICE '  ✓ Availability management';
    RAISE NOTICE '  ✓ Notifications system';
    RAISE NOTICE '  ✓ Chat messages';
    RAISE NOTICE '  ✓ RLS policies';
    RAISE NOTICE '  ✓ Auto-rating calculations';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your database is ready!';
    RAISE NOTICE '';
END $$;
