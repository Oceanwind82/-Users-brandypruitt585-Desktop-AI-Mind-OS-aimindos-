import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/missions/stats - Get mission statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get mission statistics
    const [
      { data: activeMissions },
      { data: completedToday },
      { data: totalCompleted },
      { data: streakData }
    ] = await Promise.all([
      // Active missions
      supabase
        .from('user_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active'),
      
      // Completed today
      supabase
        .from('user_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', `${today}T00:00:00Z`)
        .lt('completed_at', `${today}T23:59:59Z`),
      
      // Total completed
      supabase
        .from('user_missions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed'),
      
      // Streak data (simplified - get user profile)
      supabase
        .from('profiles')
        .select('mission_streak')
        .eq('id', userId)
        .single()
    ]);

    const stats = {
      active_missions: activeMissions?.length || 0,
      completed_today: completedToday?.length || 0,
      total_completed: totalCompleted?.length || 0,
      streak_days: streakData?.mission_streak || 0
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in missions stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
