import { NextRequest, NextResponse } from 'next/server';
import { lessonAutoUpdater } from '@/lib/lesson-auto-updater';
import { notify } from '@/lib/notify';

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🤖 Starting automated lesson analysis and updates...');

    // Run comprehensive lesson analysis
    const results = await lessonAutoUpdater.analyzeAllLessons();

    if (!results) {
      console.log('❌ Lesson analysis failed');
      return NextResponse.json(
        { success: false, error: 'Analysis failed' },
        { status: 500 }
      );
    }

    const updatedCount = results.filter(r => r.updated).length;
    const totalLessons = results.length;

    console.log(`✅ Lesson auto-update complete: ${updatedCount}/${totalLessons} lessons updated`);

    // Send summary notification
    if (updatedCount > 0) {
      await notify(`🤖 LESSON AUTO-UPDATE SUMMARY\n` +
        `📊 Analyzed: ${totalLessons} lessons\n` +
        `🔄 Updated: ${updatedCount} lessons\n` +
        `📈 Improvements: Content clarity, engagement, difficulty optimization\n` +
        `🎯 Result: Lessons are now even more amazing!\n` +
        `⏰ Next analysis: 24 hours`);
    }

    return NextResponse.json({
      success: true,
      results: {
        total_analyzed: totalLessons,
        lessons_updated: updatedCount,
        update_rate: Math.round((updatedCount / totalLessons) * 100),
        updated_lessons: results
          .filter(r => r.updated)
          .map(r => ({
            lesson_id: r.lesson_id,
            previous_score: r.previous_score,
            improvements: r.improvements?.map(i => i.area) || []
          }))
      },
      message: `Successfully analyzed ${totalLessons} lessons and updated ${updatedCount}`,
      next_analysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Lesson auto-update cron error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Send error notification
    await notify(`🔥 Lesson auto-update error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { 
        success: false, 
        error: 'Auto-update process failed',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (for testing and manual updates)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const lesson_id = url.searchParams.get('lesson_id');

    if (action === 'analyze' && lesson_id) {
      // Analyze specific lesson
      const result = await lessonAutoUpdater.analyzeLessonPerformance(lesson_id);
      
      return NextResponse.json({
        success: true,
        lesson_id,
        analysis: result,
        message: result?.updated ? 'Lesson was updated!' : 'Lesson analysis complete'
      });
    }

    if (action === 'status') {
      // Return auto-update system status
      return NextResponse.json({
        success: true,
        status: 'operational',
        auto_updates_enabled: true,
        improvement_threshold: 90,
        min_feedback_count: 5,
        last_analysis: new Date().toISOString(),
        features: [
          'Automatic content improvement based on user feedback',
          'AI-powered lesson enhancement',
          'Performance-based content optimization', 
          'Real-time quality monitoring',
          'Continuous learning integration'
        ]
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson Auto-Update System',
      endpoints: {
        'POST /api/lessons/auto-update': 'Run scheduled lesson analysis and updates',
        'GET /api/lessons/auto-update?action=analyze&lesson_id=X': 'Analyze specific lesson',
        'GET /api/lessons/auto-update?action=status': 'System status and configuration'
      },
      documentation: 'Lessons automatically update based on user feedback and performance metrics'
    });

  } catch (error) {
    console.error('Lesson auto-update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
