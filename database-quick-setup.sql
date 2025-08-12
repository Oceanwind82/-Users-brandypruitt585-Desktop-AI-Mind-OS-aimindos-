-- AI Mind OS - Quick Database Setup
-- Execute this in Supabase SQL Editor for instant gamified database

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Enhanced Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  path TEXT CHECK (path IN ('Builder','Automator','Deal-Maker')),
  current_level INT NOT NULL DEFAULT 1,
  total_xp INT NOT NULL DEFAULT 0,
  weekly_xp INT NOT NULL DEFAULT 0,
  daily_xp INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  avatar_url TEXT,
  learning_style TEXT DEFAULT 'visual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Missions Table (Gamified Lessons)
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
  xp_reward INT DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','locked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Lesson Completions with Gamification
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  mission_id UUID REFERENCES public.missions(id),
  amazingness_score INT CHECK (amazingness_score BETWEEN 1 AND 10),
  xp_earned INT DEFAULT 10,
  completion_time INTERVAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Referrals System
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL UNIQUE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  reward_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Events for Analytics & Gamification
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'learning', 'gamification', 'social', 'achievement')),
  meta JSONB NOT NULL DEFAULT '{}'::JSONB,
  xp_impact INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_xp_idx ON public.profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON public.profiles(current_level DESC);
CREATE INDEX IF NOT EXISTS missions_user_idx ON public.missions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS events_user_idx ON public.events(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public leaderboard access" ON public.profiles
FOR SELECT USING (true);

-- RLS Policies for Missions
CREATE POLICY "Users can view own missions" ON public.missions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own missions" ON public.missions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON public.missions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Lesson Completions
CREATE POLICY "Users can manage own completions" ON public.lesson_completions
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Referrals
CREATE POLICY "Users can view related referrals" ON public.referrals
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON public.referrals
FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for Events
CREATE POLICY "Users can manage own events" ON public.events
FOR ALL USING (auth.uid() = user_id);

-- Database Functions

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_level INTEGER;
    new_total_xp INTEGER;
BEGIN
    -- Get current XP and calculate new values
    SELECT total_xp INTO current_xp FROM public.profiles WHERE id = user_uuid;
    new_total_xp := COALESCE(current_xp, 0) + xp_amount;
    new_level := (new_total_xp / 100) + 1;
    
    -- Update user profile
    UPDATE public.profiles 
    SET total_xp = new_total_xp,
        weekly_xp = weekly_xp + xp_amount,
        daily_xp = daily_xp + xp_amount,
        current_level = new_level,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log XP gain event
    INSERT INTO public.events (user_id, type, category, meta, xp_impact, created_at)
    VALUES (user_uuid, 'xp_earned', 'gamification', 
            jsonb_build_object('xp_amount', xp_amount, 'new_total', new_total_xp), 
            xp_amount, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a mission
CREATE OR REPLACE FUNCTION complete_mission(mission_uuid UUID, amazingness_rating INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
    mission_record RECORD;
    xp_earned INTEGER;
BEGIN
    -- Get mission details
    SELECT * INTO mission_record FROM public.missions WHERE id = mission_uuid;
    
    IF mission_record.id IS NULL THEN
        RAISE EXCEPTION 'Mission not found';
    END IF;
    
    -- Calculate XP based on difficulty and amazingness
    xp_earned := GREATEST(mission_record.xp_reward * amazingness_rating / 5, 1);
    
    -- Update mission status
    UPDATE public.missions 
    SET status = 'done', 
        completed_at = NOW()
    WHERE id = mission_uuid;
    
    -- Award XP to user
    PERFORM update_user_xp(mission_record.user_id, xp_earned);
    
    -- Log mission completion
    INSERT INTO public.events (user_id, type, category, meta, xp_impact, created_at)
    VALUES (mission_record.user_id, 'mission_completed', 'learning', 
            jsonb_build_object('mission_id', mission_uuid, 'amazingness_score', amazingness_rating), 
            xp_earned, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    ref_code TEXT;
    name_part TEXT;
BEGIN
    -- Get user's display name for code generation
    SELECT COALESCE(display_name, 'User') INTO name_part FROM public.profiles WHERE id = user_uuid;
    
    -- Generate unique referral code
    ref_code := UPPER(LEFT(name_part, 3)) || '-' || UPPER(LEFT(user_uuid::TEXT, 6));
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.referrals WHERE ref_code = ref_code) LOOP
        ref_code := ref_code || '-' || FLOOR(RANDOM() * 100)::TEXT;
    END LOOP;
    
    RETURN ref_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to profiles
DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Insert sample achievements for demo
INSERT INTO public.events (user_id, type, category, meta, created_at) VALUES
(NULL, 'sample_achievement', 'achievement', '{"name": "First Steps", "description": "Complete your first lesson", "badge": "🎯", "xp": 25}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Streak Master", "description": "Maintain a 7-day learning streak", "badge": "🔥", "xp": 100}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Mission Possible", "description": "Complete 10 missions", "badge": "🚀", "xp": 150}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Knowledge Seeker", "description": "Explore 5 different AI topics", "badge": "🧠", "xp": 75}', NOW()),
(NULL, 'sample_achievement', 'achievement', '{"name": "Perfect Score", "description": "Get 10/10 amazingness on a lesson", "badge": "⭐", "xp": 50}', NOW())
ON CONFLICT DO NOTHING;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '🎉 AI Mind OS Database Setup Complete!';
    RAISE NOTICE '✅ Tables created: profiles, missions, lesson_completions, referrals, events';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Database functions ready';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '🚀 Ready for gamified learning!';
END $$;
