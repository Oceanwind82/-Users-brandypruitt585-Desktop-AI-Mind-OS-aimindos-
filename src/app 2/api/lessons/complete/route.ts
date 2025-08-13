import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notify } from '@/lib/notify';
import { retry } from '@/lib/utils';
import { lessonAutoUpdater } from '@/lib/lesson-auto-updater';

// Mock mode for development
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key' ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_new_service_role_key' ||
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_new_anon_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LessonCompleteRequest {
  user_id: string;
  lesson_id: string;
  score?: number;
  time_spent?: number;
  baseXp?: number;
  satisfaction_rating?: number; // 1-5 scale for lesson quality
  difficulty_rating?: number; // 1-10 scale for perceived difficulty
  engagement_score?: number; // 1-10 scale for how engaging the lesson was
  feedback_text?: string; // Optional text feedback
  lesson_quality_metrics?: {
    clarity: number; // 1-5 scale
    usefulness: number; // 1-5 scale
    pace: number; // 1-5 scale (too slow=1, perfect=3, too fast=5)
    would_recommend: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LessonCompleteRequest;
    const { 
      user_id, 
      lesson_id, 
      score = 100, 
      time_spent = 0, 
      baseXp = 100,
      satisfaction_rating,
      difficulty_rating,
      engagement_score,
      feedback_text,
      lesson_quality_metrics
    } = body;

    if (!user_id || !lesson_id) {
      return NextResponse.json(
        { error: 'user_id and lesson_id are required' },
        { status: 400 }
      );
    }

    // Calculate lesson amazingness score
    const calculateAmazingnessScore = () => {
      let amazingness = score; // Start with performance score
      
      if (satisfaction_rating) {
        amazingness += (satisfaction_rating / 5) * 20; // Up to 20 bonus points
      }
      
      if (engagement_score) {
        amazingness += (engagement_score / 10) * 15; // Up to 15 bonus points
      }
      
      if (lesson_quality_metrics) {
        const { clarity, usefulness, pace, would_recommend } = lesson_quality_metrics;
        const qualityAvg = (clarity + usefulness + (pace === 3 ? 5 : Math.abs(3 - pace))) / 3;
        amazingness += (qualityAvg / 5) * 15; // Up to 15 bonus points
        if (would_recommend) amazingness += 10; // 10 bonus for recommendation
      }
      
      return Math.min(150, Math.round(amazingness)); // Cap at 150 for "amazing" lessons
    };

    const amazingnessScore = calculateAmazingnessScore();
    
    // Determine lesson quality tier
    const getLessonQualityTier = (score: number) => {
      if (score >= 130) return { tier: "🌟 ABSOLUTELY AMAZING", emoji: "🌟", description: "This lesson is extraordinary!" };
      if (score >= 110) return { tier: "⭐ AMAZING", emoji: "⭐", description: "This lesson is truly outstanding!" };
      if (score >= 90) return { tier: "✨ EXCELLENT", emoji: "✨", description: "This lesson is fantastic!" };
      if (score >= 75) return { tier: "👍 GREAT", emoji: "👍", description: "This lesson is really good!" };
      if (score >= 60) return { tier: "👌 GOOD", emoji: "👌", description: "This lesson is solid!" };
      return { tier: "📈 IMPROVING", emoji: "📈", description: "This lesson has potential!" };
    };

    const qualityTier = getLessonQualityTier(amazingnessScore);

    if (MOCK_MODE) {
      // Mock response for development
      console.log(`[MOCK] Lesson completion:`, { user_id, lesson_id, score, time_spent, amazingnessScore });

      const mockResult = {
        lesson_id,
        user_id,
        xp_awarded: baseXp,
        total_xp: 1250 + baseXp,
        level: Math.floor((1250 + baseXp) / 500) + 1,
        level_progress: ((1250 + baseXp) % 500) / 500,
        streak: 7,
        completed_at: new Date().toISOString(),
        amazingness_score: amazingnessScore,
        quality_tier: qualityTier,
        lesson_insights: {
          performance_rating: score >= 80 ? "Excellent performance!" : "Good effort!",
          engagement_level: engagement_score ? `Engagement: ${engagement_score}/10` : "Engagement not tracked",
          satisfaction_level: satisfaction_rating ? `Satisfaction: ${satisfaction_rating}/5 stars` : "Satisfaction not rated",
          difficulty_feedback: difficulty_rating ? `Difficulty felt: ${difficulty_rating}/10` : "Difficulty not rated",
          user_feedback: feedback_text || "No feedback provided",
          recommendation_status: lesson_quality_metrics?.would_recommend ? "User would recommend this lesson!" : "Recommendation not provided"
        }
      };

      // Enhanced notification with amazingness metrics
      const notificationMessage = `${qualityTier.emoji} ${qualityTier.tier} LESSON COMPLETE!\n` +
        `👤 ${user_id}\n` +
        `📚 ${lesson_id}\n` +
        `⚡ +${baseXp} XP • Streak ${mockResult.streak}\n` +
        `🌟 Amazingness Score: ${amazingnessScore}/150\n` +
        `📊 Performance: ${score}% • Time: ${Math.round(time_spent / 60)}min\n` +
        `💫 ${qualityTier.description}` +
        (satisfaction_rating ? `\n⭐ Satisfaction: ${satisfaction_rating}/5` : '') +
        (engagement_score ? `\n🎯 Engagement: ${engagement_score}/10` : '') +
        (feedback_text ? `\n💬 "${feedback_text.substring(0, 50)}${feedback_text.length > 50 ? '...' : ''}"` : '');

      await notify(notificationMessage);

      // Optional: N8N webhook for automation (mock)
      if (process.env.N8N_WEBHOOK_COMPLETE) {
        console.log(`[MOCK] Would trigger N8N webhook:`, {
          user_id,
          lesson_id,
          result: mockResult,
          amazingness_metrics: {
            score: amazingnessScore,
            tier: qualityTier.tier,
            satisfaction: satisfaction_rating,
            engagement: engagement_score,
            difficulty: difficulty_rating,
            feedback: feedback_text
          },
          timestamp: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        result: mockResult,
        message: `${qualityTier.description} Lesson completion recorded successfully (mock mode)`,
        amazingness_insights: {
          score: amazingnessScore,
          tier: qualityTier.tier,
          description: qualityTier.description,
          is_amazing: amazingnessScore >= 110,
          performance_analysis: score >= 90 ? "Outstanding performance!" : score >= 75 ? "Great job!" : "Keep improving!",
          engagement_analysis: engagement_score ? (engagement_score >= 8 ? "Highly engaging lesson!" : engagement_score >= 6 ? "Good engagement" : "Could be more engaging") : "Engagement not measured"
        },
        mock: true
      });
    }

    // Insert lesson completion record with retry logic and enhanced data
    const { data, error } = await retry(async () => {
      const result = await supabase!
        .from('daily_lessons')
        .insert({
          user_id,
          lesson_id,
          score,
          time_spent,
          completed_at: new Date().toISOString(),
          // Enhanced metrics for amazingness tracking
          amazingness_score: amazingnessScore,
          quality_tier: qualityTier.tier,
          satisfaction_rating,
          difficulty_rating,
          engagement_score,
          feedback_text,
          lesson_quality_metrics: lesson_quality_metrics ? JSON.stringify(lesson_quality_metrics) : null
        })
        .select()
        .single();
      
      if (result.error) {
        throw new Error(`Supabase insert failed: ${result.error.message}`);
      }
      
      return result;
    }, 3, 1000); // 3 retries with 1s, 2s, 3s delays

    if (error) {
      console.error('Lesson completion insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record lesson completion' },
        { status: 500 }
      );
    }

    // Award XP with amazingness bonus
    const baseXpAwarded = Math.floor(baseXp * (score / 100));
    const amazingnessBonus = amazingnessScore >= 110 ? Math.floor(baseXpAwarded * 0.5) : 0; // 50% bonus for amazing lessons
    const totalXpAwarded = baseXpAwarded + amazingnessBonus;
    
    // Enhanced notification with amazingness metrics
    const notificationMessage = `${qualityTier.emoji} ${qualityTier.tier} LESSON COMPLETE!\n` +
      `👤 ${user_id}\n` +
      `📚 ${lesson_id}\n` +
      `⚡ +${totalXpAwarded} XP` + (amazingnessBonus > 0 ? ` (+${amazingnessBonus} amazing bonus!)` : '') + `\n` +
      `🌟 Amazingness Score: ${amazingnessScore}/150\n` +
      `📊 Performance: ${score}% • Time: ${Math.round(time_spent / 60)}min\n` +
      `💫 ${qualityTier.description}` +
      (satisfaction_rating ? `\n⭐ Satisfaction: ${satisfaction_rating}/5` : '') +
      (engagement_score ? `\n🎯 Engagement: ${engagement_score}/10` : '') +
      (lesson_quality_metrics?.would_recommend ? `\n🏆 User recommends this lesson!` : '') +
      (feedback_text ? `\n💬 "${feedback_text.substring(0, 50)}${feedback_text.length > 50 ? '...' : ''}"` : '');

    await retry(() => notify(notificationMessage), 2, 500); // 2 retries for notifications

    // Trigger automatic lesson analysis for continuous improvement with Research AI
    try {
      // Enhanced analysis with Research AI integration for more comprehensive updates
      const updateResult = await lessonAutoUpdater.analyzeAndUpdateWithResearch(lesson_id);
      
      if (updateResult?.updated) {
        const updateType = updateResult.research_enhanced ? 'RESEARCH + FEEDBACK' : 'FEEDBACK ONLY';
        console.log(`🔄 Lesson ${lesson_id} was auto-updated based on ${updateType} analysis`);
        
        // Send notification about lesson improvement
        const researchInfo = updateResult.research_enhanced 
          ? `\n📰 Research Updates: ${updateResult.research_updates || 0} current developments integrated`
          : '';
        
        await notify(`🔄 LESSON AUTO-UPDATED!\n` +
          `📚 ${lesson_id}\n` +
          `📈 Previous Score: ${updateResult.previous_score}/150\n` +
          `🛠️ Improvements: ${updateResult.improvements?.map(i => i.area).join(', ') || 'Multiple areas'}\n` +
          `🤖 Update Type: ${updateType}${researchInfo}\n` +
          `✨ AI continuously improves lessons with latest information!`);
      } else if (updateResult) {
        console.log(`📊 Lesson ${lesson_id} analysis: Score ${updateResult.score}/150 (${updateResult.status})`);
      }
    } catch (autoUpdateError) {
      console.warn('Lesson auto-update analysis failed (non-critical):', autoUpdateError);
    }

    // Optional: N8N webhook for automation with retry
    try {
      if (process.env.N8N_WEBHOOK_COMPLETE) {
        await retry(async () => {
          const response = await fetch(process.env.N8N_WEBHOOK_COMPLETE!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id,
              lesson_id,
              result: {
                lesson_id,
                user_id,
                xp_awarded: totalXpAwarded,
                amazingness_score: amazingnessScore,
                quality_tier: qualityTier.tier,
                score,
                time_spent,
                satisfaction_rating,
                engagement_score,
                completed_at: data.completed_at
              },
              timestamp: new Date().toISOString()
            })
          });
          
          if (!response.ok) {
            throw new Error(`Webhook failed with status ${response.status}`);
          }
          
          return response;
        }, 2, 1000); // 2 retries for webhook calls
        
        console.log('📡 N8N webhook triggered for lesson completion');
      }
    } catch (webhookError) {
      console.warn('N8N webhook failed after retries (non-critical):', webhookError);
    }

    return NextResponse.json({
      success: true,
      result: {
        lesson_id,
        user_id,
        xp_awarded: totalXpAwarded,
        amazingness_score: amazingnessScore,
        quality_tier: qualityTier.tier,
        score,
        time_spent,
        completed_at: data.completed_at
      },
      amazingness_insights: {
        score: amazingnessScore,
        tier: qualityTier.tier,
        description: qualityTier.description,
        is_amazing: amazingnessScore >= 110,
        xp_bonus_earned: amazingnessBonus,
        performance_analysis: score >= 90 ? "Outstanding performance! 🌟" : score >= 75 ? "Great job! ⭐" : "Keep improving! 📈",
        engagement_analysis: engagement_score ? (engagement_score >= 8 ? "Highly engaging lesson! 🔥" : engagement_score >= 6 ? "Good engagement 👍" : "Could be more engaging 💡") : "Engagement not measured",
        satisfaction_analysis: satisfaction_rating ? (satisfaction_rating >= 4 ? "Very satisfied! 😊" : satisfaction_rating >= 3 ? "Satisfied 👌" : "Room for improvement 🔧") : "Satisfaction not rated",
        recommendation_status: lesson_quality_metrics?.would_recommend ? "User would recommend this lesson! 🏆" : "Recommendation not provided"
      },
      message: `${qualityTier.description} Lesson completion recorded successfully`
    });

  } catch (error) {
    console.error('Lesson completion API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Send error notification
    await notify(`🔥 Lesson completion error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
