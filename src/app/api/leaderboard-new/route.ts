import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get global leaderboard (top users by total XP)
    const { data: globalLeaderboard, error: globalError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, current_level, total_xp, weekly_xp, daily_xp')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (globalError) {
      console.error('Error fetching global leaderboard:', globalError);
      return NextResponse.json({ error: 'Failed to fetch global leaderboard' }, { status: 500 });
    }

    // Get weekly leaderboard (top users by weekly XP)
    const { data: weeklyLeaderboard, error: weeklyError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, current_level, total_xp, weekly_xp, daily_xp')
      .order('weekly_xp', { ascending: false })
      .limit(limit);

    if (weeklyError) {
      console.error('Error fetching weekly leaderboard:', weeklyError);
      return NextResponse.json({ error: 'Failed to fetch weekly leaderboard' }, { status: 500 });
    }

    // Get daily leaderboard (top users by daily XP)
    const { data: dailyLeaderboard, error: dailyError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, current_level, total_xp, weekly_xp, daily_xp')
      .order('daily_xp', { ascending: false })
      .limit(limit);

    if (dailyError) {
      console.error('Error fetching daily leaderboard:', dailyError);
      return NextResponse.json({ error: 'Failed to fetch daily leaderboard' }, { status: 500 });
    }

    // Get current user's rank if userId provided
    let currentUserGlobalRank = 0;
    let totalUsers = 0;

    if (userId) {
      // Get total user count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      totalUsers = count || 0;

      // Get current user's global rank
      const { data: userRankData } = await supabase
        .from('profiles')
        .select('total_xp')
        .gt('total_xp', globalLeaderboard?.find(u => u.id === userId)?.total_xp || 0);
      
      currentUserGlobalRank = (userRankData?.length || 0) + 1;
    }

    // Format leaderboard data
    const formatLeaderboard = (data: Array<{
      id: string;
      name?: string;
      avatar_url?: string;
      current_level?: number;
      total_xp?: number;
      weekly_xp?: number;
      daily_xp?: number;
    }>) => {
      return data.map((user, index) => ({
        id: user.id,
        name: user.name || 'Anonymous',
        avatar: user.avatar_url,
        level: user.current_level || 1,
        total_xp: user.total_xp || 0,
        weekly_xp: user.weekly_xp || 0,
        daily_xp: user.daily_xp || 0,
        rank: index + 1,
        badge: getBadgeForLevel(user.current_level || 1),
        is_current_user: user.id === userId
      }));
    };

    const leaderboardData = {
      global: formatLeaderboard(globalLeaderboard || []),
      weekly: formatLeaderboard(weeklyLeaderboard || []),
      daily: formatLeaderboard(dailyLeaderboard || []),
      current_user_global_rank: currentUserGlobalRank,
      total_users: totalUsers
    };

    return NextResponse.json({ leaderboard: leaderboardData });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get badge emoji based on level
function getBadgeForLevel(level: number): string {
  if (level >= 50) return '👑'; // Legend
  if (level >= 40) return '💎'; // Master
  if (level >= 30) return '🏆'; // Expert
  if (level >= 20) return '🥇'; // Advanced
  if (level >= 10) return '🥈'; // Intermediate
  return '🥉'; // Beginner
}
