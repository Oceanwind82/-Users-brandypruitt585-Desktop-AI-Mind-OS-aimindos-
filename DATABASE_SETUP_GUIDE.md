# 🗄️ AI Mind OS Database Setup Guide

## Quick Setup (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to **SQL Editor**

2. **Execute Schema**
   ```sql
   -- Copy and paste the entire contents of schema-gamified.sql
   -- Then click "Run" to execute
   ```

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see: profiles, missions, lesson_completions, referrals, events

### Option 2: Command Line Setup

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Connect to Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run Migration**
   ```bash
   supabase db push
   ```

## Manual Schema Migration

If automated setup fails, copy these SQL commands to Supabase SQL Editor:

### 1. Core Tables Setup
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enhanced profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  path TEXT CHECK (path IN ('Builder','Automator','Deal-Maker')),
  score INT CHECK (score BETWEEN 0 AND 100),
  current_level INT NOT NULL DEFAULT 1,
  total_xp INT NOT NULL DEFAULT 0,
  weekly_xp INT NOT NULL DEFAULT 0,
  daily_xp INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  learning_style TEXT DEFAULT 'visual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Missions table (replaces lessons)
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

-- Lesson completions with gamification
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  amazingness_score INT CHECK (amazingness_score BETWEEN 1 AND 10),
  xp_earned INT DEFAULT 10,
  completion_time INTERVAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrals system
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL UNIQUE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events for analytics and gamification
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  meta JSONB NOT NULL DEFAULT '{}'::JSONB,
  xp_impact INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view leaderboard data" ON public.profiles
FOR SELECT USING (true);

-- Missions policies
CREATE POLICY "Users can manage own missions" ON public.missions
FOR ALL USING (auth.uid() = user_id);

-- Lesson completions policies
CREATE POLICY "Users can manage own completions" ON public.lesson_completions
FOR ALL USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can manage own events" ON public.events
FOR ALL USING (auth.uid() = user_id);
```

### 3. Database Functions
```sql
-- Function to update user XP
CREATE OR REPLACE FUNCTION update_user_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET total_xp = total_xp + xp_amount,
        weekly_xp = weekly_xp + xp_amount,
        daily_xp = daily_xp + xp_amount,
        current_level = (total_xp + xp_amount) / 100 + 1,
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete mission
CREATE OR REPLACE FUNCTION complete_mission(mission_uuid UUID, amazingness_rating INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
    mission_record RECORD;
    xp_earned INTEGER;
BEGIN
    SELECT * INTO mission_record FROM public.missions WHERE id = mission_uuid;
    xp_earned := mission_record.xp_reward * amazingness_rating / 5;
    
    UPDATE public.missions 
    SET status = 'done', 
        completed_at = NOW()
    WHERE id = mission_uuid;
    
    PERFORM update_user_xp(mission_record.user_id, xp_earned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Environment Configuration

Ensure your `.env.local` file has:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Verification Steps

1. **Check Tables Created**
   - Go to Supabase Dashboard > Table Editor
   - Verify all tables exist: profiles, missions, lesson_completions, referrals, events

2. **Test API Connection**
   ```bash
   cd aimindos
   npm run dev
   ```

3. **Check Leaderboard**
   - Visit: http://localhost:3000/leaderboard
   - Should load without errors

## Troubleshooting

### Common Issues:

1. **"Table doesn't exist" errors**
   - Re-run the schema SQL in Supabase Dashboard
   - Check if tables were created successfully

2. **RLS policy errors**
   - Disable RLS temporarily for testing:
   ```sql
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   ```

3. **Connection issues**
   - Verify environment variables in `.env.local`
   - Check Supabase project settings

4. **Permission errors**
   - Ensure you're using the SERVICE_ROLE_KEY for admin operations
   - Check RLS policies are correctly configured

## Next Steps

After database setup:
1. ✅ Start development server: `npm run dev`
2. ✅ Test gamification features
3. ✅ Configure authentication
4. ✅ Deploy to production
