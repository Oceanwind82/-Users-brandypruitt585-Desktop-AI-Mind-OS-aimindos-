# 🔧 AI Integration Guide - Technical Implementation

## 🛠️ Quick Start Integration

### 1. **Frontend Integration Examples**

#### **React Hook for AI Lesson Generation**
```typescript
// hooks/useAILesson.ts
import { useState, useCallback } from 'react';

interface AILessonRequest {
  user_id: string;
  topic: string;
  difficulty_level?: number;
  lesson_type?: string;
  learning_objectives?: string[];
}

export const useAILesson = () => {
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);

  const generateLesson = useCallback(async (request: AILessonRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) throw new Error('Failed to generate lesson');
      
      const data = await response.json();
      setLesson(data.lesson);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzePerformance = useCallback(async (user_id: string) => {
    const response = await fetch(`/api/ai/generate-lesson?user_id=${user_id}&action=analyze`);
    return response.json();
  }, []);

  return { generateLesson, analyzePerformance, loading, lesson, error };
};
```

#### **AI Analytics Dashboard Component**
```typescript
// components/AIAnalyticsDashboard.tsx
import { useState, useEffect } from 'react';

export const AIAnalyticsDashboard = ({ user_id }: { user_id: string }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overview, userPerformance, trends] = await Promise.all([
          fetch('/api/ai/analytics?type=overview&timeframe=7d').then(r => r.json()),
          fetch(`/api/ai/analytics?type=user_performance&user_id=${user_id}&timeframe=30d`).then(r => r.json()),
          fetch('/api/ai/analytics?type=learning_trends&timeframe=30d').then(r => r.json())
        ]);

        setAnalytics({ overview, userPerformance, trends });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user_id]);

  if (loading) return <div>Loading AI insights...</div>;

  return (
    <div className="ai-analytics-dashboard">
      <div className="overview-section">
        <h3>Platform Overview</h3>
        <p>{analytics?.overview?.insights}</p>
        <div className="metrics">
          {analytics?.overview?.metrics?.map((metric, i) => (
            <div key={i} className="metric-card">
              <span className="value">{metric.value}</span>
              <span className="label">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="user-performance">
        <h3>Your Learning Journey</h3>
        <div className="progress-insights">
          {analytics?.userPerformance?.insights?.map((insight, i) => (
            <div key={i} className="insight-card">
              <strong>{insight.category}:</strong> {insight.message}
            </div>
          ))}
        </div>
        <div className="recommendations">
          <h4>AI Recommendations</h4>
          {analytics?.userPerformance?.recommendations?.map((rec, i) => (
            <div key={i} className="recommendation">
              <span className="priority">{rec.priority}</span>
              <span className="action">{rec.action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="learning-trends">
        <h3>Learning Trends</h3>
        {analytics?.trends?.trends?.map((trend, i) => (
          <div key={i} className="trend-item">
            <strong>{trend.topic}</strong>
            <span className="growth">+{trend.growth_rate}%</span>
            <p>{trend.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### **Smart Content Generator**
```typescript
// components/SmartContentGenerator.tsx
import { useState } from 'react';

