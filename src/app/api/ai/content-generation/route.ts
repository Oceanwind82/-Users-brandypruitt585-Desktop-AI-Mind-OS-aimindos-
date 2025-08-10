import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIService } from '@/lib/ai-service';
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

interface ContentRequest {
  type: 'lesson' | 'assessment' | 'trending' | 'newsletter' | 'course_outline';
  topic: string;
  audience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  format: 'text' | 'interactive' | 'video_script' | 'assessment' | 'outline';
  length: 'short' | 'medium' | 'long';
  personalization?: {
    user_id?: string;
    learning_style?: string;
    interests?: string[];
    skill_gaps?: string[];
  };
  context?: string;
  requirements?: string[];
}

/**
 * POST /api/ai/content-generation
 * Generate intelligent, personalized content using AI
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
      requirements = []
    } = body;

    if (!type || !topic || !audience) {
      return NextResponse.json(
        { error: 'type, topic, and audience are required' },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      console.log(`[MOCK] Generating AI content: ${type} about ${topic} for ${audience} audience`);
    }

    let generatedContent;

    switch (type) {
      case 'lesson':
        generatedContent = await generateIntelligentLesson({
          topic,
          audience,
          format,
          length,
          personalization,
          context,
          requirements
        });
        break;

      case 'assessment':
        generatedContent = await generateAdaptiveAssessment({
          topic,
          audience,
          length,
          personalization,
          requirements
        });
        break;

      case 'trending':
        generatedContent = await generateTrendingContent({
          topic,
          audience,
          format,
          context
        });
        break;

      case 'newsletter':
        generatedContent = await generateNewsletterContent({
          topic,
          audience,
          personalization
        });
        break;

      case 'course_outline':
        generatedContent = await generateCourseOutline({
          topic,
          audience,
          length,
          requirements
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

    // Store generated content
    if (!MOCK_MODE) {
      await retry(async () => {
        const result = await supabase!.from('ai_generated_content').insert({
          content_type: type,
          topic,
          audience,
          format,
          content_data: generatedContent,
          personalization_data: personalization,
          created_at: new Date().toISOString()
        });

        if (result.error) {
          throw new Error(`Failed to store content: ${result.error.message}`);
        }

        return result;
      }, 3, 500);
    }

    // Send notification
    const notificationMessage = `🤖 AI Content Generated\n` +
      `📋 Type: ${type}\n` +
      `📚 Topic: ${topic}\n` +
      `🎯 Audience: ${audience}\n` +
      `📄 Format: ${format}\n` +
      `⚡ Length: ${length}\n` +
      `🔧 Personalized: ${personalization ? 'Yes' : 'No'}`;

    await retry(() => notify(notificationMessage), 2, 500);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      metadata: {
        type,
        topic,
        audience,
        format,
        length,
        personalized: !!personalization,
        generated_at: new Date().toISOString()
      },
      mock: MOCK_MODE
    });

  } catch (error) {
    console.error('AI content generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await retry(() => notify(`🔥 AI Content Generation Error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`), 1, 0);

    return NextResponse.json(
      { error: 'Failed to generate AI content', details: errorMessage },
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

// Content generation functions
async function generateIntelligentLesson(params: {
  topic: string;
  audience: string;
  format: string;
  length: string;
  personalization?: ContentRequest['personalization'];
  context?: string;
  requirements: string[];
}) {
  if (MOCK_MODE) {
    return getMockLesson(params);
  }

  // Use AI service to generate trending content as base
  const baseContent = await AIService.generateTrendingContent(
    `${params.topic} - comprehensive lesson for ${params.audience} learners`,
    params.audience
  );

  // Enhance with lesson-specific structure
  return {
    title: baseContent.headline,
    introduction: baseContent.summary,
    learning_objectives: [
      `Understand core concepts of ${params.topic}`,
      `Apply ${params.topic} in practical scenarios`,
      `Analyze real-world applications of ${params.topic}`
    ],
    content_sections: [
      {
        title: "Fundamentals",
        content: baseContent.key_points.join('\n\n'),
        estimated_time: getEstimatedTime(params.length, 0.3)
      },
      {
        title: "Practical Applications",
        content: baseContent.practical_applications.join('\n\n'),
        estimated_time: getEstimatedTime(params.length, 0.4)
      },
      {
        title: "Future Implications",
        content: baseContent.future_implications.join('\n\n'),
        estimated_time: getEstimatedTime(params.length, 0.3)
      }
    ],
    interactive_elements: {
      questions: [
        `What are the key benefits of ${params.topic}?`,
        `How would you implement ${params.topic} in a real project?`,
        `What challenges might arise when using ${params.topic}?`
      ],
      exercises: [
        `Hands-on exercise: Implement a basic ${params.topic} solution`,
        `Case study: Analyze a successful ${params.topic} implementation`,
        `Discussion: Compare different approaches to ${params.topic}`
      ]
    },
    assessment: {
      type: 'mixed',
      questions: 5,
      difficulty: params.audience === 'beginner' ? 'easy' : params.audience === 'advanced' ? 'hard' : 'medium'
    },
    personalization_notes: params.personalization ? 
      `Customized for ${params.personalization.learning_style} learner with interests in ${params.personalization.interests?.join(', ')}` : 
      'Standard lesson format',
    next_steps: baseContent.recommended_actions,
    estimated_total_time: getEstimatedTime(params.length, 1.0),
    difficulty_level: params.audience === 'beginner' ? 3 : params.audience === 'advanced' ? 8 : 5
  };
}

async function generateAdaptiveAssessment(params: {
  topic: string;
  audience: string;
  length: string;
  personalization?: ContentRequest['personalization'];
  requirements: string[];
}) {
  if (MOCK_MODE) {
    return getMockAssessment(params);
  }

  const userProfile = params.personalization ? {
    user_id: params.personalization.user_id || 'unknown',
    learning_style: (params.personalization.learning_style as 'visual' | 'auditory' | 'kinesthetic' | 'reading') || 'visual',
    skill_level: params.audience as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    interests: params.personalization.interests || [],
    completed_lessons: [],
    performance_metrics: {
      average_score: 75,
      completion_rate: 0.8,
      preferred_difficulty: 5,
      learning_velocity: 1.0
    },
    knowledge_gaps: params.personalization.skill_gaps || [],
    strengths: []
  } : undefined;

  const questions = await AIService.generateAdaptiveQuestions(
    params.topic,
    params.audience === 'beginner' ? 3 : params.audience === 'advanced' ? 8 : 5,
    userProfile || {}
  );

  const questionCount = params.length === 'short' ? 5 : params.length === 'long' ? 15 : 10;

  return {
    title: `${params.topic} Assessment - ${params.audience} Level`,
    description: `Adaptive assessment to evaluate understanding of ${params.topic}`,
    questions: questions.slice(0, questionCount),
    assessment_type: 'adaptive',
    difficulty_progression: 'dynamic',
    time_limit: questionCount * 2, // 2 minutes per question
    passing_score: 70,
    feedback_type: 'immediate',
    personalization_applied: !!params.personalization,
    adaptive_features: {
      difficulty_adjustment: true,
      personalized_feedback: true,
      learning_path_suggestions: true
    }
  };
}

async function generateTrendingContent(params: {
  topic: string;
  audience: string;
  format: string;
  context?: string;
}) {
  const content = await AIService.generateTrendingContent(
    `${params.topic} - current trends and developments for ${params.audience} audience`,
    params.audience
  );

  return {
    headline: content.headline,
    summary: content.summary,
    trending_aspects: content.key_points,
    market_insights: content.practical_applications,
    future_outlook: content.future_implications,
    actionable_recommendations: content.recommended_actions,
    format: params.format,
    audience: params.audience,
    relevance_score: 0.92,
    freshness_indicator: 'Latest insights from 2025',
    sources: ['Industry reports', 'Academic research', 'Expert interviews'],
    related_topics: [`Advanced ${params.topic}`, `${params.topic} Applications`, `${params.topic} Tools`]
  };
}

async function generateNewsletterContent(params: {
  topic: string;
  audience: string;
  personalization?: ContentRequest['personalization'];
}) {
  if (MOCK_MODE) {
    return getMockNewsletter(params);
  }

  const content = await AIService.generateTrendingContent(
    `AI and technology newsletter content focusing on ${params.topic}`,
    params.audience
  );

  return {
    subject_line: `🚀 Latest in ${params.topic} - Week of ${new Date().toLocaleDateString()}`,
    header: content.headline,
    featured_story: {
      title: content.headline,
      summary: content.summary,
      key_points: content.key_points.slice(0, 3)
    },
    quick_updates: content.practical_applications.slice(0, 4),
    trending_topics: [`${params.topic} Developments`, 'AI Industry News', 'Tech Innovations'],
    learning_spotlight: {
      title: `Master ${params.topic} This Week`,
      description: `Essential skills and knowledge for ${params.audience} learners`,
      recommendations: content.recommended_actions.slice(0, 3)
    },
    community_highlights: [
      'Member spotlight: Success story',
      'Discussion: Best practices',
      'Q&A: Expert insights'
    ],
    upcoming_events: [
      `${params.topic} Workshop - Next Week`,
      'AI Ethics Webinar',
      'Community Office Hours'
    ],
    call_to_action: `Continue learning about ${params.topic}`,
    personalization_note: params.personalization ? 
      `Curated based on your interest in ${params.personalization.interests?.join(', ')}` : 
      'General AI Mind OS newsletter'
  };
}

async function generateCourseOutline(params: {
  topic: string;
  audience: string;
  length: string;
  requirements: string[];
}) {
  const moduleCount = params.length === 'short' ? 4 : params.length === 'long' ? 12 : 8;
  const weekCount = params.length === 'short' ? 4 : params.length === 'long' ? 12 : 8;

  if (MOCK_MODE) {
    return getMockCourseOutline(params, moduleCount, weekCount);
  }

  // Generate trending content for course structure insights
  await AIService.generateTrendingContent(
    `Comprehensive course outline for ${params.topic} targeting ${params.audience} learners`,
    params.audience
  );

  return {
    course_title: `Complete ${params.topic} Course - ${params.audience} Level`,
    description: `Master ${params.topic} with this comprehensive ${params.length} course`,
    duration_weeks: weekCount,
    estimated_hours: weekCount * (params.audience === 'beginner' ? 8 : 6),
    prerequisites: params.requirements,
    learning_outcomes: [
      `Understand fundamental concepts of ${params.topic}`,
      `Apply ${params.topic} in real-world scenarios`,
      `Build practical projects using ${params.topic}`,
      `Analyze and optimize ${params.topic} solutions`
    ],
    modules: Array.from({ length: moduleCount }, (_, index) => ({
      module_number: index + 1,
      title: `Module ${index + 1}: ${getModuleTitle(params.topic, index, moduleCount)}`,
      week: Math.ceil((index + 1) / (moduleCount / weekCount)),
      learning_objectives: [
        `Understand key concepts from this module`,
        `Apply learned techniques`,
        `Complete practical exercises`
      ],
      topics: getModuleTopics(params.topic, index, moduleCount),
      estimated_hours: params.audience === 'beginner' ? 8 : 6,
      deliverables: [`Assignment ${index + 1}`, 'Quiz', 'Discussion participation'],
      resources: ['Video lectures', 'Reading materials', 'Practice exercises']
    })),
    assessment_strategy: {
      assignments: Math.ceil(moduleCount * 0.7),
      quizzes: moduleCount,
      final_project: true,
      peer_reviews: Math.ceil(moduleCount * 0.3)
    },
    success_metrics: [
      'Completion rate > 80%',
      'Average score > 75%',
      'Practical project completion',
      'Peer evaluation scores'
    ]
  };
}

// Helper functions
function getEstimatedTime(length: string, factor: number): number {
  const baseTimes = { short: 15, medium: 30, long: 60 };
  return Math.round(baseTimes[length as keyof typeof baseTimes] * factor);
}

function getModuleTitle(topic: string, index: number, total: number): string {
  const phases = ['Introduction', 'Fundamentals', 'Intermediate Concepts', 'Advanced Applications', 'Practical Implementation', 'Real-world Projects', 'Optimization', 'Best Practices'];
  const phaseIndex = Math.floor((index / total) * phases.length);
  return `${phases[phaseIndex]} to ${topic}`;
}

function getModuleTopics(topic: string, index: number, total: number): string[] {
  // Generate contextual topics based on the module position
  const isEarly = index < total * 0.3;
  const isMiddle = index >= total * 0.3 && index < total * 0.7;
  const isLate = index >= total * 0.7;

  if (isEarly) {
    return [`${topic} Overview`, `Core Concepts`, `Basic Principles`, `Getting Started`];
  } else if (isMiddle) {
    return [`Intermediate ${topic}`, `Practical Applications`, `Hands-on Exercises`, `Case Studies`];
  } else {
    // Advanced phase (isLate)
    return [`Advanced ${topic}`, `Real-world Projects`, `Best Practices`, `Industry Applications`];
  }
}

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
function getMockLesson(params: Record<string, unknown>) {
  return {
    title: `[MOCK] Complete Guide to ${params.topic}`,
    introduction: `This comprehensive lesson covers ${params.topic} for ${params.audience} learners.`,
    learning_objectives: [`Master ${params.topic} concepts`, `Apply practical skills`, `Build real projects`],
    content_sections: [
      {
        title: "Getting Started",
        content: `Introduction to ${params.topic} fundamentals`,
        estimated_time: 15
      }
    ],
    interactive_elements: {
      questions: [`What is ${params.topic}?`],
      exercises: [`Practice ${params.topic} implementation`]
    },
    estimated_total_time: 45,
    difficulty_level: 5
  };
}

function getMockAssessment(params: Record<string, unknown>) {
  return {
    title: `${params.topic} Assessment`,
    description: `Test your knowledge of ${params.topic}`,
    questions: [
      {
        question: `What is the main purpose of ${params.topic}?`,
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'This demonstrates core understanding.'
      }
    ],
    time_limit: 20,
    passing_score: 70
  };
}

function getMockNewsletter(params: Record<string, unknown>) {
  return {
    subject_line: `🚀 This Week in ${params.topic}`,
    header: `Latest developments in ${params.topic}`,
    featured_story: {
      title: `Breakthrough in ${params.topic}`,
      summary: `Recent advances are changing the field`,
      key_points: ['Innovation 1', 'Innovation 2', 'Innovation 3']
    },
    learning_spotlight: {
      title: `Learn ${params.topic} This Week`,
      recommendations: ['Start with basics', 'Practice daily', 'Join community']
    }
  };
}

function getMockCourseOutline(params: Record<string, unknown>, moduleCount: number, weekCount: number) {
  return {
    course_title: `Complete ${params.topic} Course`,
    description: `Master ${params.topic} in ${weekCount} weeks`,
    duration_weeks: weekCount,
    modules: Array.from({ length: moduleCount }, (_, i) => ({
      module_number: i + 1,
      title: `Module ${i + 1}: ${params.topic} Part ${i + 1}`,
      week: Math.ceil((i + 1) / (moduleCount / weekCount)),
      topics: [`Topic ${i + 1}A`, `Topic ${i + 1}B`],
      estimated_hours: 6
    }))
  };
}
