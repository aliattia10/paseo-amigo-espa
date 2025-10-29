-- =====================================================
-- COMPLETE SCHEMA ALIGNMENT FOR PETFLIK
-- This file ensures all database tables match the application code
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE - Main user profiles
-- =====================================================
-- This table should already exist, but let's ensure all columns are present

DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='location_enabled') THEN
        ALTER TABLE users ADD COLUMN location_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='location_updated_at') THEN
        ALTER TABLE users ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='filter_preferences') THEN
        ALTER TABLE users ADD COLUMN filter_preferences JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='pet_preferences') THEN
        ALTER TABLE users ADD COLUMN pet_preferences JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='max_distance_km') THEN
        ALTER TABLE users ADD COLUMN max_distance_km INTEGER DEFAULT 50;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='min_rating') THEN
        ALTER TABLE users ADD COLUMN min_rating DECIMAL(3,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='max_hourly_rate') THEN
        ALTER TABLE users ADD COLUMN max_hourly_rate DECIMAL(10,2);
    END IF;
END $$;

-- =====================================================
-- 2. PETS TABLE - For both dogs and cats
-- =====================================================
-- Ensure pets table exists with all required columns

CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pet_type TEXT NOT NULL DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat')),
    age TEXT NOT NULL,
    breed TEXT,
    notes TEXT,
    image_url TEXT, -- Stores JSON array of image URLs
    temperament TEXT[],
    special_needs TEXT,
    energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type ON pets(pet_type);

-- =====================================================
-- 3. BOOKINGS TABLE - Ensure pet_id is properly set up
-- =====================================================
-- The bookings table should support both dog_id and pet_id

DO $$ 
BEGIN
    -- Make dog_id nullable since we're transitioning to pet_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='bookings' AND column_name='dog_id' 
               AND is_nullable='NO') THEN
        ALTER TABLE bookings ALTER COLUMN dog_id DROP NOT NULL;
    END IF;
    
    -- Ensure pet_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='pet_id') THEN
        ALTER TABLE bookings ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add check constraint to ensure either dog_id or pet_id is set
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_pet_check') THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_pet_check 
        CHECK (dog_id IS NOT NULL OR pet_id IS NOT NULL);
    END IF;
END $$;

