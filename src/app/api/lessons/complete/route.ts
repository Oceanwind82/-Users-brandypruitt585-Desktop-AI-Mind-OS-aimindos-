import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

interface LessonCompleteRequest {
  user_id: string;
  lesson_id: string;
  score?: number;
  time_spent?: number;
  baseXp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LessonCompleteRequest;
    const { user_id, lesson_id, score = 100, time_spent = 0, baseXp = 100 } = body;

    if (!user_id || !lesson_id) {
      return NextResponse.json(
        { error: 'user_id and lesson_id are required' },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      // Mock response for development
      console.log(`[MOCK] Lesson completion:`, { user_id, lesson_id, score, time_spent });

      const mockResult = {
        lesson_id,
        user_id,
        xp_awarded: baseXp,
        total_xp: 1250 + baseXp,
        level: Math.floor((1250 + baseXp) / 500) + 1,
        level_progress: ((1250 + baseXp) % 500) / 500,
        streak: 7,
        completed_at: new Date().toISOString()
      };

      // Send notification even in mock mode
      const notificationMessage = `✅ [MOCK] Lesson Complete\n` +
        `👤 ${user_id}\n` +
        `📚 ${lesson_id}\n` +
        `⚡ +${baseXp} XP • Streak ${mockResult.streak}\n` +
        `📊 Score: ${score}% • Time: ${Math.round(time_spent / 60)}min`;

      await notify(notificationMessage);

      // Optional: N8N webhook for automation (mock)
      if (process.env.N8N_WEBHOOK_COMPLETE) {
        console.log(`[MOCK] Would trigger N8N webhook:`, {
          user_id,
          lesson_id,
          result: mockResult,
          timestamp: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        result: mockResult,
        message: 'Lesson completion recorded successfully (mock mode)',
        mock: true
      });
    }

    // Insert lesson completion record
    const { data, error } = await supabase!
      .from('daily_lessons')
      .insert({
        user_id,
        lesson_id,
        score,
        time_spent,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Lesson completion insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record lesson completion' },
        { status: 500 }
      );
    }

    // Award XP (simplified calculation)
    const xpAwarded = Math.floor(baseXp * (score / 100));
    
    // Send notification
    const notificationMessage = `✅ Lesson Complete\n` +
      `👤 ${user_id}\n` +
      `📚 ${lesson_id}\n` +
      `⚡ +${xpAwarded} XP\n` +
      `📊 Score: ${score}% • Time: ${Math.round(time_spent / 60)}min`;

    await notify(notificationMessage);

    // Optional: N8N webhook for automation
    try {
      if (process.env.N8N_WEBHOOK_COMPLETE) {
        await fetch(process.env.N8N_WEBHOOK_COMPLETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            lesson_id,
            result: {
              lesson_id,
              user_id,
              xp_awarded: xpAwarded,
              score,
              time_spent,
              completed_at: data.completed_at
            },
            timestamp: new Date().toISOString()
          })
        });
        console.log('📡 N8N webhook triggered for lesson completion');
      }
    } catch (webhookError) {
      console.warn('N8N webhook failed (non-critical):', webhookError);
    }

    return NextResponse.json({
      success: true,
      result: {
        lesson_id,
        user_id,
        xp_awarded: xpAwarded,
        score,
        time_spent,
        completed_at: data.completed_at
      },
      message: 'Lesson completion recorded successfully'
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
