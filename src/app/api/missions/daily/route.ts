import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOCK_MODE = process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL;

interface MicroMission {
  id: string;
  title: string;
  description: string;
  estimated_time: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  path_specific?: string[];
}

const missionTemplates: MicroMission[] = [
  {
    id: 'daily_automation_idea',
    title: 'Spot 1 Automation Opportunity',
    description: 'Identify one repetitive task in your daily routine that could be automated',
    estimated_time: '5 min',
    xp_reward: 25,
    difficulty: 'easy',
    category: 'awareness',
    path_specific: ['automator']
  },
  {
    id: 'user_feedback_collection',
    title: 'Gather User Feedback',
    description: 'Ask 3 people about their biggest daily frustration and note their responses',
    estimated_time: '7 min',
    xp_reward: 35,
    difficulty: 'medium',
    category: 'research',
    path_specific: ['builder']
  },
  {
    id: 'network_connection',
    title: 'Make a New Connection',
    description: 'Reach out to someone new in your industry and start a genuine conversation',
    estimated_time: '6 min',
    xp_reward: 40,
    difficulty: 'medium',
    category: 'networking',
    path_specific: ['dealmaker']
  },
  {
    id: 'prototype_sketch',
    title: 'Quick Prototype Sketch',
    description: 'Sketch a solution to a problem you noticed today (digital or paper)',
    estimated_time: '5 min',
    xp_reward: 30,
    difficulty: 'easy',
    category: 'creation',
    path_specific: ['builder']
  },
  {
    id: 'process_optimization',
    title: 'Optimize One Process',
    description: 'Take a process you do regularly and find a way to make it 20% faster',
    estimated_time: '7 min',
    xp_reward: 45,
    difficulty: 'medium',
    category: 'optimization',
    path_specific: ['automator']
  },
  {
    id: 'value_proposition_practice',
    title: 'Practice Your Pitch',
    description: 'Record yourself explaining your value in 30 seconds or less',
    estimated_time: '5 min',
    xp_reward: 35,
    difficulty: 'medium',
    category: 'communication',
    path_specific: ['dealmaker']
  },
  {
    id: 'learning_note',
    title: 'Capture One Learning',
    description: 'Write down the most interesting thing you learned today and why it matters',
    estimated_time: '4 min',
    xp_reward: 20,
    difficulty: 'easy',
    category: 'reflection'
  },
  {
    id: 'ai_tool_exploration',
    title: 'Try a New AI Tool',
    description: 'Spend 5 minutes exploring an AI tool you\'ve never used before',
    estimated_time: '5 min',
    xp_reward: 30,
    difficulty: 'easy',
    category: 'exploration'
  }
];

function selectDailyMission(userPath?: string): MicroMission {
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Filter missions based on user path
  let availableMissions = missionTemplates;
  if (userPath) {
    availableMissions = missionTemplates.filter(mission => 
      !mission.path_specific || mission.path_specific.includes(userPath)
    );
  }
  
  // Use seeded random to ensure same mission for all users on same day
  const missionIndex = seed % availableMissions.length;
  return availableMissions[missionIndex];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPath = searchParams.get('path');

    if (MOCK_MODE) {
      const mission = selectDailyMission(userPath || undefined);
      return NextResponse.json({
        success: true,
        mission: {
          ...mission,
          id: `${mission.id}_${new Date().toISOString().split('T')[0]}`,
          assigned_date: new Date().toISOString(),
          status: 'pending'
        }
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already has a mission for today
    const { data: existingMission } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('assigned_date', today)
      .eq('user_id', 'mock-user') // Replace with actual user ID
      .single();

    if (existingMission) {
      return NextResponse.json({
        success: true,
        mission: existingMission
      });
    }

    // Generate new mission for today
    const missionTemplate = selectDailyMission(userPath || undefined);
    const newMission = {
      user_id: 'mock-user', // Replace with actual user ID
      mission_id: `${missionTemplate.id}_${today}`,
      title: missionTemplate.title,
      description: missionTemplate.description,
      estimated_time: missionTemplate.estimated_time,
      xp_reward: missionTemplate.xp_reward,
      difficulty: missionTemplate.difficulty,
      category: missionTemplate.category,
      assigned_date: today,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: mission, error } = await supabase
      .from('daily_missions')
      .insert(newMission)
      .select()
      .single();

    if (error) {
      console.error('Error creating daily mission:', error);
      return NextResponse.json({ error: 'Failed to create mission' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mission
    });

  } catch (error) {
    console.error('Error in /api/missions/daily:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mission_id, completion_notes } = body;

    if (MOCK_MODE) {
      console.log('Mock mode: Mission completed:', { mission_id, completion_notes });
      return NextResponse.json({
        success: true,
        xp_earned: 35,
        streak_updated: true,
        message: 'Mission completed! (mock mode)'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update mission status
    const { data: mission, error: updateError } = await supabase
      .from('daily_missions')
      .update({
        status: 'completed',
        completion_notes,
        completed_at: new Date().toISOString()
      })
      .eq('mission_id', mission_id)
      .eq('user_id', 'mock-user') // Replace with actual user ID
      .select()
      .single();

    if (updateError || !mission) {
      return NextResponse.json({ error: 'Mission not found or already completed' }, { status: 404 });
    }

    // Award XP
    const { error: xpError } = await supabase
      .from('user_xp_log')
      .insert({
        user_id: 'mock-user', // Replace with actual user ID
        xp_amount: mission.xp_reward,
        source: 'daily_mission_completed',
        description: `Completed daily mission: ${mission.title}`,
        created_at: new Date().toISOString()
      });

    if (xpError) {
      console.error('Error awarding XP:', xpError);
    }

    // Update user streak
    const today = new Date().toISOString().split('T')[0];
    const { error: streakError } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: 'mock-user', // Replace with actual user ID
        streak_type: 'daily_mission',
        current_streak: 1, // This would need proper calculation
        last_activity_date: today,
        updated_at: new Date().toISOString()
      });

    if (streakError) {
      console.error('Error updating streak:', streakError);
    }

    return NextResponse.json({
      success: true,
      xp_earned: mission.xp_reward,
      streak_updated: true,
      message: 'Mission completed successfully!'
    });

  } catch (error) {
    console.error('Error completing mission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
