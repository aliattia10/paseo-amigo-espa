-- Sprint: Enhanced Profiles, Availability System, and Booking Integration
-- This migration adds new fields and tables for the enhanced user experience

-- ============================================
-- 0. ENABLE REQUIRED EXTENSIONS
-- ============================================

-- Enable btree_gist extension for EXCLUDE constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- 1. ENHANCED PROFILE FIELDS
-- ============================================

-- Add new columns to users table for enhanced profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 15;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add new columns to dogs table for detailed dog profiles
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS temperament TEXT[] DEFAULT '{}';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS special_needs TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high'));

-- ============================================
-- 2. AVAILABILITY SYSTEM
-- ============================================

-- Create availability table for sitter time slots
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  
  -- Prevent overlapping availability slots for the same sitter
  EXCLUDE USING gist (
    sitter_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_availability_sitter_time ON availability(sitter_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- ============================================
-- 3. BOOKING SYSTEM
-- ============================================

-- Create bookings table (replacing walk_requests with more comprehensive structure)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'walk' CHECK (service_type IN ('walk', 'care', 'boarding')),
  location TEXT,
  notes TEXT,
  total_price NUMERIC NOT NULL,
  commission_fee NUMERIC NOT NULL, -- 20% platform fee
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_booking_time CHECK (end_time > start_time),
  
  -- Ensure commission is calculated correctly (20%)
  CONSTRAINT valid_commission CHECK (commission_fee = total_price * 0.20)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter ON bookings(sitter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);

-- ============================================
-- 4. NOTIFICATIONS TABLE (if not exists)
-- ============================================

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Can reference bookings, reviews, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- Create conditional index only if is_read column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
  END IF;
END $$;

-- ============================================
-- 5. STORED PROCEDURES / RPC FUNCTIONS
-- ============================================

-- Function to create a booking
CREATE OR REPLACE FUNCTION create_booking(
  p_owner_id UUID,
  p_sitter_id UUID,
  p_dog_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_service_type TEXT,
  p_location TEXT,
  p_notes TEXT,
  p_total_price NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_commission_fee NUMERIC;
BEGIN
  -- Calculate commission (20%)
  v_commission_fee := p_total_price * 0.20;
  
  -- Insert booking
  INSERT INTO bookings (
    owner_id,
    sitter_id,
    dog_id,
    start_time,
    end_time,
    service_type,
    location,
    notes,
    total_price,
    commission_fee,
    status
  ) VALUES (
    p_owner_id,
    p_sitter_id,
    p_dog_id,
    p_start_time,
    p_end_time,
    p_service_type,
    p_location,
    p_notes,
    p_total_price,
    v_commission_fee,
    'requested'
  )
  RETURNING id INTO v_booking_id;
  
  -- Create notification for sitter
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_id
  ) VALUES (
    p_sitter_id,
    'booking_request',
    'New Booking Request',
    'You have a new booking request',
    v_booking_id
  );
  
  RETURN v_booking_id;
END;
$$;

-- Function to update booking status
DROP FUNCTION IF EXISTS update_booking_status(UUID, TEXT);
DROP FUNCTION IF EXISTS update_booking_status(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT,
  p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_availability_id UUID;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Update booking status
  UPDATE bookings
  SET 
    status = p_new_status,
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- If confirmed, update availability to booked
  IF p_new_status = 'confirmed' THEN
    -- Find overlapping availability slot and mark as booked
    UPDATE availability
    SET status = 'booked', updated_at = NOW()
    WHERE sitter_id = v_booking.sitter_id
      AND start_time <= v_booking.start_time
      AND end_time >= v_booking.end_time
      AND status = 'available';
    
    -- Create notification for owner
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id
    ) VALUES (
      v_booking.owner_id,
      'booking_confirmed',
      'Booking Confirmed!',
      'Your booking has been confirmed',
      p_booking_id
    );
  END IF;
  
  -- If cancelled, free up availability
  IF p_new_status = 'cancelled' THEN
    UPDATE availability
    SET status = 'available', updated_at = NOW()
    WHERE sitter_id = v_booking.sitter_id
      AND start_time <= v_booking.start_time
      AND end_time >= v_booking.end_time
      AND status = 'booked';
    
    -- Notify the other party
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_id
    ) VALUES (
      CASE 
        WHEN v_booking.status = 'requested' THEN v_booking.owner_id
        ELSE v_booking.sitter_id
      END,
      'booking_cancelled',
      'Booking Cancelled',
      'A booking has been cancelled',
      p_booking_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to add availability slot
CREATE OR REPLACE FUNCTION add_availability_slot(
  p_sitter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_availability_id UUID;
BEGIN
  INSERT INTO availability (
    sitter_id,
    start_time,
    end_time,
    status
  ) VALUES (
    p_sitter_id,
    p_start_time,
    p_end_time,
    'available'
  )
  RETURNING id INTO v_availability_id;
  
  RETURN v_availability_id;
END;
$$;

-- Function to get sitter availability
CREATE OR REPLACE FUNCTION get_sitter_availability(
  p_sitter_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.start_time,
    a.end_time,
    a.status
  FROM availability a
  WHERE a.sitter_id = p_sitter_id
    AND a.start_time >= p_start_date
    AND a.end_time <= p_end_date
  ORDER BY a.start_time;
END;
$$;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Availability policies
DROP POLICY IF EXISTS "Users can view all availability" ON availability;
CREATE POLICY "Users can view all availability"
  ON availability FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Sitters can manage their own availability" ON availability;
CREATE POLICY "Sitters can manage their own availability"
  ON availability FOR ALL
  USING (auth.uid() = sitter_id);

-- Bookings policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

DROP POLICY IF EXISTS "Owners can create bookings" ON bookings;
CREATE POLICY "Owners can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and sitters can update their bookings" ON bookings;
CREATE POLICY "Owners and sitters can update their bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = sitter_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Add sample availability slots (uncomment to use)
-- INSERT INTO availability (sitter_id, start_time, end_time, status)
-- SELECT 
--   id,
--   NOW() + interval '1 day' + (n || ' hours')::interval,
--   NOW() + interval '1 day' + ((n + 2) || ' hours')::interval,
--   'available'
-- FROM users, generate_series(9, 17, 3) as n
-- WHERE user_type = 'walker'
-- LIMIT 20;

COMMENT ON TABLE availability IS 'Stores sitter availability time slots';
COMMENT ON TABLE bookings IS 'Stores all booking requests and confirmed bookings';
COMMENT ON TABLE notifications IS 'Stores user notifications for various events';