export const SmartContentGenerator = () => {
  const [contentType, setContentType] = useState('lesson');
  const [config, setConfig] = useState({
    topic: '',
    audience: 'intermediate',
    format: 'interactive',
    length: 'medium'
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          ...config,
          personalization: {
            user_id: 'current_user_id', // Get from auth context
            learning_style: 'visual', // Get from user profile
            interests: ['AI', 'Technology'] // Get from user profile
          }
        })
      });

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (error) {
      console.error('Content generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-content-generator">
      <div className="content-config">
        <select 
          value={contentType} 
          onChange={(e) => setContentType(e.target.value)}
        >
          <option value="lesson">Lesson</option>
          <option value="assessment">Assessment</option>
          <option value="trending">Trending Content</option>
          <option value="newsletter">Newsletter</option>
          <option value="outline">Course Outline</option>
        </select>

        <input
          type="text"
          placeholder="Topic (e.g., Neural Networks)"
          value={config.topic}
          onChange={(e) => setConfig({...config, topic: e.target.value})}
        />

        <select 
          value={config.audience} 
          onChange={(e) => setConfig({...config, audience: e.target.value})}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>

        <button onClick={generateContent} disabled={loading || !config.topic}>
          {loading ? 'Generating...' : 'Generate AI Content'}
        </button>
      </div>

      {generatedContent && (
        <div className="generated-content">
          <h3>{generatedContent.title}</h3>
          <div className="content-body">
            {generatedContent.content}
          </div>
          {generatedContent.interactive_elements && (
            <div className="interactive-elements">
              <h4>Interactive Elements</h4>
              {generatedContent.interactive_elements.questions?.map((q, i) => (
                <div key={i} className="question">
                  <p><strong>Q{i+1}:</strong> {q.question}</p>
                  <p><em>Answer:</em> {q.correct_answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. **Backend Service Integration**

#### **User Profile Service Integration**
```typescript
// lib/userProfileService.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface UserLearningProfile {
  user_id: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  completed_lessons: string[];
  performance_metrics: {
    average_score: number;
    completion_rate: number;
    preferred_difficulty: number;
    learning_velocity: number;
  };
}

export class UserProfileService {
  private supabase;

  constructor() {
    this.supabase = createServerComponentClient({ cookies });
  }

  async getUserProfile(user_id: string): Promise<UserLearningProfile | null> {
    const { data, error } = await this.supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(user_id: string, updates: Partial<UserLearningProfile>) {
    const { data, error } = await this.supabase
      .from('user_learning_profiles')
      .upsert({ user_id, ...updates })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  }

  async trackLessonCompletion(user_id: string, lesson_id: string, performance: {
    score: number;
    time_spent: number;
    difficulty_rating: number;
  }) {
    // Update lesson completion
    await this.supabase
      .from('lesson_completions')
      .insert({
        user_id,
        lesson_id,
        completed_at: new Date().toISOString(),
        ...performance
      });

    // Update user profile metrics
    const profile = await this.getUserProfile(user_id);
    if (profile) {
      const newMetrics = {
        ...profile.performance_metrics,
        average_score: (profile.performance_metrics.average_score + performance.score) / 2,
        completion_rate: profile.performance_metrics.completion_rate + 1
      };

      await this.updateUserProfile(user_id, {
        performance_metrics: newMetrics,
        completed_lessons: [...profile.completed_lessons, lesson_id]
      });
    }
  }
}
```

#### **AI-Enhanced Lesson Service**
```typescript
// lib/lessonService.ts
import { AIService } from './ai-service';
import { UserProfileService } from './userProfileService';

export class LessonService {
  private aiService: AIService;
  private userProfileService: UserProfileService;

  constructor() {
    this.aiService = new AIService();
    this.userProfileService = new UserProfileService();
  }

  async generatePersonalizedLesson(user_id: string, topic: string, options: {
    difficulty_level?: number;
    lesson_type?: string;
    learning_objectives?: string[];
  } = {}) {
    // Get user profile for personalization
    const userProfile = await this.userProfileService.getUserProfile(user_id);
    
    if (!userProfile) {
      throw new Error('User profile not found. Please complete onboarding first.');
    }

    // Generate AI lesson
    const lesson = await this.aiService.generatePersonalizedLesson({
      user_profile: userProfile,
      topic,
      difficulty_level: options.difficulty_level || userProfile.performance_metrics.preferred_difficulty,
      lesson_type: options.lesson_type || 'interactive',
      learning_objectives: options.learning_objectives || []
    });

    // Store lesson in database
    const { data, error } = await this.supabase
      .from('ai_generated_lessons')
      .insert({
        user_id,
        lesson_id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        metadata: lesson.metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store lesson: ${error.message}`);
    }

    return lesson;
  }

  async getAdaptiveAssessment(user_id: string, topic: string) {
    const userProfile = await this.userProfileService.getUserProfile(user_id);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const questions = await this.aiService.generateAdaptiveQuestions(
      topic,
      userProfile.performance_metrics.preferred_difficulty,
      userProfile
    );

    return {
      topic,
      questions,
      adaptive_metadata: {
        user_skill_level: userProfile.skill_level,
        difficulty_range: [
          Math.max(1, userProfile.performance_metrics.preferred_difficulty - 1),
          Math.min(10, userProfile.performance_metrics.preferred_difficulty + 1)
        ],
        personalization_factors: {
          learning_style: userProfile.learning_style,
          interests: userProfile.interests
        }
      }
    };
  }

  async getLearningPath(user_id: string, goal: string, weeks: number = 12) {
    const userProfile = await this.userProfileService.getUserProfile(user_id);
    
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const learningPath = await this.aiService.predictOptimalLearningPath(
      userProfile,
      goal,
      weeks
    );

    // Store learning path
    await this.supabase
      .from('learning_paths')
      .insert({
        user_id,
        goal,
        duration_weeks: weeks,
        path_data: learningPath,
        created_at: new Date().toISOString()
      });

    return learningPath;
  }
}
```

### 3. **Database Schema Updates**

#### **Required Supabase Tables**
```sql
-- User Learning Profiles
CREATE TABLE user_learning_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  interests TEXT[],
  completed_lessons TEXT[],
  performance_metrics JSONB DEFAULT '{}',
  knowledge_gaps TEXT[],
  strengths TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- AI Generated Lessons
CREATE TABLE ai_generated_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Paths
CREATE TABLE learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 12,
  path_data JSONB NOT NULL,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson Completions (Enhanced)
CREATE TABLE lesson_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  score DECIMAL(5,2),
  time_spent INTEGER, -- in seconds
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  feedback JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analytics Cache
CREATE TABLE ai_analytics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_learning_profiles_user_id ON user_learning_profiles(user_id);
CREATE INDEX idx_ai_generated_lessons_user_id ON ai_generated_lessons(user_id);
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX idx_ai_analytics_cache_key ON ai_analytics_cache(cache_key);
CREATE INDEX idx_ai_analytics_cache_expires ON ai_analytics_cache(expires_at);
```

### 4. **Environment Configuration**

#### **Required Environment Variables**
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-1106-preview
OPENAI_MAX_TOKENS=4000

# AI Service Configuration
AI_SERVICE_ENABLED=true
AI_MOCK_MODE=false # Set to true for development without API calls
AI_CACHE_TTL=3600 # 1 hour cache for AI responses

# Rate Limiting
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=3600 # 1 hour

# Analytics
AI_ANALYTICS_ENABLED=true
AI_ANALYTICS_BATCH_SIZE=100
```

### 5. **Testing Integration**

#### **Jest Test Example**
```typescript
// __tests__/ai-service.test.ts
import { AIService } from '@/lib/ai-service';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  test('should generate personalized lesson', async () => {
    const mockProfile = {
      user_id: 'test-user',
      learning_style: 'visual' as const,
      skill_level: 'intermediate' as const,
      interests: ['AI', 'Machine Learning'],
      completed_lessons: [],
      performance_metrics: {
        average_score: 85,
        completion_rate: 90,
        preferred_difficulty: 6,
        learning_velocity: 1.2
      },
      knowledge_gaps: [],
      strengths: ['problem-solving']
    };

    const lesson = await aiService.generatePersonalizedLesson({
      user_profile: mockProfile,
      topic: 'Neural Networks',
      difficulty_level: 6,
      lesson_type: 'interactive',
      learning_objectives: ['Understand architecture', 'Implement basic network']
    });

    expect(lesson).toBeDefined();
    expect(lesson.title).toBeTruthy();
    expect(lesson.content).toBeTruthy();
    expect(lesson.difficulty_level).toBe(6);
    expect(lesson.metadata.ai_confidence).toBeGreaterThan(0.7);
  });

  test('should analyze user performance', async () => {
    const analysis = await aiService.analyzeUserPerformance('test-user', {
      recent_scores: [85, 90, 78, 92],
      topics_studied: ['AI', 'ML', 'Deep Learning'],
      time_spent: 120,
      engagement_metrics: { clicks: 45, time_on_page: 300 }
    });

    expect(analysis).toBeDefined();
    expect(analysis.insights).toBeDefined();
    expect(analysis.recommendations).toBeDefined();
    expect(Array.isArray(analysis.knowledge_gaps)).toBe(true);
  });
});
```

### 6. **Performance Monitoring**

#### **AI Service Metrics**
```typescript
// lib/aiMetrics.ts
export class AIMetrics {
  static async recordAPICall(endpoint: string, duration: number, success: boolean) {
    const metric = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    };

    // Store in your analytics service
    await fetch('/api/internal/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    });
  }

  static async recordUserInteraction(user_id: string, action: string, data: any) {
    const interaction = {
      user_id,
      action,
      data,
      timestamp: new Date().toISOString()
    };

    // Store for AI learning and optimization
    await fetch('/api/internal/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interaction)
    });
  }
}
```

This integration guide provides everything needed to implement the enhanced AI features in your frontend and backend systems. The AI capabilities are now production-ready and can significantly improve user engagement and learning outcomes! 🚀
