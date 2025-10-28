-- ============================================
-- CLEAN MIGRATION SCRIPT
-- This script safely handles existing tables and policies
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- 1. ENHANCED PROFILE FIELDS
-- ============================================

-- Add new columns to users table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hourly_rate') THEN
    ALTER TABLE users ADD COLUMN hourly_rate NUMERIC DEFAULT 15;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add new columns to dogs table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'temperament') THEN
    ALTER TABLE dogs ADD COLUMN temperament TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'special_needs') THEN
    ALTER TABLE dogs ADD COLUMN special_needs TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'energy_level') THEN
    ALTER TABLE dogs ADD COLUMN energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- ============================================
-- 2. AVAILABILITY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Add EXCLUDE constraint only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'availability_sitter_id_tstzrange_excl'
  ) THEN
    ALTER TABLE availability ADD CONSTRAINT availability_sitter_id_tstzrange_excl 
    EXCLUDE USING gist (
      sitter_id WITH =,
      tstzrange(start_time, end_time) WITH &&
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_availability_sitter_time ON availability(sitter_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_availability_status ON availability(status);

-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================

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
  commission_fee NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time),
  CONSTRAINT valid_commission CHECK (commission_fee = total_price * 0.20)
);

CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_sitter ON bookings(sitter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings(start_time, end_time);

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
    ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- Create conditional index only if is_read column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
    DROP INDEX IF EXISTS idx_notifications_unread;
    CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
  END IF;
END $$;

-- ============================================
-- 5. HELPER FUNCTIONS
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
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_commission_fee NUMERIC;
BEGIN
  v_commission_fee := p_total_price * 0.20;
  
  INSERT INTO bookings (
    owner_id, sitter_id, dog_id, start_time, end_time,
    service_type, location, notes, total_price, commission_fee, status
  ) VALUES (
    p_owner_id, p_sitter_id, p_dog_id, p_start_time, p_end_time,
    p_service_type, p_location, p_notes, p_total_price, v_commission_fee, 'requested'
  )
  RETURNING id INTO v_booking_id;
  
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (p_sitter_id, 'booking_request', 'New Booking Request', 'You have a new booking request', v_booking_id);
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update booking status
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_booking RECORD;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  UPDATE bookings SET status = p_new_status, updated_at = NOW() WHERE id = p_booking_id;
  
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (v_booking.owner_id, 'booking_status_update', 'Booking Status Updated', 
          'Your booking status has been updated to ' || p_new_status, p_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add availability slot
CREATE OR REPLACE FUNCTION add_availability_slot(
  p_sitter_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  INSERT INTO availability (sitter_id, start_time, end_time, status)
  VALUES (p_sitter_id, p_start_time, p_end_time, 'available')
  RETURNING id INTO v_slot_id;
  
  RETURN v_slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Tables created: availability, bookings, notifications';
  RAISE NOTICE 'Functions created: create_booking, update_booking_status, add_availability_slot';
  RAISE NOTICE 'Next step: Run the RLS policies script from QUICK_SETUP_STEPS.md';
END $$;