-- =====================================================
-- 4. STORAGE BUCKETS - Ensure avatars bucket exists
-- =====================================================
-- This needs to be run in Supabase dashboard or via API
-- The avatars bucket should allow:
-- - Profile images in: users/{user_id}/*.{jpg,png,webp}
-- - Pet images in: pets/*.{jpg,png,webp}

-- Note: Run this in Supabase Storage settings or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. RLS POLICIES - Ensure proper access control
-- =====================================================

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets table policies
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all pets" ON pets;
CREATE POLICY "Users can view all pets" ON pets
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own pets" ON pets;
CREATE POLICY "Users can manage own pets" ON pets
    FOR ALL USING (auth.uid() = owner_id);

-- Bookings table policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- =====================================================
-- 6. STORAGE POLICIES - Allow image uploads
-- =====================================================

-- Allow authenticated users to upload to their own folders
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow authenticated users to update their own images
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow authenticated users to delete their own images
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public read access to all avatars
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. DATA MIGRATION - Move dogs to pets
-- =====================================================

-- Migrate existing dogs to pets table (if dogs table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dogs') THEN
        -- Insert dogs into pets table if they don't already exist
        INSERT INTO pets (id, owner_id, name, pet_type, age, breed, notes, image_url, created_at, updated_at)
        SELECT 
            id,
            owner_id,
            name,
            'dog' as pet_type,
            age,
            breed,
            notes,
            image_url,
            created_at,
            updated_at
        FROM dogs
        WHERE NOT EXISTS (
            SELECT 1 FROM pets WHERE pets.id = dogs.id
        );
        
        -- Update bookings to use pet_id instead of dog_id
        UPDATE bookings
        SET pet_id = dog_id
        WHERE pet_id IS NULL AND dog_id IS NOT NULL;
    END IF;
END $$;

-- =====================================================
-- 9. REVIEWS TABLE - For sitter ratings and feedback
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id) -- One review per booking per reviewer
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all reviews" ON reviews;
CREATE POLICY "Users can view all reviews" ON reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_id 
            AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())
            AND bookings.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- =====================================================
-- 10. AVAILABILITY TABLE - For sitter availability slots
-- =====================================================

CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_time > start_time)
);

-- Create indexes for availability
CREATE INDEX IF NOT EXISTS idx_availability_sitter_id ON availability(sitter_id);
CREATE INDEX IF NOT EXISTS idx_availability_start_time ON availability(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- RLS policies for availability
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all availability" ON availability;
CREATE POLICY "Users can view all availability" ON availability
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sitters can manage own availability" ON availability;
CREATE POLICY "Sitters can manage own availability" ON availability
    FOR ALL USING (auth.uid() = sitter_id);

-- =====================================================
-- 11. WALKER_PROFILES TABLE - Extended sitter information
-- =====================================================

CREATE TABLE IF NOT EXISTS walker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 15.00,
    availability TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_walks INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for walker_profiles
CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON walker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_rating ON walker_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_verified ON walker_profiles(verified);

-- RLS policies for walker_profiles
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all walker profiles" ON walker_profiles;
CREATE POLICY "Users can view all walker profiles" ON walker_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Walkers can manage own profile" ON walker_profiles;
CREATE POLICY "Walkers can manage own profile" ON walker_profiles
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 12. FUNCTIONS - Calculate ratings and update counts
-- =====================================================

-- Function to update sitter rating after review
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update walker_profiles with new average rating and review count
    UPDATE walker_profiles
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        updated_at = NOW()
    WHERE user_id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after review insert/update
DROP TRIGGER IF EXISTS update_rating_after_review ON reviews;
CREATE TRIGGER update_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_sitter_rating();

-- Function to increment total walks after booking completion
CREATE OR REPLACE FUNCTION increment_total_walks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE walker_profiles
        SET 
            total_walks = total_walks + 1,
            updated_at = NOW()
        WHERE user_id = NEW.sitter_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment walks after booking completion
DROP TRIGGER IF EXISTS increment_walks_after_completion ON bookings;
CREATE TRIGGER increment_walks_after_completion
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION increment_total_walks();

-- Function to check availability conflicts
CREATE OR REPLACE FUNCTION check_availability_conflict(
    p_sitter_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM availability
        WHERE sitter_id = p_sitter_id
        AND status = 'booked'
        AND (id != p_exclude_id OR p_exclude_id IS NULL)
        AND (
            (start_time <= p_start_time AND end_time > p_start_time) OR
            (start_time < p_end_time AND end_time >= p_end_time) OR
            (start_time >= p_start_time AND end_time <= p_end_time)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create booking with availability check
CREATE OR REPLACE FUNCTION create_booking_with_availability(
    p_owner_id UUID,
    p_sitter_id UUID,
    p_pet_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_service_type TEXT,
    p_total_price DECIMAL,
    p_commission_fee DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
BEGIN
    -- Check for conflicts
    IF check_availability_conflict(p_sitter_id, p_start_time, p_end_time) THEN
        RAISE EXCEPTION 'Sitter is not available for the selected time slot';
    END IF;
    
    -- Create booking
    INSERT INTO bookings (
        owner_id, sitter_id, pet_id, start_time, end_time,
        service_type, total_price, commission_fee, status
    ) VALUES (
        p_owner_id, p_sitter_id, p_pet_id, p_start_time, p_end_time,
        p_service_type, p_total_price, p_commission_fee, 'pending'
    ) RETURNING id INTO v_booking_id;
    
    -- Mark availability as booked
    INSERT INTO availability (sitter_id, start_time, end_time, status)
    VALUES (p_sitter_id, p_start_time, p_end_time, 'booked');
    
    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 13. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter_id ON bookings(sitter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything is set up correctly:

-- Check users table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;

-- Check pets table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'pets' 
-- ORDER BY ordinal_position;

-- Check bookings table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'bookings' 
-- ORDER BY ordinal_position;

-- Check storage policies
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Schema alignment complete!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Verify storage bucket "avatars" exists in Supabase Dashboard';
    RAISE NOTICE '2. Test image uploads from the app';
    RAISE NOTICE '3. Test profile and pet data updates';
    RAISE NOTICE '4. Check that RLS policies are working correctly';
END $$;


-- =====================================================
-- 9. AVAILABILITY TABLE - Sitter availability slots
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
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- RLS Policies for availability
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
CREATE POLICY "Anyone can view availability" ON availability
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sitters can manage own availability" ON availability;
CREATE POLICY "Sitters can manage own availability" ON availability
    FOR ALL USING (auth.uid() = sitter_id);

-- =====================================================
-- 10. REVIEWS TABLE - Post-booking reviews
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- RLS Policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_id 
            AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())
            AND bookings.status = 'completed'
        )
    );

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- =====================================================
-- 11. NOTIFICATIONS TABLE - User notifications
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

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 12. CHAT MESSAGES TABLE - Booking-related messages
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
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

CREATE INDEX IF NOT EXISTS idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- RLS Policies for chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages for their bookings" ON chat_messages;
CREATE POLICY "Users can view messages for their bookings" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_id 
            AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages for their bookings" ON chat_messages;
CREATE POLICY "Users can send messages for their bookings" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_id 
            AND (bookings.owner_id = auth.uid() OR bookings.sitter_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- =====================================================
-- 13. WALKER PROFILES TABLE - Extended sitter info
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
CREATE INDEX IF NOT EXISTS idx_walker_profiles_hourly_rate ON walker_profiles(hourly_rate);

-- RLS Policies for walker profiles
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view walker profiles" ON walker_profiles;
CREATE POLICY "Anyone can view walker profiles" ON walker_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Walkers can manage own profile" ON walker_profiles;
CREATE POLICY "Walkers can manage own profile" ON walker_profiles
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 14. FUNCTIONS - Calculate ratings and review counts
-- =====================================================

-- Function to update sitter rating and review count
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update walker_profiles with new rating and review count
    UPDATE walker_profiles
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        updated_at = NOW()
    WHERE user_id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating after review
DROP TRIGGER IF EXISTS update_sitter_rating_trigger ON reviews;
CREATE TRIGGER update_sitter_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_sitter_rating();

-- Function to increment total walks
CREATE OR REPLACE FUNCTION increment_total_walks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE walker_profiles
        SET 
            total_walks = total_walks + 1,
            updated_at = NOW()
        WHERE user_id = NEW.sitter_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment walks on booking completion
DROP TRIGGER IF EXISTS increment_walks_trigger ON bookings;
CREATE TRIGGER increment_walks_trigger
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION increment_total_walks();

-- Function to create notification on new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify sitter
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        NEW.sitter_id,
        'booking',
        '🎉 New Booking Request',
        'You have a new booking request!',
        '/bookings/' || NEW.id,
        jsonb_build_object('booking_id', NEW.id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new booking notifications
DROP TRIGGER IF EXISTS notify_booking_trigger ON bookings;
CREATE TRIGGER notify_booking_trigger
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_booking();

-- Function to create notification on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Get the other user in the booking
    SELECT CASE 
        WHEN owner_id = NEW.sender_id THEN sitter_id
        ELSE owner_id
    END INTO recipient_id
    FROM bookings
    WHERE id = NEW.booking_id;
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        recipient_id,
        'message',
        '💬 New Message',
        LEFT(NEW.message, 100),
        '/messages?booking=' || NEW.booking_id,
        jsonb_build_object('booking_id', NEW.booking_id, 'sender_id', NEW.sender_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new message notifications
DROP TRIGGER IF EXISTS notify_message_trigger ON chat_messages;
CREATE TRIGGER notify_message_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();

-- Function to create notification on new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        NEW.reviewee_id,
        'review',
        '⭐ New Review',
        'You received a new ' || NEW.rating || '-star review!',
        '/profile',
        jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new review notifications
DROP TRIGGER IF EXISTS notify_review_trigger ON reviews;
CREATE TRIGGER notify_review_trigger
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_review();

-- =====================================================
-- 15. ADDITIONAL TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walker_profiles_updated_at ON walker_profiles;
CREATE TRIGGER update_walker_profiles_updated_at
    BEFORE UPDATE ON walker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 16. FINAL COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Complete schema with all features is ready!';
    RAISE NOTICE '📋 Features included:';
    RAISE NOTICE '  ✓ Users & Profiles';
    RAISE NOTICE '  ✓ Pets (Dogs & Cats)';
    RAISE NOTICE '  ✓ Bookings';
    RAISE NOTICE '  ✓ Availability Management';
    RAISE NOTICE '  ✓ Reviews & Ratings';
    RAISE NOTICE '  ✓ Notifications';
    RAISE NOTICE '  ✓ Chat Messages';
    RAISE NOTICE '  ✓ Walker Profiles';
    RAISE NOTICE '  ✓ Automatic rating calculations';
    RAISE NOTICE '  ✓ Automatic notifications';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your Petflik database is 100%% complete!';
END $$;
