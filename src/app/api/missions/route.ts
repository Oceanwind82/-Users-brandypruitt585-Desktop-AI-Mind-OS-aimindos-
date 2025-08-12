import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/missions - Get user's missions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's missions with progress
    const { data: missions, error } = await supabase
      .from('user_missions')
      .select(`
        *,
        mission:missions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching missions:', error);
      return NextResponse.json({ error: 'Failed to fetch missions' }, { status: 500 });
    }

    // Format missions data
    const formattedMissions = missions?.map(userMission => ({
      id: userMission.id,
      title: userMission.mission.title,
      description: userMission.mission.description,
      type: userMission.mission.type,
      xp_reward: userMission.mission.xp_reward,
      requirements: {
        target_value: userMission.mission.target_value,
        current_value: userMission.current_progress,
        unit: userMission.mission.unit || 'items'
      },
      status: userMission.status,
      expires_at: userMission.expires_at,
      completed_at: userMission.completed_at
    })) || [];

    return NextResponse.json({ missions: formattedMissions });
  } catch (error) {
    console.error('Error in missions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/missions - Create or assign mission to user
export async function POST(request: NextRequest) {
  try {
    const { userId, missionType } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate daily missions if needed
    if (missionType === 'daily') {
      await generateDailyMissions(userId);
    }

    return NextResponse.json({ message: 'Missions generated successfully' });
  } catch (error) {
    console.error('Error in missions POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateDailyMissions(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if daily missions already exist for today
  const { data: existingMissions } = await supabase
    .from('user_missions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`);

  if (existingMissions && existingMissions.length > 0) {
    return; // Daily missions already generated
  }

  // Get available daily mission templates
  const { data: missionTemplates } = await supabase
    .from('missions')
    .select('*')
    .eq('type', 'daily')
    .eq('is_active', true);

  if (!missionTemplates || missionTemplates.length === 0) {
    return;
  }

  // Create user missions from templates
  const userMissions = missionTemplates.slice(0, 3).map(template => ({
    user_id: userId,
    mission_id: template.id,
    status: 'active',
    current_progress: 0,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    created_at: new Date().toISOString()
  }));

  await supabase
    .from('user_missions')
    .insert(userMissions);
}
