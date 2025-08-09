-- ===============================
-- AI Mind OS DATABASE SCHEMA
-- ===============================

-- USERS TABLE
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    full_name text,
    total_xp int default 0,
    current_level int default 1,
    current_streak int default 0,
    longest_streak int default 0,
    subscription_status text default 'free',
    stripe_customer_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- WAITLIST ENTRIES
create table if not exists waitlist_entries (
    id bigserial primary key,
    email text not null,
    referral_code text,
    source text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Referral tracking for growth analytics
CREATE TABLE referral_tracking (
  id SERIAL PRIMARY KEY,
  referrer_code TEXT,
  new_user_email TEXT,
  points_awarded INTEGER DEFAULT 0,
  event_type TEXT CHECK (event_type IN ('signup', 'conversion', 'milestone')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily AI lessons and briefings
CREATE TABLE daily_lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  insights TEXT[], -- Array of key insights
  category TEXT DEFAULT 'general',
  difficulty_level INTEGER DEFAULT 1,
  estimated_read_time INTEGER DEFAULT 5, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles and gamification
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  badge TEXT DEFAULT 'Member',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP transactions for tracking gains/losses
CREATE TABLE xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'daily_login', 'submit_intel', 'complete_lesson', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events for tracking user behavior
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX idx_analytics_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Insert sample daily lesson
INSERT INTO daily_lessons (title, content, insights, category) VALUES 
('Understanding AI Agent Architecture', 
 'Modern AI agents consist of three core components: perception (input processing), reasoning (decision making), and action (output execution). This architecture enables autonomous task completion and continuous learning from interactions.',
 ARRAY['Agents = Perception + Reasoning + Action', 'Autonomous operation reduces human oversight', 'Continuous learning improves performance over time'],
 'fundamentals');

-- Enable RLS (Row Level Security) for all tables
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to daily lessons
CREATE POLICY "Allow public read access to daily lessons" ON daily_lessons
  FOR SELECT USING (true);

-- Allow public read access to leaderboard (users table)
CREATE POLICY "Allow public read access to user leaderboard" ON users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own XP transactions
CREATE POLICY "Users can view own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow public insert for analytics events (anonymous tracking)
CREATE POLICY "Allow public insert for analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Allow admins to read all analytics events
CREATE POLICY "Allow admins to read analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.badge IN ('Founder', 'Admin')
    )
  );

-- Function to calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: sqrt(XP / 100) + 1
  RETURN FLOOR(SQRT(xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_level = calculate_level(NEW.total_xp);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update level when XP changes
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE OF total_xp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- DAILY LESSONS
create table if not exists daily_lessons (
    id bigserial primary key,
    title text not null,
    content text not null,
    summary text,
    lesson_date date not null,
    category text,
    xp_value int default 50,
    tags text[],
    is_premium boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ANALYTICS EVENTS
create table if not exists analytics_events (
    id bigserial primary key,
    event_type text not null,
    event_data jsonb,
    user_id uuid references users(id) on delete cascade,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
    id bigserial primary key,
    stripe_subscription_id text not null,
    stripe_customer_id text not null,
    status text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    plan_id text,
    plan_name text,
    amount int,
    currency text,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- INDEXES
create index if not exists idx_users_email on users(email);
create index if not exists idx_waitlist_email on waitlist_entries(email);
create index if not exists idx_referral_code on referral_tracking(referrer_code);
create index if not exists idx_lesson_date on daily_lessons(lesson_date);
create index if not exists idx_analytics_user on analytics_events(user_id);
create index if not exists idx_subscription_customer on subscriptions(stripe_customer_id);
