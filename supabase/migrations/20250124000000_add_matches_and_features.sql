-- Migration: Add matches table and enhanced features
-- Created: 2025-01-24

-- Create matches table for Tinder-style matching
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    matched_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('like', 'superlike', 'pass')),
    is_mutual BOOLEAN DEFAULT FALSE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, matched_user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_matches_user_id ON public.matches(user_id);
CREATE INDEX idx_matches_matched_user_id ON public.matches(matched_user_id);
CREATE INDEX idx_matches_mutual ON public.matches(is_mutual) WHERE is_mutual = TRUE;

-- Create function to check and create mutual matches
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the other user has also liked this user
    IF NEW.match_type = 'like' OR NEW.match_type = 'superlike' THEN
        UPDATE public.matches
        SET is_mutual = TRUE, matched_at = NOW()
        WHERE (user_id = NEW.matched_user_id AND matched_user_id = NEW.user_id 
              AND (match_type = 'like' OR match_type = 'superlike'))
           OR (user_id = NEW.user_id AND matched_user_id = NEW.matched_user_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic mutual match detection
DROP TRIGGER IF NOT EXISTS trigger_check_mutual_match ON public.matches;
CREATE TRIGGER trigger_check_mutual_match
    AFTER INSERT OR UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION check_mutual_match();

-- Add profile_image column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE public.users ADD COLUMN profile_image TEXT;
    END IF;
END $$;

-- Add bio column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE public.users ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Create activity feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for activity feed
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public) WHERE is_public = TRUE;

-- Enable Row Level Security on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create their own matches"
    ON public.matches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
    ON public.matches FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Row Level Security on activity_feed table
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity feed
CREATE POLICY "Users can view public activity feed"
    ON public.activity_feed FOR SELECT
    USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
    ON public.activity_feed FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
    ON public.activity_feed FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity"
    ON public.activity_feed FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get nearby walkers
CREATE OR REPLACE FUNCTION get_nearby_walkers(
    user_city TEXT,
    user_postal_code TEXT DEFAULT NULL,
    max_distance_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    city TEXT,
    postal_code TEXT,
    profile_image TEXT,
    bio TEXT,
    hourly_rate DECIMAL,
    rating DECIMAL,
    total_walks INTEGER,
    verified BOOLEAN,
    tags TEXT[],
    distance_estimate INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.city,
        u.postal_code,
        u.profile_image,
        u.bio,
        wp.hourly_rate,
        wp.rating,
        wp.total_walks,
        wp.verified,
        wp.tags,
        -- Simple distance estimate based on city match and postal code
        CASE 
            WHEN u.city = user_city AND u.postal_code = user_postal_code THEN 1
            WHEN u.city = user_city THEN 5
            ELSE 25
        END as distance_estimate
    FROM public.users u
    INNER JOIN public.walker_profiles wp ON u.id = wp.user_id
    WHERE u.user_type = 'walker'
        AND u.city = user_city
    ORDER BY distance_estimate ASC, wp.rating DESC, wp.total_walks DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get match count for user
CREATE OR REPLACE FUNCTION get_match_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    match_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO match_count
    FROM public.matches
    WHERE (user_id = user_uuid OR matched_user_id = user_uuid)
        AND is_mutual = TRUE;
    
    RETURN match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.matches IS 'Stores user matches (Tinder-style likes and matches)';
COMMENT ON TABLE public.activity_feed IS 'Stores activity feed items for users';
COMMENT ON FUNCTION get_nearby_walkers IS 'Returns nearby dog walkers sorted by proximity and rating';
COMMENT ON FUNCTION get_match_count IS 'Returns the number of mutual matches for a user';

