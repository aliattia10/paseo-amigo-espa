-- =====================================================
-- COMPLETE SCHEMA ALIGNMENT FOR PETFLIK - FIXED VERSION
-- This file ensures all database tables match the application code
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE - Main user profiles
-- =====================================================

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

-- =====================================================
-- 3. BOOKINGS TABLE - Ensure it exists with all columns
-- =====================================================

-- Check if bookings table exists, if not create it
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dog_id UUID,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    service_type TEXT DEFAULT 'walk',
    total_price DECIMAL(10,2) NOT NULL,
    commission_fee DECIMAL(10,2) DEFAULT 0,
    payment_status TEXT,
    payment_amount DECIMAL(10,2),
    stripe_payment_intent_id TEXT,
    location TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add pet_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='pet_id') THEN
        ALTER TABLE bookings ADD COLUMN pet_id UUID REFERENCES pets(id) ON DELETE CASCADE;
    END IF;
    
    -- Make dog_id nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='bookings' AND column_name='dog_id' 
               AND is_nullable='NO') THEN
        ALTER TABLE bookings ALTER COLUMN dog_id DROP NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter_id ON bookings(sitter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON bookings(pet_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);

-- =====================================================
-- 4. AVAILABILITY TABLE - Sitter availability slots
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

-- =====================================================
-- 5. REVIEWS TABLE - Post-booking reviews
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_booking_reviewer_unique') THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_booking_reviewer_unique UNIQUE(booking_id, reviewer_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =====================================================
-- 6. NOTIFICATIONS TABLE - User notifications
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

-- =====================================================
-- 7. CHAT MESSAGES TABLE - Booking-related messages
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

-- =====================================================
-- 8. WALKER PROFILES TABLE - Extended sitter info
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

-- =====================================================
-- 9. STORAGE BUCKET - Ensure avatars bucket exists
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. RLS POLICIES
-- =====================================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets table
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all pets" ON pets;
CREATE POLICY "Users can view all pets" ON pets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own pets" ON pets;
CREATE POLICY "Users can manage own pets" ON pets FOR ALL USING (auth.uid() = owner_id);

-- Bookings table
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

-- Availability table
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
CREATE POLICY "Anyone can view availability" ON availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sitters can manage own availability" ON availability;
CREATE POLICY "Sitters can manage own availability" ON availability FOR ALL USING (auth.uid() = sitter_id);

-- Reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

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
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Chat messages table
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
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE USING (auth.uid() = sender_id);

-- Walker profiles table
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view walker profiles" ON walker_profiles;
CREATE POLICY "Anyone can view walker profiles" ON walker_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Walkers can manage own profile" ON walker_profiles;
CREATE POLICY "Walkers can manage own profile" ON walker_profiles FOR ALL USING (auth.uid() = user_id);

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

-- =====================================================
-- 11. HELPER FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
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

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walker_profiles_updated_at ON walker_profiles;
CREATE TRIGGER update_walker_profiles_updated_at BEFORE UPDATE ON walker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update sitter rating
CREATE OR REPLACE FUNCTION update_sitter_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE walker_profiles
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
        updated_at = NOW()
    WHERE user_id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sitter_rating_trigger ON reviews;
CREATE TRIGGER update_sitter_rating_trigger AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_sitter_rating();

-- Function to increment total walks
CREATE OR REPLACE FUNCTION increment_total_walks()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE walker_profiles
        SET total_walks = total_walks + 1, updated_at = NOW()
        WHERE user_id = NEW.sitter_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_walks_trigger ON bookings;
CREATE TRIGGER increment_walks_trigger AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION increment_total_walks();

-- Function to create notification on new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        NEW.sitter_id, 'booking', '🎉 New Booking Request',
        'You have a new booking request!', '/bookings/' || NEW.id,
        jsonb_build_object('booking_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_booking_trigger ON bookings;
CREATE TRIGGER notify_booking_trigger AFTER INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION notify_new_booking();

-- Function to create notification on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    SELECT CASE WHEN owner_id = NEW.sender_id THEN sitter_id ELSE owner_id END
    INTO recipient_id FROM bookings WHERE id = NEW.booking_id;
    
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        recipient_id, 'message', '💬 New Message', LEFT(NEW.message, 100),
        '/messages?booking=' || NEW.booking_id,
        jsonb_build_object('booking_id', NEW.booking_id, 'sender_id', NEW.sender_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_message_trigger ON chat_messages;
CREATE TRIGGER notify_message_trigger AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Function to create notification on new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (
        NEW.reviewee_id, 'review', '⭐ New Review',
        'You received a new ' || NEW.rating || '-star review!', '/profile',
        jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_review_trigger ON reviews;
CREATE TRIGGER notify_review_trigger AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION notify_new_review();

-- =====================================================
-- 12. DATA MIGRATION
-- =====================================================

-- Migrate dogs to pets if dogs table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dogs') THEN
        INSERT INTO pets (id, owner_id, name, pet_type, age, breed, notes, image_url, created_at, updated_at)
        SELECT id, owner_id, name, 'dog', age, breed, notes, image_url, created_at, updated_at
        FROM dogs
        WHERE NOT EXISTS (SELECT 1 FROM pets WHERE pets.id = dogs.id);
        
        UPDATE bookings SET pet_id = dog_id WHERE pet_id IS NULL AND dog_id IS NOT NULL;
    END IF;
END $$;

-- =====================================================
-- COMPLETION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Schema alignment complete!';
    RAISE NOTICE '📋 All tables, triggers, and policies are ready!';
    RAISE NOTICE '🎉 Your Petflik database is 100%% functional!';
END $$;
