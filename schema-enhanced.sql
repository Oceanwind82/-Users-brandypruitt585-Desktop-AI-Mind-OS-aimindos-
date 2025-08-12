-- AI Mind OS - Enhanced Schema Migration
-- This extends the existing schema with gamification features

-- First, let's preserve existing data by renaming the current table
-- (only if it exists)
-- ALTER TABLE IF EXISTS daily_lessons RENAME TO legacy_daily_lessons;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- 1. ENHANCED PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL, -- Keep compatibility with existing system
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For Supabase auth
  display_name TEXT,
  email TEXT,
  path TEXT CHECK (path IN ('Builder','Automator','Deal-Maker')),
  score INT CHECK (score BETWEEN 0 AND 100),
  xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_mission_date DATE,
  learning_style TEXT DEFAULT 'visual' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  interests TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. ENHANCED LESSON COMPLETIONS (replaces daily_lessons)
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  mission_id UUID, -- Link to daily missions
  
  -- Original fields (preserved)
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Enhanced amazingness tracking
  amazingness_score INTEGER DEFAULT 0, -- 0-150 scale
  quality_tier TEXT, -- "🌟 ABSOLUTELY AMAZING", "⭐ AMAZING", etc.
  satisfaction_rating INTEGER, -- 1-5 scale
  difficulty_rating INTEGER, -- 1-10 scale  
  engagement_score INTEGER, -- 1-10 scale
  feedback_text TEXT,
  lesson_quality_metrics JSONB, -- structured feedback data
  
  -- Gamification additions
  xp_earned INTEGER DEFAULT 10,
  streak_bonus BOOLEAN DEFAULT FALSE,
  perfect_score_bonus BOOLEAN DEFAULT FALSE,
  speed_bonus BOOLEAN DEFAULT FALSE,
  achievement_unlocked TEXT[], -- Achievement IDs unlocked by this completion
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. DAILY MISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
  xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','locked','skipped')),
  completion_time INTERVAL,
  amazingness_score INTEGER CHECK (amazingness_score BETWEEN 1 AND 10),
  content JSONB DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, date)
);

-- =============================================
-- 4. ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'first_lesson', 'streak_3', 'streak_7', 'streak_30', 
    'topic_master', 'ai_expert', 'whiteboard_artist', 
    'referral_champion', 'perfect_score', 'speed_learner',
    'amazing_score_100', 'amazing_score_150', 'lesson_explorer',
    'consistency_king', 'feedback_master'
  )),
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  xp_bonus INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- =============================================
-- 5. REFERRALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code TEXT NOT NULL UNIQUE,
  referrer_user_id TEXT NOT NULL, -- Compatible with existing user_id format
  referee_user_id TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  credit_cents INTEGER NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
  reward_type TEXT DEFAULT 'subscription_discount' CHECK (reward_type IN ('subscription_discount', 'xp_bonus', 'exclusive_content')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. EVENTS TABLE (Enhanced Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'learning', 'gamification', 'social', 'achievement', 'whiteboard')),
  properties JSONB NOT NULL DEFAULT '{}',
  xp_impact INTEGER DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 7. AI GENERATED CONTENT (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'assessment', 'trending', 'newsletter', 'course_outline', 'whiteboard_note')),
  topic TEXT,
  audience TEXT,
  format TEXT,
  content_data JSONB NOT NULL,
  personalization_data JSONB,
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  usage_count INTEGER DEFAULT 0,
  amazingness_contribution INTEGER DEFAULT 0, -- How much this content contributed to lesson amazingness
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 8. DAILY BRIEFS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  storage_path TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  topics TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'intermediate',
  estimated_read_time INTEGER DEFAULT 5,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User-based indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_date ON missions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON events(user_id, created_at DESC);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_topic ON missions(topic);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(ref_code);

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_lesson_completions ON lesson_completions;
CREATE TRIGGER set_updated_at_lesson_completions 
  BEFORE UPDATE ON lesson_completions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================
-- CORE FUNCTIONS
-- =============================================

-- 1. Ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile(p_user_id TEXT)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO profiles(user_id, display_name)
    VALUES (p_user_id, 'AI Learner')
    RETURNING id INTO v_profile_id;
  END IF;
  
  RETURN v_profile_id;
END; $$;

