import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { researchAI, ResearchUpdate } from './research-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AutoUpdateResult {
  updated: boolean;
  score?: number;
  status?: string;
  improvements?: Array<{
    area: string;
    reason?: string;
    priority?: string;
    suggestion?: string;
    confidence?: number;
  }>;
  previous_score?: number;
  research_enhanced?: boolean;
  research_updates?: number;
  new_lesson?: object;
}

interface LessonCompletion {
  lesson_id: string;
  amazingness_score?: number;
  satisfaction_rating?: number;
  engagement_score?: number;
  difficulty_rating?: number;
  feedback_text?: string;
  lesson_quality_metrics?: string | object;
  completed_at: string;
}

interface QualityMetrics {
  clarity: number;
  usefulness: number;
  pace: number;
  would_recommend: boolean;
}

interface LessonImprovementSuggestion {
  area: 'clarity' | 'engagement' | 'difficulty' | 'content' | 'structure';
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  confidence: number;
}

interface LessonData {
  lesson_id: string;
  title: string;
  content: string;
  updated_at?: string;
  improvement_history?: Array<{
    timestamp: string;
    improvements: string[];
    trigger: string;
    feedback_count: number;
  }>;
}

interface UpdateData {
  previous_score: number;
  improvement_areas: string[];
  update_timestamp: string;
  feedback_count: number;
}

export class LessonAutoUpdater {
  private improvementThreshold = 90; // Lessons below this amazingness score get updated
  private minFeedbackCount = 5; // Minimum feedback entries needed for auto-update

