-- Fix Profile Update RLS Policy and Availability Table Issues
-- Run this in Supabase SQL Editor

-- 1. Fix Users Table RLS Policy for Updates
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Ensure hourly_rate column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'hourly_rate'
    ) THEN
        ALTER TABLE users ADD COLUMN hourly_rate INTEGER DEFAULT 15;
    END IF;
END $$;

-- 3. Fix Availability Table - Drop and Recreate with proper structure
DROP TABLE IF EXISTS availability CASCADE;

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date, start_time)
);

-- 4. Enable RLS on availability table
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for availability
CREATE POLICY "Users can view own availability"
ON availability
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own availability"
ON availability
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own availability"
ON availability
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own availability"
ON availability
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_availability_user_date ON availability(user_id, date);

-- 7. Grant necessary permissions
GRANT ALL ON availability TO authenticated;
GRANT ALL ON availability TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Profile and availability fixes applied successfully!';
    RAISE NOTICE '1. Users table RLS policy updated';
    RAISE NOTICE '2. Hourly rate column ensured';
    RAISE NOTICE '3. Availability table recreated with proper structure';
    RAISE NOTICE '4. RLS policies created for availability';
END $$;