-- 2. Complete a lesson with full gamification
CREATE OR REPLACE FUNCTION complete_lesson_gamified(
  p_user_id TEXT,
  p_lesson_id TEXT,
  p_amazingness_score INTEGER,
  p_time_spent INTEGER DEFAULT 0,
  p_satisfaction_rating INTEGER DEFAULT NULL,
  p_engagement_score INTEGER DEFAULT NULL,
  p_difficulty_rating INTEGER DEFAULT NULL,
  p_feedback_text TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_profile_id UUID;
  v_completion_id UUID;
  v_current_streak INTEGER;
  v_xp_earned INTEGER := 10;
  v_bonus_xp INTEGER := 0;
  v_achievements TEXT[] := '{}';
  v_quality_tier TEXT;
  v_mission_id UUID;
BEGIN
  -- Ensure profile exists
  v_profile_id := ensure_user_profile(p_user_id);
  
  -- Determine quality tier
  v_quality_tier := CASE 
    WHEN p_amazingness_score >= 150 THEN '🌟 ABSOLUTELY AMAZING'
    WHEN p_amazingness_score >= 130 THEN '⭐ AMAZING'
    WHEN p_amazingness_score >= 100 THEN '✨ VERY GOOD'
    WHEN p_amazingness_score >= 70 THEN '👍 GOOD'
    ELSE '📚 COMPLETED'
  END;
  
  -- Calculate bonus XP
  IF p_amazingness_score >= 100 THEN v_bonus_xp := v_bonus_xp + 5; END IF;
  IF p_amazingness_score >= 130 THEN v_bonus_xp := v_bonus_xp + 10; END IF;
  IF p_amazingness_score >= 150 THEN v_bonus_xp := v_bonus_xp + 20; END IF;
  IF p_time_spent > 0 AND p_time_spent < 300 THEN v_bonus_xp := v_bonus_xp + 5; END IF; -- Speed bonus
  
  v_xp_earned := v_xp_earned + v_bonus_xp;
  
  -- Check for daily mission
  SELECT id INTO v_mission_id 
  FROM missions 
  WHERE user_id = p_user_id 
    AND date = CURRENT_DATE 
    AND status = 'open'
  LIMIT 1;
  
  -- Create lesson completion record
  INSERT INTO lesson_completions(
    user_id, lesson_id, mission_id, amazingness_score, quality_tier,
    time_spent, satisfaction_rating, engagement_score, difficulty_rating,
    feedback_text, xp_earned, streak_bonus, perfect_score_bonus, speed_bonus
  ) VALUES (
    p_user_id, p_lesson_id, v_mission_id, p_amazingness_score, v_quality_tier,
    p_time_spent, p_satisfaction_rating, p_engagement_score, p_difficulty_rating,
    p_feedback_text, v_xp_earned, 
    (SELECT streak >= 3 FROM profiles WHERE user_id = p_user_id),
    p_amazingness_score >= 150,
    p_time_spent > 0 AND p_time_spent < 300
  ) RETURNING id INTO v_completion_id;
  
  -- Update user profile with XP and streak
  UPDATE profiles 
  SET xp = COALESCE(xp, 0) + v_xp_earned,
      streak = CASE 
        WHEN last_mission_date = CURRENT_DATE - 1 THEN COALESCE(streak, 0) + 1
        WHEN last_mission_date = CURRENT_DATE THEN COALESCE(streak, 1)
        ELSE 1 
      END,
      last_mission_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING streak INTO v_current_streak;
  
  -- Complete mission if exists
  IF v_mission_id IS NOT NULL THEN
    UPDATE missions 
    SET status = 'done', 
        completed_at = NOW(),
        amazingness_score = p_amazingness_score,
        completion_time = (p_time_spent || ' seconds')::INTERVAL
    WHERE id = v_mission_id;
  END IF;
  
  -- Check for achievements
  v_achievements := check_and_award_achievements(p_user_id, p_amazingness_score, v_current_streak);
  
  -- Log event
  INSERT INTO events(user_id, event_type, category, properties, xp_impact)
  VALUES (p_user_id, 'lesson_completed', 'learning', 
          jsonb_build_object(
            'lesson_id', p_lesson_id,
            'amazingness_score', p_amazingness_score,
            'quality_tier', v_quality_tier,
            'xp_earned', v_xp_earned,
            'achievements', v_achievements
          ), v_xp_earned);
  
  RETURN jsonb_build_object(
    'completion_id', v_completion_id,
    'xp_earned', v_xp_earned,
    'quality_tier', v_quality_tier,
    'current_streak', v_current_streak,
    'achievements_unlocked', v_achievements,
    'mission_completed', v_mission_id IS NOT NULL
  );
END; $$;

-- 3. Check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(
  p_user_id TEXT,
  p_amazingness_score INTEGER,
  p_current_streak INTEGER
) RETURNS TEXT[] LANGUAGE plpgsql AS $$
DECLARE
  v_achievements TEXT[] := '{}';
  v_total_lessons INTEGER;
  v_perfect_scores INTEGER;
BEGIN
  -- Get user stats
  SELECT COUNT(*), COUNT(*) FILTER (WHERE amazingness_score >= 150)
  INTO v_total_lessons, v_perfect_scores
  FROM lesson_completions 
  WHERE user_id = p_user_id;
  
  -- First lesson achievement
  IF v_total_lessons = 1 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'first_lesson'
  ) THEN
    INSERT INTO achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
    VALUES (p_user_id, 'first_lesson', '🎯 First Mission Complete', 'Completed your first AI learning lesson', '🎯', 25);
    
    UPDATE profiles SET xp = xp + 25 WHERE user_id = p_user_id;
    v_achievements := array_append(v_achievements, 'first_lesson');
  END IF;
  
  -- Perfect score achievements
  IF p_amazingness_score >= 150 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'perfect_score'
  ) THEN
    INSERT INTO achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus, rarity)
    VALUES (p_user_id, 'perfect_score', '💎 Perfect Score', 'Achieved maximum amazingness score', '💎', 100, 'epic');
    
    UPDATE profiles SET xp = xp + 100 WHERE user_id = p_user_id;
    v_achievements := array_append(v_achievements, 'perfect_score');
  END IF;
  
  -- Streak achievements
  IF p_current_streak >= 3 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'streak_3'
  ) THEN
    INSERT INTO achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus)
    VALUES (p_user_id, 'streak_3', '🔥 3-Day Streak', 'Completed lessons for 3 days in a row', '🔥', 50);
    UPDATE profiles SET xp = xp + 50 WHERE user_id = p_user_id;
    v_achievements := array_append(v_achievements, 'streak_3');
  END IF;
  
  IF p_current_streak >= 7 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'streak_7'
  ) THEN
    INSERT INTO achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus, rarity)
    VALUES (p_user_id, 'streak_7', '🚀 Weekly Warrior', 'Completed lessons for 7 days in a row', '🚀', 100, 'rare');
    UPDATE profiles SET xp = xp + 100 WHERE user_id = p_user_id;
    v_achievements := array_append(v_achievements, 'streak_7');
  END IF;
  
  IF p_current_streak >= 30 AND NOT EXISTS (
    SELECT 1 FROM achievements WHERE user_id = p_user_id AND achievement_type = 'streak_30'
  ) THEN
    INSERT INTO achievements(user_id, achievement_type, title, description, badge_icon, xp_bonus, rarity)
    VALUES (p_user_id, 'streak_30', '👑 Learning Legend', 'Completed lessons for 30 days in a row', '👑', 500, 'legendary');
    UPDATE profiles SET xp = xp + 500 WHERE user_id = p_user_id;
    v_achievements := array_append(v_achievements, 'streak_30');
  END IF;
  
  RETURN v_achievements;
