/**
 * AI Personal Learning Assistant - Introvert-Friendly AI Companion
 * Provides personalized learning guidance without any human interaction
 */

import { createClient } from '@supabase/supabase-js';

// Mock mode detection
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LessonData {
  user_id: string;
  lesson_id: string;
  score: number;
  amazingness_score: number;
  completed_at: string;
  engagement_score?: number;
  satisfaction_rating?: number;
  time_spent?: number;
}

interface EngagementPatterns {
  best_time_of_day: string;
  preferred_lesson_length: number;
  learning_style: string;
}

interface UserLearningProfile {
  user_id: string;
  total_lessons: number;
  average_amazingness: number;
  preferred_difficulty: 'beginner' | 'intermediate' | 'advanced';
  strong_topics: string[];
  improvement_areas: string[];
  learning_streak: number;
  engagement_patterns: EngagementPatterns;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  recommended_lessons?: string[];
  insights?: string[];
  motivation?: string;
  study_plan?: {
    today: string[];
    this_week: string[];
    next_steps: string[];
  };
}

export class AILearningAssistant {
  
  /**
   * Generate personalized response based on user's learning data
   */
  async generateResponse(
    user_id: string, 
    user_message: string
  ): Promise<AIResponse> {
    try {
      // Get user's learning profile
      const profile = await this.getUserLearningProfile(user_id);
      
      // Analyze the user's message intent
      const intent = this.analyzeUserIntent(user_message);
      
      // Generate contextual response
      return await this.generateContextualResponse(profile, intent);
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      return {
        message: "I'm having a small hiccup right now, but I'm here to help! Try asking me about your learning progress or what to study next. 🤖✨",
        suggestions: [
          "What should I learn next?",
          "How am I doing with my lessons?",
          "Show me my learning insights",
          "Help me plan my study schedule"
        ]
      };
    }
  }

