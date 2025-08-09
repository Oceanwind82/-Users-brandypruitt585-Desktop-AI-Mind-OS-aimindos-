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

-- REFERRAL TRACKING
create table if not exists referral_tracking (
    id bigserial primary key,
    referrer_code text not null,
    new_user_email text not null,
    points_awarded int default 0,
    event_type text,
    status text default 'confirmed',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

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
