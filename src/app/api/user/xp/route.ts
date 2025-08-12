import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/user/xp - Get user's XP and level information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user profile with XP data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp, current_level, daily_xp, weekly_xp')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Calculate level progression
    const currentLevel = profile?.current_level || 1;
    const totalXP = profile?.total_xp || 0;
    
    // XP required for levels (exponential growth)
    const xpForCurrentLevel = calculateXPForLevel(currentLevel - 1);
    const xpForNextLevel = calculateXPForLevel(currentLevel);
    
    // Determine rank based on level
    const rank = getRankFromLevel(currentLevel);

    const xpData = {
      current_xp: totalXP,
      current_level: currentLevel,
      xp_for_current_level: xpForCurrentLevel,
      xp_for_next_level: xpForNextLevel,
      total_xp_earned: totalXP,
      weekly_xp: profile?.weekly_xp || 0,
      daily_xp: profile?.daily_xp || 0,
      rank
    };

    return NextResponse.json({ xp: xpData });
  } catch (error) {
    console.error('Error in user XP API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/xp - Add XP to user
export async function POST(request: NextRequest) {
  try {
    const { userId, xpAmount, source } = await request.json();

    if (!userId || !xpAmount) {
      return NextResponse.json({ error: 'User ID and XP amount are required' }, { status: 400 });
    }

    // Add XP using stored procedure
    const { data, error } = await supabase.rpc('add_user_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_source: source || 'manual'
    });

    if (error) {
      console.error('Error adding XP:', error);
      return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'XP added successfully',
      data
    });
  } catch (error) {
    console.error('Error in user XP POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Calculate XP required for a specific level
function calculateXPForLevel(level: number): number {
  if (level <= 0) return 0;
  // Exponential growth: Level 1 = 100 XP, Level 2 = 250 XP, Level 3 = 450 XP, etc.
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Get rank based on level
function getRankFromLevel(level: number): string {
  if (level >= 50) return 'Legend';
  if (level >= 40) return 'Master';
  if (level >= 30) return 'Expert';
  if (level >= 20) return 'Advanced';
  if (level >= 10) return 'Intermediate';
  return 'Beginner';
}
