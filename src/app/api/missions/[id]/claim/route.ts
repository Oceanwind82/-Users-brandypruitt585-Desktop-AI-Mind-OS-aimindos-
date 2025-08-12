import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/missions/[id]/claim - Claim mission reward
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;

    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    // Get mission details
    const { data: userMission, error: missionError } = await supabase
      .from('user_missions')
      .select(`
        *,
        mission:missions(*)
      `)
      .eq('id', missionId)
      .single();

    if (missionError || !userMission) {
      console.error('Error fetching mission:', missionError);
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // Check if mission is completed and reward not claimed
    const isCompleted = userMission.current_progress >= userMission.mission.target_value;
    
    if (!isCompleted) {
      return NextResponse.json({ error: 'Mission not completed yet' }, { status: 400 });
    }

    if (userMission.status === 'completed' && userMission.reward_claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }

    // Claim reward
    const { error: updateError } = await supabase
      .from('user_missions')
      .update({
        status: 'completed',
        reward_claimed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', missionId);

    if (updateError) {
      console.error('Error updating mission:', updateError);
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
    }

    // Add XP to user profile
    const { error: xpError } = await supabase.rpc('add_user_xp', {
      p_user_id: userMission.user_id,
      p_xp_amount: userMission.mission.xp_reward
    });

    if (xpError) {
      console.error('Error adding XP:', xpError);
      // Don't fail the request, just log the error
    }

    // Update mission streak if daily mission
    if (userMission.mission.type === 'daily') {
      await updateMissionStreak(userMission.user_id);
    }

    return NextResponse.json({ 
      message: 'Reward claimed successfully',
      xp_earned: userMission.mission.xp_reward
    });
  } catch (error) {
    console.error('Error in claim mission reward API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateMissionStreak(userId: string) {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if user completed any daily mission yesterday
    const { data: yesterdayMissions } = await supabase
      .from('user_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', `${yesterday}T00:00:00Z`)
      .lt('completed_at', `${yesterday}T23:59:59Z`)
      .limit(1);

    const { data: profile } = await supabase
      .from('profiles')
      .select('mission_streak')
      .eq('id', userId)
      .single();

    let newStreak = 1;
    if (yesterdayMissions && yesterdayMissions.length > 0) {
      // Continue streak
      newStreak = (profile?.mission_streak || 0) + 1;
    }

    // Update profile with new streak
    await supabase
      .from('profiles')
      .update({ mission_streak: newStreak })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating mission streak:', error);
  }
}
