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
}

export default AIService;
