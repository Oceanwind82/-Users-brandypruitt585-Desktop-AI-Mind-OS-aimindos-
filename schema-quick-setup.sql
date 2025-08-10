-- 🚀 AI MIND OS - QUICK SCHEMA SETUP
-- Copy this entire file and paste it into Supabase SQL Editor
-- This will fix the API errors and enable all your amazing features!

-- =============================================
-- MAIN LESSON TRACKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS daily_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 🌟 AMAZINGNESS TRACKING FIELDS (This fixes your API!)
  amazingness_score INTEGER DEFAULT 0,
  quality_tier TEXT,
  satisfaction_rating INTEGER,
  difficulty_rating INTEGER,
  engagement_score INTEGER,
  feedback_text TEXT,
  lesson_quality_metrics JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PROFILES FOR GAMIFICATION
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  preferred_difficulty TEXT DEFAULT 'beginner',
  learning_goal TEXT DEFAULT 'general',
  topics_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- LESSON CONTENT STORAGE
-- =============================================

CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  category TEXT,
  estimated_duration INTEGER DEFAULT 45,
  ai_topic_area TEXT,
  relevance_score DECIMAL(3,2) DEFAULT 5.0,
  performance_score DECIMAL(3,2) DEFAULT 5.0,
  needs_update BOOLEAN DEFAULT FALSE,
  last_updated_by_ai TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_daily_lessons_user_id ON daily_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_lessons_lesson_id ON daily_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_daily_lessons_amazingness ON daily_lessons(amazingness_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id);

-- =============================================
-- ROW LEVEL SECURITY (Basic Setup)
-- =============================================

ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;

-- Allow service role (your API) to do everything
CREATE POLICY IF NOT EXISTS service_role_daily_lessons ON daily_lessons 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS service_role_user_profiles ON user_profiles 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS service_role_lesson_content ON lesson_content 
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SAMPLE LESSON DATA (Your Amazing AI Topics!)
-- =============================================

INSERT INTO lesson_content (lesson_id, title, description, content, difficulty, category, ai_topic_area, relevance_score) 
VALUES 
  (
    'neural_networks_101',
    'Neural Networks Fundamentals',
    'Learn the building blocks of artificial intelligence',
    '{
      "sections": [
        {
          "title": "Introduction to Neural Networks",
          "content": "Neural networks are the foundation of modern AI. They are inspired by the human brain and consist of interconnected nodes (neurons) that process information.",
          "duration": 10
        },
        {
          "title": "Basic Components",
          "content": "Every neural network has three key components: input layer, hidden layers, and output layer. Data flows through these layers to make predictions.",
          "duration": 15
        },
        {
          "title": "Activation Functions",
          "content": "Activation functions determine whether a neuron should be activated. Common functions include ReLU, Sigmoid, and Tanh.",
          "duration": 10
        },
        {
          "title": "Training Process",
          "content": "Neural networks learn through backpropagation, adjusting weights based on prediction errors to improve accuracy over time.",
          "duration": 10
        }
      ],
      "exercises": [
        "Build a simple perceptron",
        "Implement forward propagation",
        "Calculate gradients manually"
      ],
      "projects": [
        "Handwritten digit recognition",
        "Basic image classifier"
      ]
    }',
    'beginner',
    'foundations',
    'Core AI Foundations',
    9.5
  ),
  (
    'transformer_architecture',
    'Transformer Architecture Deep Dive',
    'Master the revolutionary architecture behind GPT and BERT',
    '{
      "sections": [
        {
          "title": "Introduction to Transformers",
          "content": "Transformers revolutionized natural language processing with their attention mechanism, enabling models like GPT-4 and BERT.",
          "duration": 15
        },
        {
          "title": "Self-Attention Mechanism",
          "content": "Self-attention allows the model to weigh the importance of different words in a sequence, capturing long-range dependencies.",
          "duration": 20
        },
        {
          "title": "Multi-Head Attention",
          "content": "Multiple attention heads allow the model to focus on different types of relationships simultaneously.",
          "duration": 15
        },
        {
          "title": "Positional Encoding",
          "content": "Since transformers have no inherent notion of order, positional encodings are added to preserve sequence information.",
          "duration": 10
        }
      ],
      "exercises": [
        "Implement attention mechanism",
        "Build multi-head attention",
        "Create positional encodings"
      ],
      "projects": [
        "Build a mini-GPT model",
        "Fine-tune BERT for classification",
        "Create a translation system"
      ]
    }',
    'intermediate',
    'deep_learning',
    'Deep Learning & Neural Networks',
    10.0
  ),
  (
    'computer_vision_cnns',
    'Computer Vision with CNNs',
    'Apply deep learning to visual understanding',
    '{
      "sections": [
        {
          "title": "Introduction to Computer Vision",
          "content": "Computer vision enables machines to interpret and understand visual information from the world, powering applications from self-driving cars to medical diagnosis.",
          "duration": 10
        },
        {
          "title": "Convolutional Neural Networks",
          "content": "CNNs use convolutional layers to detect features like edges, textures, and patterns in images through learnable filters.",
          "duration": 20
        },
        {
          "title": "Pooling and Feature Maps",
          "content": "Pooling layers reduce spatial dimensions while preserving important features, creating hierarchical representations.",
          "duration": 15
        },
        {
          "title": "Modern CNN Architectures",
          "content": "Explore advanced architectures like ResNet, VGG, and EfficientNet that achieve state-of-the-art performance.",
          "duration": 10
        }
      ],
      "exercises": [
        "Build a CNN from scratch",
        "Implement different pooling methods",
        "Compare activation functions"
      ],
      "projects": [
        "Image classification system",
        "Real-time object detection",
        "Medical image analysis tool"
      ]
    }',
    'intermediate',
    'computer_vision',
    'Computer Vision',
    9.2
  )
ON CONFLICT (lesson_id) DO NOTHING;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 SUCCESS! AI Mind OS database schema applied successfully!';
    RAISE NOTICE '✅ Your APIs will now work perfectly!';
    RAISE NOTICE '🌟 Amazing lesson tracking is ready!';
    RAISE NOTICE '🚀 You can now test your lesson completion API!';
END $$;