END; $$;

-- 4. Generate daily mission for user
CREATE OR REPLACE FUNCTION generate_daily_mission(
  p_user_id TEXT,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_profile RECORD;
  v_mission_title TEXT;
  v_mission_topic TEXT;
  v_difficulty INTEGER;
  v_xp_reward INTEGER;
BEGIN
  -- Ensure profile exists
  PERFORM ensure_user_profile(p_user_id);
  
  -- Get user profile
  SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
  
  -- Generate mission based on user's path and level
  CASE v_profile.path
    WHEN 'Builder' THEN
      v_mission_title := 'Build an AI Project Component';
      v_mission_topic := 'AI Development';
    WHEN 'Automator' THEN 
      v_mission_title := 'Automate a Learning Process';
      v_mission_topic := 'AI Automation';
    WHEN 'Deal-Maker' THEN
      v_mission_title := 'Explore AI Business Applications';
      v_mission_topic := 'AI Business Strategy';
    ELSE
      v_mission_title := 'Discover AI Fundamentals';
      v_mission_topic := 'AI Basics';
  END CASE;

  -- Set difficulty and reward based on user XP
  v_difficulty := CASE 
    WHEN COALESCE(v_profile.xp, 0) < 100 THEN 1
    WHEN COALESCE(v_profile.xp, 0) < 500 THEN 3
    WHEN COALESCE(v_profile.xp, 0) < 1000 THEN 5
    WHEN COALESCE(v_profile.xp, 0) < 2000 THEN 7
    ELSE 9
  END;
  
  v_xp_reward := 10 + (v_difficulty * 2);

  -- Create or update the mission
  INSERT INTO missions(user_id, date, title, topic, difficulty_level, xp_reward, description)
  VALUES (p_user_id, p_date, v_mission_title, v_mission_topic, v_difficulty, v_xp_reward,
          format('Personalized %s mission for your learning journey', v_mission_topic))
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    title = EXCLUDED.title,
    topic = EXCLUDED.topic,
    difficulty_level = EXCLUDED.difficulty_level,
    xp_reward = EXCLUDED.xp_reward,
    description = EXCLUDED.description;

  RETURN jsonb_build_object(
    'title', v_mission_title,
    'topic', v_mission_topic,
    'difficulty', v_difficulty,
    'xp_reward', v_xp_reward,
    'description', format('Personalized %s mission for your learning journey', v_mission_topic)
  );
END; $$;

-- 5. Get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id TEXT)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_profile RECORD;
  v_today_mission RECORD;
  v_recent_achievements RECORD[];
  v_stats RECORD;
