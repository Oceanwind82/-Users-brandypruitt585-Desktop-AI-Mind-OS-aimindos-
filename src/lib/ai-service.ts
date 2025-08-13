/**
 * Enhanced AI Service Layer for AI Mind OS
 * Provides intelligent content generation, adaptive learning, and predictive analytics
 */

import OpenAI from 'openai';
import { retry } from './utils';

// Initialize OpenAI with robust configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 3,
});

// Mock mode for development
const MOCK_AI_MODE = !process.env.OPENAI_API_KEY || 
                     process.env.OPENAI_API_KEY === 'your_openai_api_key';

export interface UserProfile {
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
  knowledge_gaps: string[];
  strengths: string[];
}

export interface ContentData {
  title: string;
  description: string;
  content_type: string;
  sections?: Array<{
    title: string;
    content: string;
    estimated_time?: number;
  }>;
  learning_objectives?: string[];
  difficulty_level?: number;
  interactive_elements?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ContentImprovements {
  structure_enhancements: string[];
  interaction_additions: string[];
  personalization_features: string[];
  accessibility_improvements?: string[];
  performance_optimizations?: string[];
}

export interface LessonRequest {
  topic: string;
  difficulty_level: number;
  learning_objectives: string[];
  user_profile: UserProfile;
  context?: string;
  lesson_type: 'tutorial' | 'deep-dive' | 'quick-bite' | 'practical' | 'theoretical';
}

export interface IntelligentLesson {
  id: string;
  title: string;
  content: string;
  learning_objectives: string[];
  key_concepts: string[];
  difficulty_level: number;
  estimated_time: number;
  personalization_notes: string;
  adaptive_elements: {
    prerequisite_check: string[];
    difficulty_adjustments: string;
    follow_up_suggestions: string[];
  };
  interactive_elements: {
    questions: Array<{
      question: string;
      type: 'multiple_choice' | 'true_false' | 'open_ended' | 'scenario';
      options?: string[];
      correct_answer?: string;
      explanation: string;
    }>;
    exercises: string[];
    real_world_applications: string[];
  };
  metadata: {
    tags: string[];
    category: string;
    ai_confidence: number;
    generated_at: string;
  };
}

export class AIService {
  
  /**
   * Generate personalized AI lesson content
   */
  static async generatePersonalizedLesson(request: LessonRequest): Promise<IntelligentLesson> {
    if (MOCK_AI_MODE) {
      return this.getMockLesson(request);
    }

    return retry(async () => {
      const prompt = this.buildPersonalizedPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert AI educator for AI Mind OS, specializing in creating personalized, adaptive learning content. 
            Your responses should be in JSON format matching the IntelligentLesson interface.
            Focus on: personalization, adaptive difficulty, practical applications, and interactive elements.
            Always include learning objectives, key concepts, and follow-up suggestions.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const lessonData = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...lessonData,
        metadata: {
          ...lessonData.metadata,
          ai_confidence: this.calculateConfidence(completion),
          generated_at: new Date().toISOString()
        }
      } as IntelligentLesson;
    }, 3, 1000);
  }

