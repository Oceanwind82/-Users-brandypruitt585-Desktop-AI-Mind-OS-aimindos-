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

-- Allow public read access to daily lessons
CREATE POLICY "Allow public read access to daily lessons" ON daily_lessons
  FOR SELECT USING (true);

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
