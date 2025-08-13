import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIService } from '@/lib/ai-service';
import { ContentOrchestrator } from '@/lib/content-orchestrator';
import { retry } from '@/lib/utils';
import { notify } from '@/lib/notify';

// Enhanced mock mode with better detection
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enhanced content request interface with better typing
interface ContentRequest {
  type: 'lesson' | 'assessment' | 'trending' | 'newsletter' | 'course_outline' | 'interactive_demo' | 'case_study';
  topic: string;
  audience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  format: 'text' | 'interactive' | 'video_script' | 'assessment' | 'outline' | 'code_example' | 'visual_guide';
  length: 'micro' | 'short' | 'medium' | 'long' | 'comprehensive';
  personalization?: {
    user_id?: string;
    learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    interests?: string[];
    skill_gaps?: string[];
    preferred_pace?: 'slow' | 'normal' | 'fast';
    experience_level?: number; // 1-10 scale
    previous_topics?: string[];
  };
  context?: string;
  requirements?: string[];
  enhancement_flags?: {
    include_code_examples?: boolean;
    include_visuals?: boolean;
    include_exercises?: boolean;
    adaptive_difficulty?: boolean;
    real_time_updates?: boolean;
  };
}

/**
 * POST /api/ai/content-generation
 * Generate intelligent, personalized content using enhanced AI orchestration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ContentRequest;
    const { 
      type, 
      topic, 
      audience, 
      format, 
      length,
      personalization,
      context,
      requirements = [],
      enhancement_flags = {}
    } = body;

    if (!type || !topic || !audience) {
      return NextResponse.json(
        { error: 'type, topic, and audience are required' },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      console.log(`[MOCK] Generating enhanced AI content: ${type} about ${topic} for ${audience} audience`);
    }

    // Use the new ContentOrchestrator for intelligent generation
    const intelligentResponse = await ContentOrchestrator.generateIntelligentContent({
      type,
      topic,
      audience,
      format,
      length,
      personalization,
      context,
      requirements,
      enhancement_flags
    });

    // Store generated content with enhanced metadata
    if (!MOCK_MODE) {
      await retry(async () => {
        const result = await supabase!.from('ai_generated_content').insert({
          content_type: type,
          topic,
          audience,
          format,
          content_data: intelligentResponse.content,
          personalization_data: personalization,
          enhancement_flags,
          context_data: context,
          metadata: intelligentResponse.metadata,
          recommendations: intelligentResponse.recommendations,
          analytics: intelligentResponse.analytics,
          created_at: new Date().toISOString(),
          content_version: '3.0' // Orchestrated version
        });

        if (result.error) {
          throw new Error(`Failed to store content: ${result.error.message}`);
        }

        return result;
      }, 3, 500);
    }

    // Send enhanced notification with analytics
    const notificationMessage = `� AI Content Orchestrated\n` +
      `📋 Type: ${type}\n` +
      `📚 Topic: ${topic}\n` +
      `🎯 Audience: ${audience}\n` +
      `📄 Format: ${format}\n` +
      `⚡ Length: ${length}\n` +
      `🔧 Personalized: ${intelligentResponse.metadata.personalization_applied ? 'Yes' : 'No'}\n` +
      `📊 Engagement Score: ${(intelligentResponse.metadata.estimated_engagement * 100).toFixed(1)}%\n` +
      `⏱️ Generation Time: ${intelligentResponse.analytics.generation_time}ms\n` +
      `🎯 Confidence: ${(intelligentResponse.analytics.confidence_score * 100).toFixed(1)}%`;

    await retry(() => notify(notificationMessage), 2, 500);

    return NextResponse.json({
      success: true,
      content: intelligentResponse.content,
      metadata: intelligentResponse.metadata,
      recommendations: intelligentResponse.recommendations,
      analytics: intelligentResponse.analytics,
      generated_at: new Date().toISOString(),
      orchestration_version: '3.0',
      mock: MOCK_MODE
    });

  } catch (error) {
    console.error('AI content orchestration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await retry(() => notify(`🔥 AI Content Orchestration Error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`), 1, 0);

    return NextResponse.json(
      { error: 'Failed to orchestrate AI content generation', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/content-generation
 * Get AI content suggestions and templates
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'suggestions';
    const topic = searchParams.get('topic');
    const audience = searchParams.get('audience') || 'intermediate';

    if (action === 'suggestions') {
      const suggestions = await getContentSuggestions(topic, audience);
      
      return NextResponse.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'templates') {
      const templates = await getContentTemplates();
      
      return NextResponse.json({
        success: true,
        templates,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'trending_topics') {
      const trendingTopics = await getTrendingTopics();
      
      return NextResponse.json({
        success: true,
        trending_topics: trendingTopics,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Content suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get content suggestions' },
      { status: 500 }
    );
  }
}

// Enhanced content generation functions

// (Removed unused function buildEnhancedContext to resolve compile error)

// (Removed unused function optimizeContentDifficulty to resolve compile error)

// (Removed unused function generateInteractiveDemo to resolve compile error)

// Generate case study content





// Removed unused function generateCourseOutline to resolve compile error.

// Helper functions



// Content suggestion functions
async function getContentSuggestions(topic: string | null, audience: string) {
  if (MOCK_MODE || !topic) {
    return {
      suggested_topics: [
        'Machine Learning Fundamentals',
        'Neural Network Architecture',
        'Computer Vision Applications',
        'Natural Language Processing',
        'AI Ethics and Bias'
      ],
      content_types: ['lesson', 'assessment', 'trending', 'newsletter'],
      trending_keywords: ['GPT-4', 'Stable Diffusion', 'MLOps', 'Edge AI', 'Prompt Engineering'],
      audience_preferences: {
        beginner: ['Visual content', 'Step-by-step guides', 'Practical examples'],
        intermediate: ['Code examples', 'Case studies', 'Technical deep-dives'],
        advanced: ['Research papers', 'Implementation details', 'Performance optimization'],
        expert: ['Cutting-edge research', 'Novel applications', 'Industry insights']
      }
    };
  }

  const suggestions = await AIService.generateTrendingContent(
    `Content suggestions and ideas related to ${topic} for ${audience} learners`,
    audience
  );

  return {
    suggested_topics: suggestions.key_points,
    related_topics: suggestions.practical_applications,
    trending_angles: suggestions.future_implications,
    recommended_formats: ['interactive lesson', 'hands-on exercise', 'case study analysis'],
    content_opportunities: suggestions.recommended_actions
  };
}

async function getContentTemplates() {
  return {
    lesson_templates: [
      {
        name: 'Problem-Solution Format',
        structure: ['Problem Introduction', 'Context & Background', 'Solution Exploration', 'Implementation', 'Results & Analysis'],
        best_for: ['Technical topics', 'Case studies', 'Practical applications']
      },
      {
        name: 'Concept-Application Format',
        structure: ['Concept Introduction', 'Theoretical Foundation', 'Practical Examples', 'Hands-on Exercise', 'Real-world Applications'],
        best_for: ['Fundamental concepts', 'Scientific principles', 'Mathematical topics']
      }
    ],
    assessment_templates: [
      {
        name: 'Progressive Difficulty',
        structure: ['Warm-up questions', 'Core concept tests', 'Application scenarios', 'Advanced challenges'],
        question_types: ['Multiple choice', 'Short answer', 'Scenario-based', 'Project-based']
      }
    ],
    newsletter_templates: [
      {
        name: 'Weekly Roundup',
        sections: ['Featured Story', 'Quick Updates', 'Learning Spotlight', 'Community Highlights', 'Upcoming Events'],
        tone: 'Informative and engaging'
      }
    ]
  };
}

async function getTrendingTopics() {
  return {
    ai_ml_topics: [
      'Generative AI Applications',
      'Large Language Models',
      'Computer Vision Advances',
      'MLOps and Production AI',
      'AI Safety and Alignment'
    ],
    emerging_technologies: [
      'Quantum Computing',
      'Edge AI Computing',
      'Neuromorphic Chips',
      'Autonomous Systems',
      'Brain-Computer Interfaces'
    ],
    industry_applications: [
      'AI in Healthcare',
      'Autonomous Vehicles',
      'Smart Manufacturing',
      'Financial AI',
      'Educational Technology'
    ],
    skill_development: [
      'Prompt Engineering',
      'AI Product Management',
      'Data Engineering',
      'AI Ethics',
      'Human-AI Collaboration'
    ]
  };
}

// Mock content generators





