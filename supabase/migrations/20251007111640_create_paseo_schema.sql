-- Paseo Amigo España - Database Schema
-- PostgreSQL/Supabase compatible schema
--
-- Creates tables for: users, dogs, walker_profiles, walk_requests,
-- chat_messages, reviews, subscriptions, payments, walk tracking, notifications
--
-- Includes Row Level Security policies for data protection

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS geo_points CASCADE;
DROP TABLE IF EXISTS walk_sessions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS walk_requests CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS walker_profiles CASCADE;
DROP TABLE IF EXISTS dogs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_walker_rating() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    user_type VARCHAR(20) CHECK (user_type IN ('owner', 'walker')) NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dogs table
CREATE TABLE IF NOT EXISTS dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age VARCHAR(20) NOT NULL,
    breed VARCHAR(100),
    notes TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Walker profiles table
CREATE TABLE IF NOT EXISTS walker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT NOT NULL,
    experience TEXT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    availability TEXT[] NOT NULL DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_walks INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Walk requests table
CREATE TABLE IF NOT EXISTS walk_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    walker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    service_type VARCHAR(20) CHECK (service_type IN ('walk', 'care')) NOT NULL,
    duration INTEGER NOT NULL,
    walk_date DATE NOT NULL,
    walk_time TIME NOT NULL,
    location TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walk_request_id UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    interval VARCHAR(20) CHECK (interval IN ('month', '6months', 'year')) NOT NULL,
    features TEXT[] NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    card_brand VARCHAR(50) NOT NULL,
    card_last4 VARCHAR(4) NOT NULL,
    card_exp_month INTEGER NOT NULL,
    card_exp_year INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Walk sessions table
CREATE TABLE IF NOT EXISTS walk_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walk_request_id UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    distance DECIMAL(8,2),
    status VARCHAR(20) CHECK (status IN ('active', 'completed')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geo points table
CREATE TABLE IF NOT EXISTS geo_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES walk_sessions(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_user_id ON walker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_walker_profiles_verified ON walker_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_walk_requests_owner_id ON walk_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_walk_requests_walker_id ON walk_requests(walker_id);
CREATE INDEX IF NOT EXISTS idx_walk_requests_status ON walk_requests(status);
CREATE INDEX IF NOT EXISTS idx_walk_requests_date ON walk_requests(walk_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_request_id ON chat_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_walk_sessions_walk_request_id ON walk_sessions(walk_request_id);
CREATE INDEX IF NOT EXISTS idx_geo_points_session_id ON geo_points(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_walker_profiles_updated_at BEFORE UPDATE ON walker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_walk_requests_updated_at BEFORE UPDATE ON walk_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Enable
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE walker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own dogs" ON dogs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own dogs" ON dogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own dogs" ON dogs FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view verified walker profiles" ON walker_profiles FOR SELECT USING (verified = true);
CREATE POLICY "Users can view their own walker profile" ON walker_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own walker profile" ON walker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own walker profile" ON walker_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own walk requests" ON walk_requests FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = walker_id);
CREATE POLICY "Users can insert walk requests" ON walk_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own walk requests" ON walk_requests FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = walker_id);

CREATE POLICY "Users can view messages for their requests" ON chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM walk_requests WHERE walk_requests.id = chat_messages.request_id AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid()))
);
CREATE POLICY "Users can insert messages for their requests" ON chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM walk_requests WHERE walk_requests.id = chat_messages.request_id AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid()))
);

CREATE POLICY "Users can view reviews for their requests" ON reviews FOR SELECT USING (
    EXISTS (SELECT 1 FROM walk_requests WHERE walk_requests.id = reviews.walk_request_id AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid()))
);
CREATE POLICY "Users can insert reviews for their requests" ON reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM walk_requests WHERE walk_requests.id = reviews.walk_request_id AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid()))
);

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment methods" ON payment_methods FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own walk sessions" ON walk_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM walk_requests WHERE walk_requests.id = walk_sessions.walk_request_id AND (walk_requests.owner_id = auth.uid() OR walk_requests.walker_id = auth.uid()))
);

CREATE POLICY "Users can view geo points for their sessions" ON geo_points FOR SELECT USING (
    EXISTS (SELECT 1 FROM walk_sessions ws JOIN walk_requests wr ON wr.id = ws.walk_request_id WHERE ws.id = geo_points.session_id AND (wr.owner_id = auth.uid() OR wr.walker_id = auth.uid()))
);

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to update walker rating
CREATE OR REPLACE FUNCTION update_walker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE walker_profiles 
    SET rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE reviewed_id = walker_profiles.user_id),
    total_walks = (SELECT COUNT(*) FROM walk_requests WHERE walker_id = walker_profiles.user_id AND status = 'completed')
    WHERE user_id = NEW.reviewed_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_walker_rating_trigger AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_walker_rating();