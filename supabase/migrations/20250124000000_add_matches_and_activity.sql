-- Add Matches and Activity Feed Tables
-- Created: 2025-01-24

-- =====================================================
-- 1. CREATE MATCHES TABLE
-- =====================================================

-- Table for tracking user matches (likes, passes, mutual matches)
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_user_id ON matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_mutual ON matches(is_mutual) WHERE is_mutual = true;

-- Trigger to check for mutual matches
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process likes, not passes
    IF NEW.match_type IN ('like', 'superlike') THEN
        -- Check if the other user has also liked this user
        UPDATE matches
        SET is_mutual = TRUE, matched_at = NOW()
        WHERE user_id = NEW.matched_user_id 
        AND matched_user_id = NEW.user_id 
        AND match_type IN ('like', 'superlike')
        AND is_mutual = FALSE;

        -- Check if this creates a mutual match
        IF FOUND THEN
            NEW.is_mutual := TRUE;
            NEW.matched_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS check_mutual_match_trigger ON matches;
CREATE TRIGGER check_mutual_match_trigger
    BEFORE INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION check_mutual_match();

-- =====================================================
-- 2. CREATE ACTIVITY FEED TABLE
-- =====================================================

-- Table for storing user activities for the activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('walk_completed', 'new_match', 'review_received', 'profile_updated', 'new_dog')),
    activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed(is_public) WHERE is_public = TRUE;

-- =====================================================
-- 3. CREATE STORAGE BUCKET FOR PROFILE IMAGES
-- =====================================================

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. RLS POLICIES FOR MATCHES
-- =====================================================

-- Enable RLS on matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches where they are involved
CREATE POLICY "Users can view their matches" ON matches
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Users can create matches
CREATE POLICY "Users can create matches" ON matches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own matches
CREATE POLICY "Users can update their matches" ON matches
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. RLS POLICIES FOR ACTIVITY FEED
-- =====================================================

-- Enable RLS on activity_feed table
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view public activities
CREATE POLICY "Anyone can view public activities" ON activity_feed
FOR SELECT
USING (is_public = TRUE);

-- Users can view all their own activities
CREATE POLICY "Users can view their own activities" ON activity_feed
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own activities
CREATE POLICY "Users can create activities" ON activity_feed
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update their activities" ON activity_feed
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete their activities" ON activity_feed
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. STORAGE POLICIES FOR PROFILE IMAGES
-- =====================================================

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own profile images
CREATE POLICY "Users can update their profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete their profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- 7. UPDATED TIMESTAMP TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on new tables
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

-- =====================================================
-- 8. REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

