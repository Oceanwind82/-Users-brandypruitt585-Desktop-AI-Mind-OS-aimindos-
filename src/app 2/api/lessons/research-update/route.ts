/**
 * Research AI Scheduled Updates - Cron Job Endpoint
 * Automatically monitors world news and updates lessons with current information
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notify } from '@/lib/notify';
import { researchAI, monitorAllLessons } from '@/lib/research-ai';
import { lessonAutoUpdater } from '@/lib/lesson-auto-updater';

// Mock mode for development
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ResearchUpdateJob {
  started_at: string;
  lessons_analyzed: number;
  lessons_updated: number;
  research_updates_applied: number;
  processing_time_ms: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔬 [ResearchAI] Starting scheduled research update job...');
    
    // Verify cron job authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-123';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️ [ResearchAI] Unauthorized cron job access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobResult: ResearchUpdateJob = {
      started_at: new Date().toISOString(),
      lessons_analyzed: 0,
      lessons_updated: 0,
      research_updates_applied: 0,
      processing_time_ms: 0,
      status: 'success',
      errors: []
    };

    if (MOCK_MODE) {
      // Mock research update job
      console.log('🧪 [MOCK] Running research update simulation...');
      
      const mockLessons = [
        { 
          id: 'intro-to-ai', 
          topic: 'Introduction to Artificial Intelligence',
          content: 'Basic AI concepts and applications...',
          last_updated: '2025-08-01T10:00:00Z'
        },
        { 
          id: 'machine-learning-basics', 
          topic: 'Machine Learning Fundamentals',
          content: 'Core ML algorithms and techniques...',
          last_updated: '2025-08-02T14:30:00Z'
        },
        { 
          id: 'ai-ethics', 
          topic: 'AI Ethics and Responsible AI',
          content: 'Ethical considerations in AI development...',
          last_updated: '2025-08-03T09:15:00Z'
        }
      ];

      jobResult.lessons_analyzed = mockLessons.length;

      // Simulate research updates for outdated lessons
      for (const lesson of mockLessons) {
        const daysSinceUpdate = (Date.now() - new Date(lesson.last_updated).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpdate > 7) {
          const updates = await researchAI.generateUpdateSuggestions(lesson.id, lesson.topic, lesson.content);
          
          if (updates.length > 0) {
            jobResult.lessons_updated++;
            jobResult.research_updates_applied += updates.length;
            
            console.log(`📰 [MOCK] Updated lesson "${lesson.id}" with ${updates.length} research updates`);
          }
        }
      }

      jobResult.processing_time_ms = Date.now() - startTime;
      jobResult.status = 'success';

      // Send notification about research updates
      await notify(`🔬 RESEARCH AI UPDATE COMPLETE!\n` +
        `📊 Lessons Analyzed: ${jobResult.lessons_analyzed}\n` +
        `🔄 Lessons Updated: ${jobResult.lessons_updated}\n` +
        `📰 Research Updates: ${jobResult.research_updates_applied}\n` +
        `⏱️ Processing Time: ${jobResult.processing_time_ms}ms\n` +
        `🤖 Your lessons are now current with latest developments!`);

      return NextResponse.json({
        success: true,
        job_result: jobResult,
        message: 'Research update job completed successfully (mock mode)',
        mock: true
      });
    }

    // Production research update process
    try {
      // 1. Get all lessons that might need research updates
      const { data: lessons, error: fetchError } = await supabase!
        .from('lessons')
        .select('id, title, content, description, updated_at, research_updated, research_update_count')
        .order('updated_at', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch lessons: ${fetchError.message}`);
      }

      if (!lessons || lessons.length === 0) {
        console.log('📚 [ResearchAI] No lessons found for research updates');
        return NextResponse.json({
          success: true,
          message: 'No lessons found for research updates',
          job_result: jobResult
        });
      }

      jobResult.lessons_analyzed = lessons.length;
      console.log(`🔍 [ResearchAI] Analyzing ${lessons.length} lessons for research opportunities...`);

      // 2. Monitor lessons for research update opportunities
      const lessonData = lessons.map(lesson => ({
        id: lesson.id,
        topic: lesson.title || lesson.id,
        content: lesson.content || lesson.description || '',
        last_updated: lesson.updated_at || new Date().toISOString()
      }));

      const researchUpdates = await monitorAllLessons(lessonData);
      
      if (researchUpdates.length === 0) {
        console.log('📊 [ResearchAI] No research updates needed at this time');
        jobResult.processing_time_ms = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          message: 'Research monitoring complete - no updates needed',
          job_result: jobResult
        });
      }

      console.log(`📰 [ResearchAI] Found ${researchUpdates.length} potential research updates`);

      // 3. Apply research updates to lessons
      const updatedLessons = new Set<string>();
      
      for (const update of researchUpdates) {
        try {
          // Use the enhanced auto-updater with research integration
          const result = await lessonAutoUpdater.analyzeAndUpdateWithResearch(update.lesson_id);
          
          if (result?.research_enhanced) {
            updatedLessons.add(update.lesson_id);
            jobResult.research_updates_applied += (result.research_updates || 0);
            console.log(`✅ [ResearchAI] Successfully updated lesson ${update.lesson_id} with research`);
          }
        } catch (updateError) {
          const errorMsg = `Failed to apply research update to lesson ${update.lesson_id}: ${updateError}`;
          console.error(`❌ [ResearchAI] ${errorMsg}`);
          jobResult.errors?.push(errorMsg);
        }
      }

      jobResult.lessons_updated = updatedLessons.size;
      jobResult.processing_time_ms = Date.now() - startTime;
      jobResult.status = jobResult.errors && jobResult.errors.length > 0 ? 'partial' : 'success';

      // 4. Send notification about research updates
      await notify(`🔬 RESEARCH AI UPDATE COMPLETE!\n` +
        `📊 Lessons Analyzed: ${jobResult.lessons_analyzed}\n` +
        `🔄 Lessons Updated: ${jobResult.lessons_updated}\n` +
        `📰 Research Updates: ${jobResult.research_updates_applied}\n` +
        `⏱️ Processing Time: ${jobResult.processing_time_ms}ms\n` +
        `${jobResult.status === 'success' ? '✅' : '⚠️'} Status: ${jobResult.status.toUpperCase()}\n` +
        `🤖 Your lessons are now current with latest developments!`);

      // 5. Log the research update job
      try {
        await supabase!
          .from('research_update_jobs')
          .insert({
            started_at: jobResult.started_at,
            completed_at: new Date().toISOString(),
            lessons_analyzed: jobResult.lessons_analyzed,
            lessons_updated: jobResult.lessons_updated,
            research_updates_applied: jobResult.research_updates_applied,
            processing_time_ms: jobResult.processing_time_ms,
            status: jobResult.status,
            errors: jobResult.errors?.length ? JSON.stringify(jobResult.errors) : null
          });
      } catch (logError) {
        console.warn('⚠️ [ResearchAI] Failed to log research update job:', logError);
      }

      return NextResponse.json({
        success: true,
        job_result: jobResult,
        message: `Research update job completed with status: ${jobResult.status}`
      });

    } catch (processingError) {
      jobResult.processing_time_ms = Date.now() - startTime;
      jobResult.status = 'failed';
      const errorMsg = `Research update job failed: ${processingError}`;
      jobResult.errors = [errorMsg];
      
      console.error('❌ [ResearchAI]', errorMsg);
      
      // Send error notification
      await notify(`🚨 RESEARCH AI ERROR!\n` +
        `❌ Job Status: FAILED\n` +
        `⏱️ Processing Time: ${jobResult.processing_time_ms}ms\n` +
        `💥 Error: ${errorMsg}\n` +
        `🔧 Manual intervention may be required`);

      return NextResponse.json({
        success: false,
        job_result: jobResult,
        error: errorMsg
      }, { status: 500 });
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('💥 [ResearchAI] Critical research update error:', error);
    
    // Send critical error notification
    await notify(`🚨 CRITICAL RESEARCH AI ERROR!\n` +
      `💥 System Error: ${errorMessage}\n` +
      `⏱️ Processing Time: ${processingTime}ms\n` +
      `🆘 Immediate attention required!`);

    return NextResponse.json(
      { 
        error: 'Critical research update system error',
        details: errorMessage,
        processing_time_ms: processingTime
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Research AI Scheduled Updates Endpoint',
    description: 'POST to this endpoint to trigger research-based lesson updates',
    features: [
      'Monitors world news and current events',
      'Automatically updates lesson content with latest information',
      'Integrates research findings into educational content', 
      'Maintains lesson relevance and accuracy',
      'Provides detailed update reports and notifications'
    ],
    schedule: 'Typically run daily via cron job',
    mock_mode: MOCK_MODE
  });
}
