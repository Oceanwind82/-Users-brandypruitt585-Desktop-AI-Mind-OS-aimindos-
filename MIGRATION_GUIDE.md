# 🚀 AI Mind OS Database Migration - Step by Step

## Quick Migration (Recommended - 5 minutes)

### Option 1: One-Click Setup

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `taydgzzxdamgxciqldzq`

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste Complete Schema**
   ```sql
   -- Copy the ENTIRE contents of the file below:
   -- database-quick-setup.sql (343 lines)
   ```

4. **Execute**
   - Click "Run" button
   - Wait for completion message
   - ✅ Done! Your database is ready

### Option 2: Step-by-Step Migration

If you prefer to understand each step:

#### Step 1: Core Tables
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enhanced profiles table
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
```

#### Step 2: Missions Table
```sql
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
```

#### Step 3: Lesson Completions
```sql
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
```

#### Step 4: Referrals System
```sql
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL UNIQUE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  reward_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Step 5: Events & Analytics
```sql
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'learning', 'gamification', 'social', 'achievement')),
  meta JSONB NOT NULL DEFAULT '{}'::JSONB,
  xp_impact INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Step 6: Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS profiles_xp_idx ON public.profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON public.profiles(current_level DESC);
CREATE INDEX IF NOT EXISTS missions_user_idx ON public.missions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS events_user_idx ON public.events(user_id, created_at DESC);
```

#### Step 7: Row Level Security
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public leaderboard access" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can manage own missions" ON public.missions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own completions" ON public.lesson_completions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own events" ON public.events
FOR ALL USING (auth.uid() = user_id);
```

#### Step 8: Database Functions
```sql
-- Function to update user XP
CREATE OR REPLACE FUNCTION update_user_xp(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
    current_xp INTEGER;
    new_level INTEGER;
    new_total_xp INTEGER;
BEGIN
    SELECT total_xp INTO current_xp FROM public.profiles WHERE id = user_uuid;
    new_total_xp := COALESCE(current_xp, 0) + xp_amount;
    new_level := (new_total_xp / 100) + 1;
    
    UPDATE public.profiles 
    SET total_xp = new_total_xp,
        weekly_xp = weekly_xp + xp_amount,
        daily_xp = daily_xp + xp_amount,
        current_level = new_level,
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
    
    IF mission_record.id IS NULL THEN
        RAISE EXCEPTION 'Mission not found';
    END IF;
    
    xp_earned := GREATEST(mission_record.xp_reward * amazingness_rating / 5, 1);
    
    UPDATE public.missions 
    SET status = 'done', 
        completed_at = NOW()
    WHERE id = mission_uuid;
    
    PERFORM update_user_xp(mission_record.user_id, xp_earned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Your Migration

After running the migration:

1. **Check Tables Created**
   - Go to Supabase Dashboard → Table Editor
   - You should see: profiles, missions, lesson_completions, referrals, events

2. **Test Your App**
   ```bash
   npm run dev
   ```

3. **Visit Pages**
   - http://localhost:3000/dashboard - Should show gamification
   - http://localhost:3000/leaderboard - Should load without errors

## Troubleshooting

### If tables don't appear:
- Refresh the Supabase Dashboard
- Check SQL Editor for error messages
- Ensure you're using the correct project

### If you get permission errors:
- Verify you're logged into the right Supabase account
- Check your project URL matches: `taydgzzxdamgxciqldzq`

### If functions fail:
- Run the function SQL separately
- Check for syntax errors in the query

## What You'll Have After Migration

✅ **Gamified User Profiles** - XP, levels, streaks  
✅ **Mission System** - Daily AI learning challenges  
✅ **Achievement Tracking** - Progress and rewards  
✅ **Leaderboards** - Global competition  
✅ **Referral System** - User growth mechanics  
✅ **Analytics Events** - Detailed usage tracking  

**Ready to transform your AI learning platform! 🎮🧠**
