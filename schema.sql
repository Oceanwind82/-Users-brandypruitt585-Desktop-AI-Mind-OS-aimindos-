-- AI Mind OS Database Schema
-- This schema supports the complete amazing lesson system with Research AI

-- =============================================
-- CORE LESSON TRACKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS daily_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- AMAZINGNESS TRACKING FIELDS
  amazingness_score INTEGER DEFAULT 0, -- 0-150 scale
  quality_tier TEXT, -- "🌟 ABSOLUTELY AMAZING", "⭐ AMAZING", etc.
  satisfaction_rating INTEGER, -- 1-5 scale
  difficulty_rating INTEGER, -- 1-10 scale  
  engagement_score INTEGER, -- 1-10 scale
  feedback_text TEXT,
  lesson_quality_metrics JSONB, -- structured feedback data
  
  -- METADATA
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PROFILES & PROGRESS
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  
  -- XP & GAMIFICATION
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- LEARNING PREFERENCES
  preferred_difficulty TEXT DEFAULT 'beginner',
  learning_goal TEXT DEFAULT 'general', -- career, research, business, creative, technical
  topics_completed INTEGER DEFAULT 0,
  
  -- METADATA
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LESSON CONTENT & CURRICULUM
-- =============================================

CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- CONTENT STRUCTURE
  content JSONB NOT NULL, -- full lesson content
  difficulty TEXT DEFAULT 'beginner',
  category TEXT,
  estimated_duration INTEGER DEFAULT 45, -- in minutes
  
  -- AI CURRICULUM FIELDS
  ai_topic_area TEXT, -- from our 12 categories
  relevance_score DECIMAL(3,2) DEFAULT 5.0, -- 1.0-10.0
  prerequisites TEXT[], -- array of prerequisite lesson_ids
  learning_objectives TEXT[],
  
  -- AUTO-UPDATER FIELDS
  last_updated_by_ai TIMESTAMP WITH TIME ZONE,
  update_trigger TEXT, -- 'performance', 'research', 'feedback'
  performance_score DECIMAL(3,2) DEFAULT 5.0, -- average amazingness
  needs_update BOOLEAN DEFAULT FALSE,
  
  -- RESEARCH AI FIELDS
  last_research_update TIMESTAMP WITH TIME ZONE,
  research_version INTEGER DEFAULT 1,
  current_developments JSONB, -- latest research integration
  
  -- METADATA
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'ai_generator'
);

-- =============================================
-- LESSON IMPROVEMENT TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS lesson_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL REFERENCES lesson_content(lesson_id),
  
  -- IMPROVEMENT DETAILS
  improvement_type TEXT NOT NULL, -- 'content', 'exercises', 'clarity', 'research'
  old_score DECIMAL(3,2),
  new_score DECIMAL(3,2),
  improvement_description TEXT,
  ai_reasoning TEXT,
  
  -- RESEARCH AI ENHANCEMENTS
  research_integration JSONB, -- new research data added
  news_sources TEXT[], -- URLs of news sources used
  
  -- METADATA
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by TEXT DEFAULT 'lesson_auto_updater'
);

-- =============================================
-- RESEARCH AI MONITORING
-- =============================================

CREATE TABLE IF NOT EXISTS research_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- RESEARCH DETAILS
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- AI ANALYSIS
  relevance_topics TEXT[], -- which AI topics this affects
  impact_score DECIMAL(3,2) DEFAULT 5.0, -- 1.0-10.0
  lesson_updates_suggested TEXT[], -- lesson_ids to update
  
  -- PROCESSING STATUS
  processed BOOLEAN DEFAULT FALSE,
  applied_to_lessons TEXT[], -- lesson_ids that were updated
  
  -- METADATA
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- LEARNING ANALYTICS
-- =============================================

CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  
  -- ENGAGEMENT METRICS
  time_to_complete INTEGER, -- seconds
  attempts_count INTEGER DEFAULT 1,
  help_requests INTEGER DEFAULT 0,
  skip_rate DECIMAL(3,2) DEFAULT 0,
  
  -- LEARNING EFFECTIVENESS
  knowledge_retention_score DECIMAL(3,2), -- follow-up quiz scores
  application_success BOOLEAN, -- did they use the knowledge
  recommendation_given BOOLEAN DEFAULT FALSE,
  
  -- METADATA
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_daily_lessons_user_id ON daily_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_lessons_lesson_id ON daily_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_daily_lessons_completed_at ON daily_lessons(completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_lessons_amazingness ON daily_lessons(amazingness_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_xp ON user_profiles(total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_category ON lesson_content(category);
CREATE INDEX IF NOT EXISTS idx_lesson_content_difficulty ON lesson_content(difficulty);
CREATE INDEX IF NOT EXISTS idx_lesson_content_needs_update ON lesson_content(needs_update);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_lesson_improvements_lesson_id ON lesson_improvements(lesson_id);
CREATE INDEX IF NOT EXISTS idx_research_updates_processed ON research_updates(processed);
CREATE INDEX IF NOT EXISTS idx_research_updates_impact ON research_updates(impact_score DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your auth setup)
-- Users can only see/modify their own data
CREATE POLICY user_daily_lessons_policy ON daily_lessons 
  FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY user_profiles_policy ON user_profiles 
  FOR ALL USING (auth.uid()::TEXT = user_id);

-- Lesson content is readable by all authenticated users
CREATE POLICY lesson_content_read_policy ON lesson_content 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything (for API operations)
CREATE POLICY service_role_policy ON daily_lessons 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_lesson_content_policy ON lesson_content 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_improvements_policy ON lesson_improvements 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_research_policy ON research_updates 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY service_role_analytics_policy ON learning_analytics 
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update lesson performance scores
CREATE OR REPLACE FUNCTION update_lesson_performance_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lesson performance score based on recent completions
  UPDATE lesson_content 
  SET 
    performance_score = (
      SELECT AVG(amazingness_score::DECIMAL / 150 * 10)
      FROM daily_lessons 
      WHERE lesson_id = NEW.lesson_id 
      AND completed_at > NOW() - INTERVAL '30 days'
    ),
    updated_at = NOW(),
    needs_update = CASE 
      WHEN (
        SELECT AVG(amazingness_score::DECIMAL)
        FROM daily_lessons 
        WHERE lesson_id = NEW.lesson_id 
        AND completed_at > NOW() - INTERVAL '7 days'
      ) < 110 THEN TRUE
      ELSE needs_update
    END
  WHERE lesson_id = NEW.lesson_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update performance scores on lesson completion
CREATE TRIGGER trigger_update_lesson_performance
  AFTER INSERT OR UPDATE ON daily_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_performance_score();

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
DECLARE
  xp_to_award INTEGER;
  new_level INTEGER;
BEGIN
  -- Calculate XP to award (based on score and amazingness)
  xp_to_award = GREATEST(
    NEW.score, 
    NEW.amazingness_score
  );
  
  -- Update user profile
  UPDATE user_profiles 
  SET 
    total_xp = total_xp + xp_to_award,
    topics_completed = topics_completed + 1,
    last_active = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- Calculate new level (every 500 XP = 1 level)
  SELECT FLOOR((total_xp + xp_to_award) / 500) + 1 INTO new_level
  FROM user_profiles 
  WHERE user_id = NEW.user_id;
  
  -- Update level if it changed
  UPDATE user_profiles 
  SET level = new_level
  WHERE user_id = NEW.user_id AND level != new_level;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user progress on lesson completion
CREATE TRIGGER trigger_update_user_progress
  AFTER INSERT ON daily_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress();

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample lesson content
INSERT INTO lesson_content (lesson_id, title, description, content, difficulty, category, ai_topic_area, relevance_score) 
VALUES 
  (
    'neural_networks_101',
    'Neural Networks Fundamentals',
    'Learn the building blocks of artificial intelligence',
    '{"sections": [{"title": "Introduction", "content": "Neural networks are the foundation of modern AI..."}]}',
    'beginner',
    'foundations',
    'Core AI Foundations',
    9.5
  ),
  (
    'transformer_architecture',
    'Transformer Architecture Deep Dive',
    'Master the revolutionary architecture behind GPT and BERT',
    '{"sections": [{"title": "Self-Attention", "content": "The key innovation in transformers..."}]}',
    'intermediate',
    'deep_learning',
    'Deep Learning & Neural Networks',
    10.0
  ),
  (
    'computer_vision_cnns',
    'Computer Vision with CNNs',
    'Apply deep learning to visual understanding',
    '{"sections": [{"title": "Convolutional Layers", "content": "CNNs process images through..."}]}',
    'intermediate',
    'computer_vision',
    'Computer Vision',
    9.2
  )
ON CONFLICT (lesson_id) DO NOTHING;

-- =============================================
-- VIEWS FOR ANALYTICS
-- =============================================

-- Lesson performance summary
CREATE OR REPLACE VIEW lesson_performance_summary AS
SELECT 
  lc.lesson_id,
  lc.title,
  lc.category,
  lc.difficulty,
  lc.relevance_score,
  COUNT(dl.id) as completion_count,
  AVG(dl.amazingness_score)::DECIMAL(5,2) as avg_amazingness,
  AVG(dl.satisfaction_rating)::DECIMAL(3,2) as avg_satisfaction,
  AVG(dl.engagement_score)::DECIMAL(3,2) as avg_engagement,
  lc.performance_score,
  lc.needs_update,
  lc.last_updated_by_ai
FROM lesson_content lc
LEFT JOIN daily_lessons dl ON lc.lesson_id = dl.lesson_id
GROUP BY lc.lesson_id, lc.title, lc.category, lc.difficulty, lc.relevance_score, lc.performance_score, lc.needs_update, lc.last_updated_by_ai;

-- User progress summary
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
  up.user_id,
  up.name,
  up.total_xp,
  up.level,
  up.streak,
  up.topics_completed,
  up.learning_goal,
  COUNT(dl.id) as lessons_completed,
  AVG(dl.amazingness_score)::DECIMAL(5,2) as avg_performance,
  MAX(dl.completed_at) as last_lesson_completed
FROM user_profiles up
LEFT JOIN daily_lessons dl ON up.user_id = dl.user_id
GROUP BY up.user_id, up.name, up.total_xp, up.level, up.streak, up.topics_completed, up.learning_goal;

-- =============================================
-- SCHEMA COMPLETE
-- =============================================

-- Add helpful comments
COMMENT ON TABLE daily_lessons IS 'Tracks individual lesson completions with amazingness metrics';
COMMENT ON TABLE lesson_content IS 'Stores lesson content with AI curriculum and auto-update features';
COMMENT ON TABLE lesson_improvements IS 'Tracks AI-driven lesson improvements over time';
COMMENT ON TABLE research_updates IS 'Monitors AI research developments for curriculum updates';

-- Schema version for tracking updates
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES (1, 'Initial AI Mind OS schema with amazing lessons, auto-updater, and Research AI support')
ON CONFLICT (version) DO NOTHING;