  /**
   * Analyze lesson performance and trigger auto-updates if needed
   */
  async analyzeLessonPerformance(lesson_id: string) {
    try {
      // Get lesson completion data with feedback
      const { data: completions, error } = await supabase
        .from('daily_lessons')
        .select('*')
        .eq('lesson_id', lesson_id)
        .not('amazingness_score', 'is', null);

      if (error || !completions || completions.length < this.minFeedbackCount) {
        console.log(`Insufficient data for lesson ${lesson_id} auto-update (${completions?.length || 0} completions)`);
        return null;
      }

      // Calculate performance metrics
      const averageAmazingness = completions.reduce((sum, c) => sum + (c.amazingness_score || 0), 0) / completions.length;
      const averageSatisfaction = completions.reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0) / completions.length;
      const averageEngagement = completions.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / completions.length;

      console.log(`📊 Lesson ${lesson_id} Performance Analysis:`, {
        completions: completions.length,
        averageAmazingness,
        averageSatisfaction,
        averageEngagement
      });

      // Check if lesson needs improvement
      if (averageAmazingness < this.improvementThreshold) {
        console.log(`🔧 Lesson ${lesson_id} needs improvement (score: ${averageAmazingness})`);
        
        const improvements = this.generateImprovementSuggestions(completions);
        
        if (improvements.length > 0) {
          const updatedLesson = await this.autoUpdateLesson(lesson_id, improvements, completions);
          
          // Log the update
          await this.logLessonUpdate(lesson_id, {
            previous_score: averageAmazingness,
            improvement_areas: improvements.map(i => i.area),
            update_timestamp: new Date().toISOString(),
            feedback_count: completions.length
          });

          return {
            updated: true,
            previous_score: averageAmazingness,
            improvements: improvements,
            new_lesson: updatedLesson
          };
        }
      }

      return {
        updated: false,
        score: averageAmazingness,
        status: averageAmazingness >= 110 ? 'amazing' : 'good'
      };

    } catch (error) {
      console.error('Lesson performance analysis error:', error);
      return null;
    }
  }

  /**
   * Generate improvement suggestions based on user feedback
   */
  private generateImprovementSuggestions(completions: LessonCompletion[]): LessonImprovementSuggestion[] {
    const improvements: LessonImprovementSuggestion[] = [];

    // Analyze satisfaction ratings
    const lowSatisfaction = completions.filter(c => (c.satisfaction_rating || 0) < 3);
    if (lowSatisfaction.length > completions.length * 0.3) {
      improvements.push({
        area: 'content',
        priority: 'high',
        suggestion: 'Content quality needs improvement - users report low satisfaction',
        confidence: 0.9
      });
    }

    // Analyze engagement scores
    const lowEngagement = completions.filter(c => (c.engagement_score || 0) < 6);
    if (lowEngagement.length > completions.length * 0.4) {
      improvements.push({
        area: 'engagement',
        priority: 'high',
        suggestion: 'Add more interactive elements and practical examples',
        confidence: 0.85
      });
    }

    // Analyze difficulty ratings
    const difficultyRatings = completions
      .map(c => c.difficulty_rating)
      .filter((d): d is number => d !== undefined && d !== null);
    
    if (difficultyRatings.length > 0) {
      const avgDifficulty = difficultyRatings.reduce((sum, d) => sum + d, 0) / difficultyRatings.length;
      
      if (avgDifficulty > 8) {
        improvements.push({
          area: 'difficulty',
          priority: 'medium',
          suggestion: 'Lesson is too difficult - simplify concepts and add more explanations',
          confidence: 0.8
        });
      } else if (avgDifficulty < 3) {
        improvements.push({
          area: 'difficulty',
          priority: 'medium',
          suggestion: 'Lesson is too easy - add more advanced concepts and challenges',
          confidence: 0.75
        });
      }
    }

    // Analyze quality metrics
    const qualityIssues = completions.filter(c => {
      const metrics = c.lesson_quality_metrics;
      if (!metrics) return false;
      
      try {
        const parsed = typeof metrics === 'string' ? JSON.parse(metrics) : metrics;
        return parsed.clarity < 3 || parsed.usefulness < 3;
      } catch {
        return false;
      }
    });

    if (qualityIssues.length > completions.length * 0.3) {
      improvements.push({
        area: 'clarity',
        priority: 'high',
        suggestion: 'Improve explanation clarity and practical usefulness',
        confidence: 0.9
      });
    }

    // Analyze text feedback for common themes
    const feedbackTexts = completions
      .map(c => c.feedback_text)
      .filter((f): f is string => f !== undefined && f !== null && f.length > 10);

    if (feedbackTexts.length > 0) {
      const commonIssues = this.extractCommonFeedbackThemes(feedbackTexts);
      improvements.push(...commonIssues);
    }

    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Extract common themes from user feedback text
   */
  private extractCommonFeedbackThemes(feedbackTexts: string[]): LessonImprovementSuggestion[] {
    const improvements: LessonImprovementSuggestion[] = [];
    const allFeedback = feedbackTexts.join(' ').toLowerCase();

    // Common improvement keywords
    const patterns = [
      {
        keywords: ['confusing', 'unclear', 'hard to understand', 'complex'],
        suggestion: 'Simplify explanations and add clearer examples',
        area: 'clarity' as const,
        priority: 'high' as const
      },
      {
        keywords: ['boring', 'dry', 'uninteresting', 'dull'],
        suggestion: 'Add more engaging content and interactive elements',
        area: 'engagement' as const,
        priority: 'high' as const
      },
      {
        keywords: ['too long', 'lengthy', 'takes forever', 'too much text'],
        suggestion: 'Break content into shorter, digestible sections',
        area: 'structure' as const,
        priority: 'medium' as const
      },
      {
        keywords: ['more examples', 'need examples', 'practical examples'],
        suggestion: 'Add more real-world examples and practical applications',
        area: 'content' as const,
        priority: 'medium' as const
      },
      {
        keywords: ['outdated', 'old information', 'not current'],
        suggestion: 'Update content with latest information and trends',
        area: 'content' as const,
        priority: 'high' as const
      }
    ];

    patterns.forEach(pattern => {
      const matchCount = pattern.keywords.filter(keyword => 
        allFeedback.includes(keyword)
      ).length;

      if (matchCount > 0) {
        improvements.push({
          area: pattern.area,
          priority: pattern.priority,
          suggestion: pattern.suggestion,
          confidence: Math.min(0.9, 0.5 + (matchCount * 0.2))
        });
      }
    });

    return improvements;
  }

  /**
   * Automatically update lesson content based on improvement suggestions
   */
  private async autoUpdateLesson(lesson_id: string, improvements: LessonImprovementSuggestion[], completions: LessonCompletion[]) {
    try {
      // Get current lesson content
      const { data: currentLesson, error } = await supabase
        .from('daily_lessons')
        .select('*')
        .eq('lesson_id', lesson_id)
        .single();

      if (error || !currentLesson) {
        throw new Error(`Could not fetch lesson ${lesson_id}`);
      }

      // Generate improved content using AI
      const improvedContent = await this.generateImprovedContent(
        currentLesson,
        improvements,
        completions
      );

      if (improvedContent) {
        // Update lesson in database
        const { data: updatedLesson, error: updateError } = await supabase
          .from('daily_lessons')
          .update({
            title: improvedContent.title || currentLesson.title,
            content: improvedContent.content,
            updated_at: new Date().toISOString(),
            // Track improvement history
            improvement_history: [
              ...(currentLesson.improvement_history || []),
              {
                timestamp: new Date().toISOString(),
                improvements: improvements.map(i => i.area),
                trigger: 'auto_update',
                feedback_count: completions.length
              }
            ]
          })
          .eq('lesson_id', lesson_id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Auto-updated lesson ${lesson_id} with ${improvements.length} improvements`);
        return updatedLesson;
      }

      return null;
    } catch (error) {
      console.error(`Failed to auto-update lesson ${lesson_id}:`, error);
      return null;
    }
  }

  /**
   * Generate improved content using AI
   */
  private async generateImprovedContent(
    currentLesson: LessonData,
    improvements: LessonImprovementSuggestion[],
    completions: LessonCompletion[]
  ) {
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey || openaiKey.includes('your_openai') || !openaiKey.startsWith('sk-')) {
      console.log('OpenAI not configured for lesson auto-updates');
      return null;
    }

    try {
      const improvementAreas = improvements.map(i => `${i.area}: ${i.suggestion}`).join('\n');
      const userFeedback = completions
        .map(c => c.feedback_text)
        .filter(f => f)
        .slice(0, 5) // Use top 5 feedback entries
        .join('\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational content improver for AI Mind OS. Your job is to enhance lessons based on user feedback and performance metrics. 

Make lessons:
- More engaging and interactive
- Clearer and easier to understand  
- Appropriately challenging
- Rich with practical examples
- Well-structured and scannable

Maintain the core learning objectives while dramatically improving user experience.`
            },
            {
              role: 'user',
              content: `CURRENT LESSON:
Title: ${currentLesson.title}
Content: ${currentLesson.content}

IMPROVEMENT AREAS NEEDED:
${improvementAreas}

USER FEEDBACK:
${userFeedback}

Please rewrite this lesson to address all the improvement areas. Make it significantly more engaging, clear, and valuable. Return ONLY a JSON object with "title" and "content" fields.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiData = await response.json();
      const improvedContent = aiData?.choices?.[0]?.message?.content;

      if (improvedContent) {
        try {
          return JSON.parse(improvedContent);
        } catch {
          // If not valid JSON, wrap content
          return {
            title: currentLesson.title,
            content: improvedContent
          };
        }
      }

      return null;
    } catch (error) {
      console.error('AI content improvement failed:', error);
      return null;
    }
  }

  /**
   * Log lesson update for tracking and analytics
   */
  private async logLessonUpdate(lesson_id: string, updateData: UpdateData) {
    try {
      await supabase
        .from('lesson_update_log')
        .insert({
          lesson_id,
          update_data: updateData,
          created_at: new Date().toISOString()
        });

      console.log(`📝 Logged lesson update for ${lesson_id}`);
    } catch (error) {
      console.error('Failed to log lesson update:', error);
    }
  }

  /**
   * Schedule automatic lesson analysis (call this from a cron job)
   */
  async analyzeAllLessons() {
    try {
      // Get all lessons that have recent completions
      const { data: recentLessons, error } = await supabase
        .from('daily_lessons')
        .select('lesson_id')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error || !recentLessons) {
        console.log('No recent lessons found for analysis');
        return;
      }

      console.log(`🔍 Analyzing ${recentLessons.length} lessons for auto-updates...`);

      const results = [];
      for (const lesson of recentLessons) {
        const result = await this.analyzeLessonPerformance(lesson.lesson_id);
        if (result) {
          results.push({ lesson_id: lesson.lesson_id, ...result });
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const updatedCount = results.filter(r => r.updated).length;
      console.log(`✅ Auto-update analysis complete: ${updatedCount}/${results.length} lessons updated`);

      return results;
    } catch (error) {
      console.error('Auto-analysis error:', error);
      return null;
    }
  }

  /**
   * Enhanced analysis with Research AI integration
   */
  async analyzeAndUpdateWithResearch(lessonId: string): Promise<AutoUpdateResult | null> {
    console.log(`🔬 [LessonAutoUpdater] Analyzing ${lessonId} with research AI...`);

    try {
      // First do regular performance analysis
      const performanceResult = await this.analyzeLessonPerformance(lessonId);
      
      if (!performanceResult) {
        return null;
      }

      // Get lesson content for research analysis
      const lessonContent = await this.getLessonContent(lessonId);
      if (!lessonContent) {
        console.warn(`[LessonAutoUpdater] Could not retrieve content for lesson ${lessonId}`);
        return performanceResult;
      }

      // Use Research AI to find current news and developments
      const researchUpdates = await researchAI.generateUpdateSuggestions(
        lessonId, 
        lessonContent.topic || 'General AI/Technology', 
        lessonContent.content || ''
      );

      // If we have research updates, apply them
      if (researchUpdates.length > 0) {
        console.log(`📰 [ResearchAI] Found ${researchUpdates.length} research-based updates for ${lessonId}`);
        
        // Apply research updates to content
        const enhancedContent = await researchAI.applyResearchUpdates(
          lessonId,
          lessonContent.content || '',
          researchUpdates
        );

        // Update lesson with research-enhanced content
        await this.updateLessonContent(lessonId, enhancedContent, researchUpdates);

        return {
          ...performanceResult,
          updated: true,
          research_enhanced: true,
          research_updates: researchUpdates.length,
          improvements: [
            ...(performanceResult.improvements || []),
            ...researchUpdates.map(update => ({
              area: `Research: ${update.update_type}`,
              reason: update.research_summary,
              priority: update.priority
            }))
          ]
        };
      }

      return performanceResult;
    } catch (error) {
      console.error(`[LessonAutoUpdater] Research analysis failed for ${lessonId}:`, error);
      // Fallback to regular performance analysis
      return await this.analyzeLessonPerformance(lessonId);
    }
  }

  private async getLessonContent(lessonId: string): Promise<{ topic: string; content: string } | null> {
    if (!supabase) {
      // Mock lesson content
      return {
        topic: "Artificial Intelligence Fundamentals",
        content: "This lesson covers the basics of AI, including machine learning, neural networks, and practical applications in modern technology."
      };
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('title, content, description')
        .eq('id', lessonId)
        .single();

      if (error || !data) {
        console.warn(`[LessonAutoUpdater] Could not fetch lesson content: ${error?.message}`);
        return null;
      }

      return {
        topic: data.title || lessonId,
        content: data.content || data.description || ''
      };
    } catch (error) {
      console.error(`[LessonAutoUpdater] Error fetching lesson content:`, error);
      return null;
    }
  }

  private async updateLessonContent(lessonId: string, newContent: string, researchUpdates: ResearchUpdate[]): Promise<void> {
    if (!supabase) {
      console.log(`[MOCK] Would update lesson ${lessonId} with research-enhanced content`);
      console.log(`[MOCK] Research updates applied: ${researchUpdates.length}`);
      return;
    }

    try {
      const updateData: Record<string, unknown> = {
        content: newContent,
        updated_at: new Date().toISOString(),
        research_updated: true,
        research_update_count: researchUpdates.length
      };

      // Add research metadata
      if (researchUpdates.length > 0) {
        updateData.research_metadata = JSON.stringify({
          last_research_update: new Date().toISOString(),
          updates_applied: researchUpdates.map(update => ({
            type: update.update_type,
            priority: update.priority,
            summary: update.research_summary,
            sections_updated: update.content_updates.length
          }))
        });
      }

      const { error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', lessonId);

      if (error) {
        console.error(`[LessonAutoUpdater] Failed to update lesson content:`, error);
      } else {
        console.log(`✅ [LessonAutoUpdater] Successfully updated lesson ${lessonId} with research content`);
      }
    } catch (error) {
      console.error(`[LessonAutoUpdater] Error updating lesson content:`, error);
    }
  }
}

// Export singleton instance
export const lessonAutoUpdater = new LessonAutoUpdater();