BEGIN
  -- Ensure profile exists
  PERFORM ensure_user_profile(p_user_id);
  
  -- Get profile
  SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
  
  -- Get today's mission
  SELECT * INTO v_today_mission FROM missions 
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Generate mission if none exists
  IF v_today_mission IS NULL THEN
    PERFORM generate_daily_mission(p_user_id);
    SELECT * INTO v_today_mission FROM missions 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;
  
  -- Get recent achievements
  SELECT array_agg(ROW(achievement_type, title, badge_icon, unlocked_at)::TEXT) INTO v_recent_achievements
  FROM (
    SELECT achievement_type, title, badge_icon, unlocked_at
    FROM achievements 
    WHERE user_id = p_user_id 
    ORDER BY unlocked_at DESC 
    LIMIT 3
  ) recent;
  
  -- Get learning stats
  SELECT 
    COUNT(*) as total_lessons,
    COUNT(*) FILTER (WHERE amazingness_score >= 130) as amazing_lessons,
    ROUND(AVG(amazingness_score), 1) as avg_amazingness,
    SUM(time_spent) as total_time_spent
  INTO v_stats
  FROM lesson_completions 
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'profile', jsonb_build_object(
      'display_name', COALESCE(v_profile.display_name, 'AI Learner'),
      'path', v_profile.path,
      'xp', COALESCE(v_profile.xp, 0),
      'streak', COALESCE(v_profile.streak, 0),
      'skill_level', v_profile.skill_level
    ),
    'today_mission', jsonb_build_object(
      'id', v_today_mission.id,
      'title', v_today_mission.title,
      'topic', v_today_mission.topic,
      'difficulty', v_today_mission.difficulty_level,
      'xp_reward', v_today_mission.xp_reward,
      'status', v_today_mission.status,
      'description', v_today_mission.description
    ),
    'recent_achievements', COALESCE(v_recent_achievements, '{}'),
    'stats', jsonb_build_object(
      'total_lessons', COALESCE(v_stats.total_lessons, 0),
      'amazing_lessons', COALESCE(v_stats.amazing_lessons, 0),
      'avg_amazingness', COALESCE(v_stats.avg_amazingness, 0),
      'total_hours', ROUND(COALESCE(v_stats.total_time_spent, 0) / 3600.0, 1)
    )
  );
END; $$;

-- 6. Get leaderboards
CREATE OR REPLACE FUNCTION get_learning_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank INTEGER,
  user_id TEXT,
  display_name TEXT,
  total_xp INTEGER,
  current_streak INTEGER,
  lessons_completed BIGINT,
  avg_amazingness DECIMAL
) LANGUAGE sql AS $$
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp, 0) DESC, COALESCE(p.streak, 0) DESC) as rank,
    p.user_id,
    COALESCE(p.display_name, 'Anonymous Learner') as display_name,
    COALESCE(p.xp, 0) as total_xp,
    COALESCE(p.streak, 0) as current_streak,
    COUNT(lc.*) as lessons_completed,
    ROUND(AVG(lc.amazingness_score), 1) as avg_amazingness
  FROM profiles p
  LEFT JOIN lesson_completions lc ON p.user_id = lc.user_id
  GROUP BY p.user_id, p.display_name, p.xp, p.streak
  HAVING COUNT(lc.*) > 0  -- Only users who have completed lessons
  ORDER BY total_xp DESC, current_streak DESC
  LIMIT limit_count;
$$;