  /**
   * Get comprehensive user learning profile
   */
  private async getUserLearningProfile(user_id: string): Promise<UserLearningProfile> {
    if (MOCK_MODE) {
      // Mock data for development
      return {
        user_id,
        total_lessons: 23,
        average_amazingness: 127,
        preferred_difficulty: 'intermediate',
        strong_topics: ['Neural Networks', 'Machine Learning', 'Deep Learning'],
        improvement_areas: ['Reinforcement Learning', 'Computer Vision'],
        learning_streak: 12,
        engagement_patterns: {
          best_time_of_day: 'evening',
          preferred_lesson_length: 25,
          learning_style: 'hands-on'
        }
      };
    }

    // Real database query
    const { data: lessons } = await supabase!
      .from('daily_lessons')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false });

    if (!lessons || lessons.length === 0) {
      return {
        user_id,
        total_lessons: 0,
        average_amazingness: 0,
        preferred_difficulty: 'beginner',
        strong_topics: [],
        improvement_areas: [],
        learning_streak: 0,
        engagement_patterns: {
          best_time_of_day: 'any',
          preferred_lesson_length: 20,
          learning_style: 'balanced'
        }
      };
    }

    // Analyze learning patterns
    const avgAmazingness = lessons.reduce((sum, l) => sum + (l.amazingness_score || 0), 0) / lessons.length;
    const strongTopics = this.identifyStrongTopics(lessons);
    const improvementAreas = this.identifyImprovementAreas(lessons);
    const streak = this.calculateCurrentStreak(lessons);

    return {
      user_id,
      total_lessons: lessons.length,
      average_amazingness: Math.round(avgAmazingness),
      preferred_difficulty: avgAmazingness >= 120 ? 'advanced' : avgAmazingness >= 90 ? 'intermediate' : 'beginner',
      strong_topics: strongTopics,
      improvement_areas: improvementAreas,
      learning_streak: streak,
      engagement_patterns: this.analyzeEngagementPatterns()
    };
  }

  /**
   * Analyze what the user is asking for
   */
  private analyzeUserIntent(message: string): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('what') && (msg.includes('next') || msg.includes('study') || msg.includes('learn'))) {
      return 'recommend_next';
    }
    if (msg.includes('how') && (msg.includes('doing') || msg.includes('progress'))) {
      return 'show_progress';
    }
    if (msg.includes('help') || msg.includes('stuck') || msg.includes('confused')) {
      return 'provide_help';
    }
    if (msg.includes('plan') || msg.includes('schedule') || msg.includes('organize')) {
      return 'create_plan';
    }
    if (msg.includes('motivation') || msg.includes('encourage') || msg.includes('tired')) {
      return 'motivate';
    }
    if (msg.includes('insight') || msg.includes('analysis') || msg.includes('pattern')) {
      return 'show_insights';
    }
    
    return 'general_chat';
  }

  /**
   * Generate contextual response based on profile and intent
   */
  private async generateContextualResponse(
    profile: UserLearningProfile, 
    intent: string
  ): Promise<AIResponse> {
    
    switch (intent) {
      case 'recommend_next':
        return this.generateRecommendations(profile);
      
      case 'show_progress':
        return this.generateProgressReport(profile);
      
      case 'provide_help':
        return this.generateHelpResponse(profile);
      
      case 'create_plan':
        return this.generateStudyPlan(profile);
      
      case 'motivate':
        return this.generateMotivation(profile);
      
      case 'show_insights':
        return this.generateInsights(profile);
      
      default:
        return this.generateGeneralResponse(profile);
    }
  }

  /**
   * Generate personalized lesson recommendations
   */
  private generateRecommendations(profile: UserLearningProfile): AIResponse {
    const { average_amazingness, strong_topics } = profile;
    
    let message = "";
    let recommendations: string[] = [];
    
    if (average_amazingness >= 130) {
      message = "🌟 You're absolutely crushing it! Based on your amazing performance (avg score: " + average_amazingness + "/150), here are some cutting-edge topics perfect for you:";
      recommendations = [
        "Advanced Transformer Architecture",
        "Diffusion Models and Generative AI",
        "Multi-Agent Reinforcement Learning",
        "Quantum Machine Learning",
        "Neural Architecture Search"
      ];
    } else if (average_amazingness >= 110) {
      message = "⭐ Your learning journey is outstanding! With your strong foundation, let's explore these advanced concepts:";
      recommendations = [
        "Attention Mechanisms Deep Dive",
        "Computer Vision with CNNs",
        "Natural Language Processing",
        "Advanced Deep Learning",
        "AI Ethics and Bias"
      ];
    } else if (average_amazingness >= 90) {
      message = "✨ You're making excellent progress! Time to build on your strengths:";
      recommendations = strong_topics.length > 0 ? [
        `Advanced ${strong_topics[0]} Techniques`,
        "Practical Machine Learning Projects",
        "Data Science Fundamentals",
        "Python for AI Development"
      ] : [
        "Machine Learning Fundamentals",
        "Introduction to Neural Networks",
        "Data Analysis with Python",
        "Statistics for AI"
      ];
    } else {
      message = "📈 You're building a solid foundation! Let's focus on core concepts that will boost your confidence:";
      recommendations = [
        "AI Fundamentals Review",
        "Math for Machine Learning",
        "Python Programming Basics",
        "Introduction to Data Science"
      ];
    }

    return {
      message,
      recommended_lessons: recommendations,
      suggestions: [
        "Tell me more about " + recommendations[0],
        "Create a study plan for this week",
        "Show me my learning insights",
        "How can I improve my scores?"
      ]
    };
  }

  /**
   * Generate progress report
   */
  private generateProgressReport(profile: UserLearningProfile): AIResponse {
    const { total_lessons, average_amazingness, learning_streak, strong_topics } = profile;
    
    const tier = average_amazingness >= 130 ? "🌟 ABSOLUTELY AMAZING" :
                 average_amazingness >= 110 ? "⭐ AMAZING" :
                 average_amazingness >= 90 ? "✨ EXCELLENT" :
                 average_amazingness >= 75 ? "👍 GREAT" : "📈 IMPROVING";

    const message = `Your Learning Journey Report 📊

🎯 Current Tier: ${tier}
📚 Lessons Completed: ${total_lessons}
🌟 Average Amazingness: ${average_amazingness}/150
🔥 Learning Streak: ${learning_streak} days
💪 Strong Topics: ${strong_topics.length > 0 ? strong_topics.join(', ') : 'Building foundation'}

${average_amazingness >= 110 ? 
  "You're in the AMAZING tier! Your dedication is truly paying off. Keep pushing boundaries!" :
  average_amazingness >= 90 ?
  "You're doing excellent work! You're well on your way to the AMAZING tier." :
  "Great progress! Every lesson is making you stronger. Keep going!"
}`;

    return {
      message,
      insights: [
        `You excel at ${strong_topics[0] || 'foundational concepts'}`,
        `Your consistency is impressive with ${learning_streak} day streak`,
        average_amazingness >= 100 ? "You're ready for advanced challenges" : "Focus on mastering fundamentals",
        "Your learning pace is sustainable and effective"
      ],
      suggestions: [
        "What should I focus on improving?",
        "Show me advanced topics I'm ready for",
        "Help me plan next week's learning",
        "Give me some motivation!"
      ]
    };
  }

  /**
   * Generate help response
   */
  private generateHelpResponse(profile: UserLearningProfile): AIResponse {
    const { improvement_areas, preferred_difficulty } = profile;
    
    return {
      message: `I'm here to help! 🤖💡 

Don't worry - feeling stuck is completely normal and actually a sign you're challenging yourself! Based on your learning pattern, here's how we can tackle this:

🎯 **Immediate Steps:**
• Break the concept into smaller pieces
• Review prerequisite topics if needed  
• Try a hands-on approach with examples
• Take a short break and come back fresh

🔧 **Personalized Suggestions:**
${improvement_areas.length > 0 ? 
  `• Focus on ${improvement_areas[0]} - this will unlock many other concepts` :
  '• Strengthen your foundational knowledge first'
}
• Use the ${preferred_difficulty} difficulty setting for optimal challenge
• Try explaining the concept in your own words

Remember: Every expert was once a beginner who never gave up! 💪`,
      
      suggestions: [
        "Show me easier lessons on this topic",
        "Break this down into steps",
        "What prerequisites should I review?",
        "Give me motivation to keep going"
      ]
    };
  }

  /**
   * Generate study plan
   */
  private generateStudyPlan(profile: UserLearningProfile): AIResponse {
    const { preferred_difficulty, strong_topics, improvement_areas, engagement_patterns } = profile;
    
    const todayPlan = improvement_areas.length > 0 ? 
      [`Review: ${improvement_areas[0]} Basics`] :
      ["Strengthen: Core Concepts"];
    
    const weekPlan = [
      ...strong_topics.slice(0, 2).map(topic => `Advanced: ${topic}`),
      ...improvement_areas.slice(0, 2).map(topic => `Learn: ${topic}`)
    ];

    return {
      message: `Here's your personalized study plan! 📅✨

**Optimized for:** ${preferred_difficulty} level, ${engagement_patterns.learning_style} learning style
**Best study time:** ${engagement_patterns.best_time_of_day}`,
      
      study_plan: {
        today: todayPlan,
        this_week: weekPlan.length > 0 ? weekPlan : [
          "AI Fundamentals",
          "Python Programming", 
          "Data Science Basics",
          "Machine Learning Intro"
        ],
        next_steps: [
          "Master current topics before advancing",
          "Maintain consistent daily practice",
          "Apply learning with hands-on projects",
          "Track amazingness scores for motivation"
        ]
      },
      
      suggestions: [
        "Adjust my study schedule",
        "Show me today's recommended lesson",
        "How can I improve my learning efficiency?",
        "Track my progress this week"
      ]
    };
  }

  /**
   * Generate motivational response
   */
  private generateMotivation(profile: UserLearningProfile): AIResponse {
    const { total_lessons, average_amazingness, learning_streak } = profile;
    
    const motivationMessages = [
      "🚀 Every lesson you complete makes you stronger! You've already conquered " + total_lessons + " lessons - that's incredible progress!",
      "🌟 Your " + learning_streak + "-day streak shows real dedication. You're building something amazing, one lesson at a time!",
      "💡 Remember: AI masters aren't born, they're made through exactly what you're doing right now - consistent learning and growth!",
      "🎯 Your average amazingness score of " + average_amazingness + " proves you have what it takes. Keep pushing those boundaries!"
    ];
    
    return {
      message: motivationMessages[Math.floor(Math.random() * motivationMessages.length)],
      motivation: average_amazingness >= 100 ? 
        "You're already in the top tier of learners. Your future in AI is incredibly bright! 🌟" :
        "Every expert was once a beginner. You're not just learning AI - you're becoming AI-powered yourself! 🤖💪",
      
      suggestions: [
        "What's my next challenge?",
        "Show me how far I've come",
        "Help me set a new learning goal",
        "Give me a confidence boost!"
      ]
    };
  }

  /**
   * Generate insights about learning patterns
   */
  private generateInsights(profile: UserLearningProfile): AIResponse {
    const { engagement_patterns, average_amazingness, strong_topics, learning_streak } = profile;
    
    return {
      message: "🔍 Your Personal Learning Insights",
      insights: [
        `🧠 Learning Style: You thrive with ${engagement_patterns.learning_style} approaches`,
        `⏰ Peak Performance: ${engagement_patterns.best_time_of_day} sessions work best for you`,
        `🎯 Sweet Spot: ${engagement_patterns.preferred_lesson_length}-minute lessons optimize your focus`,
        `💪 Strengths: You excel at ${strong_topics.length > 0 ? strong_topics.join(' and ') : 'building foundations'}`,
        `🔥 Consistency: ${learning_streak} day streak shows excellent discipline`,
        `📈 Growth Trend: Your amazingness scores are ${average_amazingness >= 100 ? 'consistently high' : 'steadily improving'}`
      ],
      suggestions: [
        "How can I optimize my learning schedule?",
        "What topics should I focus on?",
        "Help me build on my strengths",
        "Show me areas for improvement"
      ]
    };
  }

  /**
   * Generate general conversational response
   */
  private generateGeneralResponse(profile: UserLearningProfile): AIResponse {
    return {
      message: `Hey there! 👋 I'm your AI Learning Assistant - think of me as your personal AI study buddy who's always here to help (no video calls required! 😊).

I've been analyzing your learning journey and I'm impressed with your progress! With ${profile.total_lessons} lessons completed and an amazingness score of ${profile.average_amazingness}, you're doing great.

What would you like to explore today?`,
      
      suggestions: [
        "What should I learn next?",
        "Show me my learning progress",
        "Help me plan my study schedule",
        "Give me some motivation!",
        "What are my learning insights?",
        "I'm stuck on a concept - help!"
      ]
    };
  }

  // Helper methods for data analysis
  private identifyStrongTopics(lessons: LessonData[]): string[] {
    const topicScores: { [key: string]: number[] } = {};
    
    lessons.forEach(lesson => {
      const topic = lesson.lesson_id?.split('-')[0] || 'general';
      if (!topicScores[topic]) topicScores[topic] = [];
      topicScores[topic].push(lesson.amazingness_score || 0);
    });

    return Object.entries(topicScores)
      .map(([topic, scores]) => ({
        topic,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .filter(item => item.avg >= 110)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(item => item.topic);
  }

  private identifyImprovementAreas(lessons: LessonData[]): string[] {
    const topicScores: { [key: string]: number[] } = {};
    
    lessons.forEach(lesson => {
      const topic = lesson.lesson_id?.split('-')[0] || 'general';
      if (!topicScores[topic]) topicScores[topic] = [];
      topicScores[topic].push(lesson.amazingness_score || 0);
    });

    return Object.entries(topicScores)
      .map(([topic, scores]) => ({
        topic,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .filter(item => item.avg < 90)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .map(item => item.topic);
  }

  private calculateCurrentStreak(lessons: LessonData[]): number {
    // Simplified streak calculation - could be enhanced with actual date logic
    return Math.min(15, lessons.length);
  }

  private analyzeEngagementPatterns(): EngagementPatterns {
    // This could analyze actual lesson completion times, scores, etc.
    return {
      best_time_of_day: 'evening',
      preferred_lesson_length: 25,
      learning_style: 'hands-on'
    };
  }
}

export const aiLearningAssistant = new AILearningAssistant();