  /**
   * Analyze user performance and suggest improvements
   */
  static async analyzeUserPerformance(user_id: string, recentActivity: Array<{
    lesson_id: string;
    score: number;
    time_spent: number;
    completed_at: string;
    difficulty_level: number;
  }>): Promise<{
    insights: string[];
    recommendations: string[];
    knowledge_gaps: string[];
    strengths: string[];
    next_learning_path: string[];
    difficulty_adjustment: number;
  }> {
    if (MOCK_AI_MODE) {
      return this.getMockAnalysis();
    }

    return retry(async () => {
      const prompt = `Analyze this user's learning performance and provide insights:
      
User ID: ${user_id}
Recent Activity: ${JSON.stringify(recentActivity, null, 2)}

Provide analysis in JSON format with:
- insights: Array of key insights about learning patterns
- recommendations: Specific actionable recommendations
- knowledge_gaps: Areas needing improvement
- strengths: User's strong areas
- next_learning_path: Suggested next topics/lessons
- difficulty_adjustment: Number between -2 and 2 for difficulty adjustment`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert learning analytics AI. Provide detailed, actionable insights about user learning patterns and performance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  /**
   * Generate intelligent content based on current trends and user interests
   */
  static async generateTrendingContent(topic: string, audience_level: string): Promise<{
    headline: string;
    summary: string;
    key_points: string[];
    practical_applications: string[];
    future_implications: string[];
    recommended_actions: string[];
  }> {
    if (MOCK_AI_MODE) {
      return this.getMockTrendingContent(topic);
    }

    return retry(async () => {
      const prompt = `Generate intelligent content about: ${topic}
      
Target audience level: ${audience_level}
Current date: ${new Date().toISOString()}

Create content that is:
- Current and relevant to 2025 trends
- Actionable and practical
- Forward-looking with future implications
- Engaging and educational

Response in JSON format with all required fields.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert AI researcher and content creator. Generate insightful, current, and actionable content about AI and technology trends."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  /**
   * Intelligent question generation for assessments
   */
  static async generateAdaptiveQuestions(
    topic: string, 
    difficulty: number, 
    user_profile: Partial<UserProfile>
  ): Promise<Array<{
    question: string;
    type: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
    difficulty_level: number;
    learning_objective: string;
  }>> {
    if (MOCK_AI_MODE) {
      return this.getMockQuestions(topic, difficulty);
    }

    return retry(async () => {
      const prompt = `Generate adaptive assessment questions for:
      
Topic: ${topic}
Difficulty Level: ${difficulty}/10
User Profile: ${JSON.stringify(user_profile, null, 2)}

Create 5 questions of varying types (multiple choice, scenario-based, practical application).
Each question should be tailored to the user's learning style and skill level.

Response in JSON format as array of question objects.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert assessment designer. Create adaptive, engaging questions that accurately measure understanding and promote learning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response.questions || [];
    }, 3, 1000);
  }

  /**
   * Predictive learning path recommendation
   */
  static async predictOptimalLearningPath(
    user_profile: UserProfile,
    goal: string,
    timeline_weeks: number
  ): Promise<{
    learning_path: Array<{
      week: number;
      topics: string[];
      objectives: string[];
      estimated_hours: number;
      difficulty_progression: number;
    }>;
    success_probability: number;
    risk_factors: string[];
    optimization_suggestions: string[];
  }> {
    if (MOCK_AI_MODE) {
      return this.getMockLearningPath();
    }

    return retry(async () => {
      const prompt = `Design an optimal learning path:
      
User Profile: ${JSON.stringify(user_profile, null, 2)}
Learning Goal: ${goal}
Timeline: ${timeline_weeks} weeks

Analyze the user's:
- Current skill level and knowledge gaps
- Learning velocity and performance patterns
- Preferred learning style
- Available time and commitment level

Create a week-by-week learning path with:
- Progressive difficulty
- Skill building sequence
- Time estimates
- Success probability assessment

Response in JSON format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert learning path designer and educational data scientist. Create optimal, personalized learning sequences based on user data and learning science principles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  // Helper methods for building prompts and mock responses
  private static buildPersonalizedPrompt(request: LessonRequest): string {
    return `Create a personalized AI lesson with the following specifications:

Topic: ${request.topic}
Difficulty Level: ${request.difficulty_level}/10
Lesson Type: ${request.lesson_type}
Learning Objectives: ${request.learning_objectives.join(', ')}

User Profile:
- Learning Style: ${request.user_profile.learning_style}
- Skill Level: ${request.user_profile.skill_level}
- Interests: ${request.user_profile.interests.join(', ')}
- Knowledge Gaps: ${request.user_profile.knowledge_gaps.join(', ')}
- Strengths: ${request.user_profile.strengths.join(', ')}
- Performance Metrics: ${JSON.stringify(request.user_profile.performance_metrics)}

Additional Context: ${request.context || 'None'}

Create comprehensive lesson content with:
1. Personalized introduction based on user's learning style
2. Content adapted to their skill level and interests
3. Interactive elements (questions, exercises, applications)
4. Adaptive elements for different learning paths
5. Clear learning objectives and key concepts
6. Practical, real-world applications
7. Follow-up suggestions for continued learning

Format the response as a complete IntelligentLesson JSON object.`;
  }

  private static calculateConfidence(completion: { choices: Array<{ finish_reason: string }> }): number {
    // Calculate AI confidence based on response quality indicators
    const baseConfidence = 0.8;
    const finishReason = completion.choices[0].finish_reason;
    
    if (finishReason === 'stop') return baseConfidence + 0.15;
    if (finishReason === 'length') return baseConfidence;
    return baseConfidence - 0.2;
  }

  // Mock responses for development
  private static getMockLesson(request: LessonRequest): IntelligentLesson {
    return {
      id: `mock_lesson_${Date.now()}`,
      title: `[MOCK] Personalized ${request.topic} Lesson`,
      content: `This is a mock personalized lesson about ${request.topic} tailored for ${request.user_profile.skill_level} level learners with ${request.user_profile.learning_style} learning style.`,
      learning_objectives: request.learning_objectives,
      key_concepts: [`${request.topic} fundamentals`, "Practical applications", "Advanced techniques"],
      difficulty_level: request.difficulty_level,
      estimated_time: 15 + (request.difficulty_level * 5),
      personalization_notes: `Adapted for ${request.user_profile.learning_style} learner at ${request.user_profile.skill_level} level`,
      adaptive_elements: {
        prerequisite_check: ["Basic understanding of AI concepts"],
        difficulty_adjustments: "Content can be simplified or enhanced based on user performance",
        follow_up_suggestions: ["Advanced topics", "Related areas", "Practical projects"]
      },
      interactive_elements: {
        questions: [
          {
            question: `What is the main benefit of ${request.topic}?`,
            type: 'multiple_choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: 'Option A',
            explanation: 'This is the correct answer because...'
          }
        ],
        exercises: [`Practice implementing ${request.topic}`],
        real_world_applications: [`How ${request.topic} is used in industry`]
      },
      metadata: {
        tags: [request.topic, request.user_profile.skill_level],
        category: 'AI Learning',
        ai_confidence: 0.95,
        generated_at: new Date().toISOString()
      }
    };
  }

  private static getMockAnalysis() {
    return {
      insights: [
        "Strong performance in theoretical concepts",
        "Could benefit from more practical exercises",
        "Learning velocity is above average"
      ],
      recommendations: [
        "Focus on hands-on projects",
        "Increase difficulty level gradually",
        "Add more visual learning elements"
      ],
      knowledge_gaps: ["Advanced algorithms", "Real-world implementation"],
      strengths: ["Conceptual understanding", "Problem-solving"],
      next_learning_path: ["Machine Learning Projects", "AI Ethics", "Advanced Neural Networks"],
      difficulty_adjustment: 0.5
    };
  }

  private static getMockTrendingContent(topic: string) {
    return {
      headline: `[MOCK] Latest Developments in ${topic}`,
      summary: `Comprehensive overview of current trends and developments in ${topic} for 2025.`,
      key_points: [
        "Emerging technologies and methodologies",
        "Industry adoption patterns",
        "Research breakthroughs"
      ],
      practical_applications: [
        "Real-world use cases",
        "Implementation strategies",
        "Best practices"
      ],
      future_implications: [
        "Predicted developments",
        "Potential challenges",
        "Opportunities for growth"
      ],
      recommended_actions: [
        "Start learning fundamentals",
        "Follow key researchers",
        "Join relevant communities"
      ]
    };
  }

  private static getMockQuestions(topic: string, difficulty: number) {
    return [
      {
        question: `What is a key application of ${topic}?`,
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'This demonstrates understanding of core concepts.',
        difficulty_level: difficulty,
        learning_objective: `Understand ${topic} applications`
      }
    ];
  }

  private static getMockLearningPath() {
    return {
      learning_path: [
        {
          week: 1,
          topics: ["Fundamentals", "Basic concepts"],
          objectives: ["Understand core principles"],
          estimated_hours: 5,
          difficulty_progression: 3
        },
        {
          week: 2,
          topics: ["Intermediate concepts", "Practical applications"],
          objectives: ["Apply knowledge to real scenarios"],
          estimated_hours: 6,
          difficulty_progression: 5
        }
      ],
      success_probability: 0.85,
      risk_factors: ["Time constraints", "Complex topics ahead"],
      optimization_suggestions: ["Add more practice sessions", "Include peer collaboration"]
    };
  }

  /**
   * Enhanced Content Intelligence Methods for API Integration
   */

  /**
   * Generate context-aware content recommendations based on user behavior
   */
  static async generateContentRecommendations(params: {
    user_profile: Partial<UserProfile>;
    recent_topics: string[];
    learning_goals: string[];
    time_available: number; // minutes
    current_context?: string;
  }): Promise<{
    recommended_content: Array<{
      type: 'lesson' | 'assessment' | 'interactive_demo' | 'case_study';
      topic: string;
      priority_score: number;
      estimated_time: number;
      personalization_reasons: string[];
    }>;
    learning_path_suggestions: string[];
    adaptive_difficulty: number;
    context_insights: string[];
  }> {
    if (MOCK_AI_MODE) {
      return {
        recommended_content: [
          {
            type: 'lesson',
            topic: 'Machine Learning Fundamentals',
            priority_score: 0.92,
            estimated_time: 25,
            personalization_reasons: ['Matches your learning style', 'Builds on previous topics']
          },
          {
            type: 'interactive_demo',
            topic: 'Neural Networks in Practice',
            priority_score: 0.87,
            estimated_time: 30,
            personalization_reasons: ['Interactive learning preference', 'Current skill level match']
          }
        ],
        learning_path_suggestions: [
          'Continue with ML fundamentals',
          'Explore practical applications',
          'Join study group discussions'
        ],
        adaptive_difficulty: 6,
        context_insights: [
          'User prefers visual learning',
          'Strong performance in technical topics',
          'Benefits from hands-on exercises'
        ]
      };
    }

    return retry(async () => {
      const prompt = `Generate personalized content recommendations for this learner:

User Profile: ${JSON.stringify(params.user_profile, null, 2)}
Recent Topics: ${params.recent_topics.join(', ')}
Learning Goals: ${params.learning_goals.join(', ')}
Available Time: ${params.time_available} minutes
Current Context: ${params.current_context || 'General learning session'}

Provide recommendations in JSON format with content types, topics, priority scores, and personalization reasoning.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI content recommendation engine for AI Mind OS. Provide personalized, context-aware content suggestions that match the user's learning style, goals, and available time. Focus on adaptive difficulty and learning progression.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  /**
   * Generate intelligent content metadata for enhanced search and discovery
   */
  static async generateContentMetadata(content: {
    title: string;
    description: string;
    content_type: string;
    target_audience: string;
  }): Promise<{
    tags: string[];
    difficulty_indicators: string[];
    learning_objectives: string[];
    prerequisite_topics: string[];
    related_concepts: string[];
    estimated_completion_time: number;
    engagement_factors: string[];
    accessibility_features: string[];
  }> {
    if (MOCK_AI_MODE) {
      return {
        tags: ['AI', 'Machine Learning', 'Beginner-Friendly', 'Interactive'],
        difficulty_indicators: ['Basic concepts', 'No prior experience needed'],
        learning_objectives: ['Understand core concepts', 'Apply basic techniques'],
        prerequisite_topics: ['None required'],
        related_concepts: ['Neural Networks', 'Data Science', 'Algorithms'],
        estimated_completion_time: 30,
        engagement_factors: ['Hands-on exercises', 'Visual examples', 'Real-world applications'],
        accessibility_features: ['Screen reader compatible', 'Adjustable text size', 'Audio descriptions']
      };
    }

    return retry(async () => {
      const prompt = `Analyze this content and generate comprehensive metadata:

Title: ${content.title}
Description: ${content.description}
Content Type: ${content.content_type}
Target Audience: ${content.target_audience}

Generate detailed metadata including tags, difficulty indicators, learning objectives, prerequisites, related concepts, estimated time, engagement factors, and accessibility features.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI content analysis engine. Generate comprehensive metadata for educational content that helps with discovery, personalization, and accessibility. Focus on accurate difficulty assessment and learning progression.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  /**
   * Predictive content optimization based on user engagement patterns
   */
  static async optimizeContentForEngagement(params: {
    content_data: ContentData;
    user_engagement_history: Array<{
      content_type: string;
      engagement_score: number;
      completion_rate: number;
      time_spent: number;
      user_feedback?: string;
    }>;
    target_audience: string;
    optimization_goals: string[];
  }): Promise<{
    optimization_suggestions: Array<{
      area: string;
      suggestion: string;
      impact_score: number;
      implementation_effort: 'low' | 'medium' | 'high';
    }>;
    predicted_engagement_score: number;
    content_improvements: ContentImprovements;
    a_b_test_suggestions: string[];
  }> {
    if (MOCK_AI_MODE) {
      return {
        optimization_suggestions: [
          {
            area: 'Interactivity',
            suggestion: 'Add more hands-on coding exercises',
            impact_score: 0.85,
            implementation_effort: 'medium'
          },
          {
            area: 'Visual Design',
            suggestion: 'Include more diagrams and visual explanations',
            impact_score: 0.78,
            implementation_effort: 'low'
          },
          {
            area: 'Pacing',
            suggestion: 'Break content into smaller, digestible chunks',
            impact_score: 0.82,
            implementation_effort: 'medium'
          }
        ],
        predicted_engagement_score: 0.87,
        content_improvements: {
          structure_enhancements: ['Add progress indicators', 'Include section summaries'],
          interaction_additions: ['Quick knowledge checks', 'Interactive examples'],
          personalization_features: ['Adaptive difficulty', 'Learning path suggestions']
        },
        a_b_test_suggestions: [
          'Test different introduction lengths',
          'Compare video vs text explanations',
          'Experiment with quiz placement'
        ]
      };
    }

    return retry(async () => {
      const prompt = `Analyze this content and user engagement data to suggest optimizations:

Content Data: ${JSON.stringify(params.content_data, null, 2)}
User Engagement History: ${JSON.stringify(params.user_engagement_history, null, 2)}
Target Audience: ${params.target_audience}
Optimization Goals: ${params.optimization_goals.join(', ')}

Provide optimization suggestions with impact scores, predicted engagement improvements, and A/B testing recommendations.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI content optimization specialist. Analyze engagement patterns and suggest data-driven improvements to increase user engagement, completion rates, and learning outcomes. Provide actionable recommendations with impact assessments.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }

  /**
   * Generate adaptive content variations for different learning contexts
   */
  static async generateContentVariations(params: {
    base_content: ContentData;
    target_variations: Array<{
      context: 'mobile' | 'desktop' | 'collaborative' | 'self-paced' | 'instructor-led';
      duration_constraint?: number;
      accessibility_requirements?: string[];
    }>;
    audience_segments: string[];
  }): Promise<{
    variations: Array<{
      context: string;
      adapted_content: ContentData;
      optimization_applied: string[];
      estimated_effectiveness: number;
    }>;
    cross_platform_recommendations: string[];
    accessibility_enhancements: string[];
  }> {
    if (MOCK_AI_MODE) {
      return {
        variations: [
          {
            context: 'mobile',
            adapted_content: {
              title: 'Quick ML Concepts',
              description: 'Mobile-optimized machine learning fundamentals',
              content_type: 'interactive_lesson',
              sections: [
                { title: 'Bite-sized explanations', content: 'Core concepts in digestible chunks', estimated_time: 5 },
                { title: 'Swipe-through examples', content: 'Interactive examples with touch controls', estimated_time: 7 },
                { title: 'Touch interactions', content: 'Hands-on exercises for mobile', estimated_time: 3 }
              ],
              difficulty_level: 3
            },
            optimization_applied: ['Condensed content', 'Touch-friendly UI', 'Offline capability'],
            estimated_effectiveness: 0.82
          },
          {
            context: 'collaborative',
            adapted_content: {
              title: 'ML Team Workshop',
              description: 'Collaborative machine learning session',
              content_type: 'workshop',
              sections: [
                { title: 'Group discussions', content: 'Team-based concept exploration', estimated_time: 15 },
                { title: 'Pair programming', content: 'Collaborative coding exercises', estimated_time: 20 },
                { title: 'Shared whiteboard', content: 'Visual problem solving together', estimated_time: 10 }
              ],
              difficulty_level: 5
            },
            optimization_applied: ['Group activities', 'Discussion prompts', 'Collaborative tools'],
            estimated_effectiveness: 0.89
          }
        ],
        cross_platform_recommendations: [
          'Sync progress across devices',
          'Adaptive UI for different screen sizes',
          'Context-aware content suggestions'
        ],
        accessibility_enhancements: [
          'Screen reader optimization',
          'Keyboard navigation support',
          'High contrast mode options'
        ]
      };
    }

    return retry(async () => {
      const prompt = `Generate adaptive content variations for different learning contexts:

Base Content: ${JSON.stringify(params.base_content, null, 2)}
Target Variations: ${JSON.stringify(params.target_variations, null, 2)}
Audience Segments: ${params.audience_segments.join(', ')}

Create optimized versions for each context while maintaining learning effectiveness and accessibility.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an adaptive content generation specialist. Create context-aware variations of educational content that optimize for different devices, learning environments, and accessibility needs while maintaining pedagogical effectiveness.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    }, 3, 1000);
  }
}

export default AIService;
