-- =====================================================
-- COMPLETE DATABASE SETUP FOR PASEO APP
-- =====================================================
-- This script sets up all necessary tables, functions, and policies
-- for the Paseo dog walking app with Supabase
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE USERS TABLE (Enhanced)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    postal_code TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'walker', 'both')) DEFAULT 'owner',
    profile_image TEXT,
    bio TEXT,
    experience INTEGER DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    hourly_rate DECIMAL(10,2),
    availability TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_walks INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE DOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    age INTEGER,
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    temperament TEXT,
    special_needs TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE WALKER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS walker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience TEXT,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    availability TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_walks INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE WALK REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS walk_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    walker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')) DEFAULT 'pending',
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    notes TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walk_request_id UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(walk_request_id, reviewer_id)
);

-- =====================================================
-- 6. CREATE MATCHES TABLE (Tinder-like feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL CHECK (match_type IN ('like', 'superlike', 'pass')),
    is_mutual BOOLEAN DEFAULT FALSE,
    matched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, matched_user_id)
);

-- =====================================================
-- 7. CREATE ACTIVITY FEED TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('walk_completed', 'new_match', 'review_received', 'profile_updated', 'new_dog')),
    activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CREATE MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. CREATE SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')) DEFAULT 'free',
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')) DEFAULT 'inactive',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);

-- Dogs indexes
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_dogs_active ON dogs(is_active);

-- Walk requests indexes
CREATE INDEX IF NOT EXISTS idx_walk_requests_owner_id ON walk_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_walk_requests_walker_id ON walk_requests(walker_id);
CREATE INDEX IF NOT EXISTS idx_walk_requests_status ON walk_requests(status);
CREATE INDEX IF NOT EXISTS idx_walk_requests_scheduled ON walk_requests(scheduled_date);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_walk_request ON reviews(walk_request_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_mutual ON matches(is_mutual) WHERE is_mutual = TRUE;

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed(is_public) WHERE is_public = TRUE;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 11. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for mutual matches
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.match_type IN ('like', 'superlike') THEN
        UPDATE matches
        SET is_mutual = TRUE, matched_at = NOW()
        WHERE user_id = NEW.matched_user_id 
        AND matched_user_id = NEW.user_id 
        AND match_type IN ('like', 'superlike')
        AND is_mutual = FALSE;

        IF FOUND THEN
            NEW.is_mutual := TRUE;
            NEW.matched_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update walker rating
CREATE OR REPLACE FUNCTION update_walker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE walker_profiles
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
    )
    WHERE user_id = NEW.reviewed_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Haversine distance calculation
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

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dogs_updated_at ON dogs;
CREATE TRIGGER update_dogs_updated_at
    BEFORE UPDATE ON dogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walker_profiles_updated_at ON walker_profiles;
CREATE TRIGGER update_walker_profiles_updated_at
    BEFORE UPDATE ON walker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_walk_requests_updated_at ON walk_requests;
CREATE TRIGGER update_walk_requests_updated_at
    BEFORE UPDATE ON walk_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activity_feed_updated_at ON activity_feed;
CREATE TRIGGER update_activity_feed_updated_at
    BEFORE UPDATE ON activity_feed
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mutual match trigger
DROP TRIGGER IF EXISTS check_mutual_match_trigger ON matches;
CREATE TRIGGER check_mutual_match_trigger
    BEFORE INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION check_mutual_match();

-- Walker rating update trigger
DROP TRIGGER IF EXISTS update_walker_rating_trigger ON reviews;
CREATE TRIGGER update_walker_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_walker_rating();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. CREATE RLS POLICIES
-- =====================================================

-- USERS POLICIES
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration" ON users 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view walker profiles" ON users;
CREATE POLICY "Users can view walker profiles" ON users 
FOR SELECT 
USING (user_type IN ('walker', 'both'));

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DOGS POLICIES
DROP POLICY IF EXISTS "Owners can manage their dogs" ON dogs;
CREATE POLICY "Owners can manage their dogs" ON dogs 
FOR ALL 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- WALKER PROFILES POLICIES
DROP POLICY IF EXISTS "Users can manage their walker profile" ON walker_profiles;
CREATE POLICY "Users can manage their walker profile" ON walker_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view walker profiles" ON walker_profiles;
CREATE POLICY "Anyone can view walker profiles" ON walker_profiles 
FOR SELECT 
USING (true);

-- WALK REQUESTS POLICIES
DROP POLICY IF EXISTS "Users can view related walk requests" ON walk_requests;
CREATE POLICY "Users can view related walk requests" ON walk_requests 
FOR SELECT 
USING (auth.uid() = owner_id OR auth.uid() = walker_id);

DROP POLICY IF EXISTS "Owners can create walk requests" ON walk_requests;
CREATE POLICY "Owners can create walk requests" ON walk_requests 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Involved users can update walk requests" ON walk_requests;
CREATE POLICY "Involved users can update walk requests" ON walk_requests 
FOR UPDATE 
USING (auth.uid() = owner_id OR auth.uid() = walker_id);

-- REVIEWS POLICIES
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

-- MATCHES POLICIES
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
CREATE POLICY "Users can view their matches" ON matches
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

DROP POLICY IF EXISTS "Users can create matches" ON matches;
CREATE POLICY "Users can create matches" ON matches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their matches" ON matches;
CREATE POLICY "Users can update their matches" ON matches
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ACTIVITY FEED POLICIES
DROP POLICY IF EXISTS "Anyone can view public activities" ON activity_feed;
CREATE POLICY "Anyone can view public activities" ON activity_feed
FOR SELECT
USING (is_public = TRUE);

DROP POLICY IF EXISTS "Users can view their own activities" ON activity_feed;
CREATE POLICY "Users can view their own activities" ON activity_feed
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create activities" ON activity_feed;
CREATE POLICY "Users can create activities" ON activity_feed
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their activities" ON activity_feed;
CREATE POLICY "Users can manage their activities" ON activity_feed
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
CREATE POLICY "Users can update their received messages" ON messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- SUBSCRIPTIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" ON subscriptions
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscription" ON subscriptions;
CREATE POLICY "Users can create their own subscription" ON subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
CREATE POLICY "Users can update their own subscription" ON subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 15. CREATE STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-images', 'dog-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 16. STORAGE POLICIES
-- =====================================================

-- Profile images policies
DROP POLICY IF EXISTS "Users can upload their profile images" ON storage.objects;
CREATE POLICY "Users can upload their profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Profile images are publicly accessible" ON storage.objects;
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can update their profile images" ON storage.objects;
CREATE POLICY "Users can update their profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can delete their profile images" ON storage.objects;
CREATE POLICY "Users can delete their profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Dog images policies
DROP POLICY IF EXISTS "Users can upload dog images" ON storage.objects;
CREATE POLICY "Users can upload dog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dog-images');

DROP POLICY IF EXISTS "Dog images are publicly accessible" ON storage.objects;
CREATE POLICY "Dog images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dog-images');

DROP POLICY IF EXISTS "Users can update dog images" ON storage.objects;
CREATE POLICY "Users can update dog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dog-images');

DROP POLICY IF EXISTS "Users can delete dog images" ON storage.objects;
CREATE POLICY "Users can delete dog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dog-images');

-- =====================================================
-- 17. ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE walk_requests;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

