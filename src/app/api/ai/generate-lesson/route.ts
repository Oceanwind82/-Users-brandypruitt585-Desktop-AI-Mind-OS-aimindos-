import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIService, type UserProfile, type LessonRequest } from '@/lib/ai-service';
import { retry } from '@/lib/utils';
import { notify } from '@/lib/notify';

// Mock mode for development
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AILessonRequest {
  user_id: string;
  topic: string;
  difficulty_level?: number;
  lesson_type?: 'tutorial' | 'deep-dive' | 'quick-bite' | 'practical' | 'theoretical';
  learning_objectives?: string[];
  context?: string;
}

/**
 * POST /api/ai/generate-lesson
 * Generate personalized AI-powered lessons
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AILessonRequest;
    const { 
      user_id, 
      topic, 
      difficulty_level = 5, 
      lesson_type = 'tutorial',
      learning_objectives = [],
      context 
    } = body;

    if (!user_id || !topic) {
      return NextResponse.json(
        { error: 'user_id and topic are required' },
        { status: 400 }
      );
    }

    // Get user profile for personalization
    let userProfile: UserProfile;
    
    if (MOCK_MODE) {
      console.log(`[MOCK] Generating AI lesson for user ${user_id} on topic: ${topic}`);
      userProfile = getMockUserProfile(user_id);
    } else {
      userProfile = await retry(async () => {
        const result = await getUserProfile(user_id);
        if (!result) {
          throw new Error('Failed to fetch user profile');
        }
        return result;
      }, 3, 500);
    }

    // Build lesson request
    const lessonRequest: LessonRequest = {
      topic,
      difficulty_level,
      learning_objectives: learning_objectives.length > 0 
        ? learning_objectives 
        : [`Understand ${topic} fundamentals`, `Apply ${topic} concepts`, `Analyze ${topic} applications`],
      user_profile: userProfile,
      context,
      lesson_type
    };

    // Generate personalized lesson using AI
    const intelligentLesson = await AIService.generatePersonalizedLesson(lessonRequest);

    // Store the generated lesson
    if (!MOCK_MODE) {
      await retry(async () => {
        const result = await supabase!.from('ai_generated_lessons').insert({
          id: intelligentLesson.id,
          user_id,
          topic,
          lesson_data: intelligentLesson,
          difficulty_level,
          lesson_type,
          ai_confidence: intelligentLesson.metadata.ai_confidence,
          created_at: new Date().toISOString()
        });

        if (result.error) {
          throw new Error(`Failed to store lesson: ${result.error.message}`);
        }

        return result;
      }, 3, 500);
    }

    // Send notification about lesson generation
    const notificationMessage = `🧠 AI Lesson Generated\n` +
      `👤 User: ${user_id}\n` +
      `📚 Topic: ${topic}\n` +
      `🎯 Type: ${lesson_type}\n` +
      `📊 Difficulty: ${difficulty_level}/10\n` +
      `🤖 AI Confidence: ${Math.round(intelligentLesson.metadata.ai_confidence * 100)}%\n` +
      `⏱️ Est. Time: ${intelligentLesson.estimated_time} min`;

    await retry(() => notify(notificationMessage), 2, 500);

    return NextResponse.json({
      success: true,
      lesson: intelligentLesson,
      user_profile: {
        learning_style: userProfile.learning_style,
        skill_level: userProfile.skill_level,
        personalization_applied: true
      },
      message: 'AI lesson generated successfully',
      mock: MOCK_MODE
    });

  } catch (error) {
    console.error('AI lesson generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Send error notification
    await retry(() => notify(`🔥 AI Lesson Generation Error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`), 1, 0);

    return NextResponse.json(
      { error: 'Failed to generate AI lesson', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/generate-lesson?user_id=123&action=analyze
 * Analyze user performance and get AI recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const action = searchParams.get('action');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (action === 'analyze') {
      // Get recent user activity
      let recentActivity;
      
      if (MOCK_MODE) {
        console.log(`[MOCK] Analyzing user performance for: ${user_id}`);
        recentActivity = getMockRecentActivity();
      } else {
        recentActivity = await retry(async () => {
          const result = await supabase!
            .from('daily_lessons')
            .select('lesson_id, score, time_spent, completed_at, difficulty_level')
            .eq('user_id', user_id)
            .order('completed_at', { ascending: false })
            .limit(10);

          if (result.error) {
            throw new Error(`Failed to fetch activity: ${result.error.message}`);
          }

          // Ensure all required fields are present
          return (result.data || []).map(item => ({
            lesson_id: item.lesson_id || 'unknown',
            score: item.score || 0,
            time_spent: item.time_spent || 0,
            completed_at: item.completed_at || new Date().toISOString(),
            difficulty_level: item.difficulty_level || 5
          }));
        }, 3, 500);
      }

      // Analyze performance using AI
      const analysis = await AIService.analyzeUserPerformance(user_id, recentActivity);

      // Send analysis notification
      const notificationMessage = `📊 AI Performance Analysis\n` +
        `👤 User: ${user_id}\n` +
        `🎯 Insights: ${analysis.insights.length}\n` +
        `💡 Recommendations: ${analysis.recommendations.length}\n` +
        `📈 Difficulty Adjustment: ${analysis.difficulty_adjustment > 0 ? '+' : ''}${analysis.difficulty_adjustment}`;

      await retry(() => notify(notificationMessage), 2, 500);

      return NextResponse.json({
        success: true,
        analysis,
        activity_analyzed: recentActivity.length,
        mock: MOCK_MODE
      });
    }

    if (action === 'learning-path') {
      const goal = searchParams.get('goal') || 'Advance AI knowledge';
      const timeline_weeks = parseInt(searchParams.get('weeks') || '8');

      // Get user profile
      const userProfile = MOCK_MODE 
        ? getMockUserProfile(user_id)
        : await getUserProfile(user_id);

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }

      // Generate learning path
      const learningPath = await AIService.predictOptimalLearningPath(
        userProfile,
        goal,
        timeline_weeks
      );

      return NextResponse.json({
        success: true,
        learning_path: learningPath,
        user_profile: {
          skill_level: userProfile.skill_level,
          learning_style: userProfile.learning_style
        },
        mock: MOCK_MODE
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "analyze" or "learning-path"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('AI analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Failed to perform AI analysis', details: errorMessage },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserProfile(user_id: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user_id)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  // Get recent lessons for performance metrics
  const { data: lessons, error: lessonsError } = await supabase
    .from('daily_lessons')
    .select('score, time_spent, lesson_id')
    .eq('user_id', user_id)
    .order('completed_at', { ascending: false })
    .limit(20);

  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError);
  }

  // Calculate performance metrics
  const scores = lessons?.map(l => l.score) || [];
  const average_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const completion_rate = Math.min(lessons?.length || 0 / 20, 1);

  return {
    user_id,
    learning_style: determineeLearningStyle(user),
    skill_level: determineSkillLevel(average_score),
    interests: ['AI', 'Machine Learning', 'Technology'], // Could be expanded
    completed_lessons: lessons?.map(l => l.lesson_id) || [],
    performance_metrics: {
      average_score,
      completion_rate,
      preferred_difficulty: Math.ceil(average_score / 20), // 1-5 scale
      learning_velocity: calculateLearningVelocity(lessons || [])
    },
    knowledge_gaps: [], // Would be determined by AI analysis
    strengths: [] // Would be determined by AI analysis
  };
}

function determineeLearningStyle(_user: Record<string, unknown>): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
  // In a real implementation, this would be based on user preferences/behavior
  // For now, we default to visual learning style
  console.log('User learning style analysis needed for:', _user.id || 'anonymous');
  return 'visual';
}

function determineSkillLevel(average_score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (average_score >= 90) return 'expert';
  if (average_score >= 75) return 'advanced';
  if (average_score >= 60) return 'intermediate';
  return 'beginner';
}

function calculateLearningVelocity(lessons: Array<{ time_spent?: number }>): number {
  if (lessons.length < 2) return 1.0;
  
  // Calculate average time per lesson vs expected time
  const avgTime = lessons.reduce((sum, lesson) => sum + (lesson.time_spent || 0), 0) / lessons.length;
  const expectedTime = 15 * 60; // 15 minutes in seconds
  
  return expectedTime / Math.max(avgTime, 60); // Velocity factor
}

function getMockUserProfile(user_id: string): UserProfile {
  return {
    user_id,
    learning_style: 'visual',
    skill_level: 'intermediate',
    interests: ['AI', 'Machine Learning', 'Neural Networks', 'Computer Vision'],
    completed_lessons: ['intro-to-ai', 'ml-basics', 'neural-networks-101'],
    performance_metrics: {
      average_score: 78,
      completion_rate: 0.85,
      preferred_difficulty: 6,
      learning_velocity: 1.2
    },
    knowledge_gaps: ['Advanced Algorithms', 'Production ML Systems'],
    strengths: ['Conceptual Understanding', 'Mathematical Foundations']
  };
}

function getMockRecentActivity() {
  return [
    {
      lesson_id: 'neural-networks-advanced',
      score: 85,
      time_spent: 1200,
      completed_at: new Date().toISOString(),
      difficulty_level: 7
    },
    {
      lesson_id: 'deep-learning-intro',
      score: 92,
      time_spent: 900,
      completed_at: new Date(Date.now() - 86400000).toISOString(),
      difficulty_level: 6
    }
  ];
}
