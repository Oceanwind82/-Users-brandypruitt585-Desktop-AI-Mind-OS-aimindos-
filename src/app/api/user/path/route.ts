import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MOCK_MODE = process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, quiz_answers, completed_at } = body;

    if (MOCK_MODE) {
      console.log('Mock mode: Path would be saved as:', { path, quiz_answers, completed_at });
      return NextResponse.json({ 
        success: true, 
        path,
        message: 'Path saved successfully (mock mode)' 
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // For now, we'll mock the user authentication
    // In production, you'd get this from the session
    const mockUserId = 'mock-user-' + Date.now();

    // Update user profile with path information
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: mockUserId,
        learning_path: path,
        onboarding_completed: true,
        quiz_answers,
        path_assigned_at: completed_at,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating user path:', updateError);
      return NextResponse.json({ error: 'Failed to save path' }, { status: 500 });
    }

    // Create initial lesson queue based on path
    const lessonQueues = {
      builder: [
        'design_thinking_fundamentals',
        'product_development_101',
        'mvp_creation_strategies',
        'user_research_methods',
        'prototyping_techniques'
      ],
      automator: [
        'automation_fundamentals',
        'workflow_optimization',
        'api_integration_basics',
        'process_mapping',
        'efficiency_metrics'
      ],
      dealmaker: [
        'sales_psychology',
        'negotiation_mastery',
        'relationship_building',
        'deal_structuring',
        'network_growth_strategies'
      ]
    };

    // Add lessons to user's queue
    const lessonsToAdd = lessonQueues[path as keyof typeof lessonQueues] || [];
    
    if (lessonsToAdd.length > 0) {
      const lessonEntries = lessonsToAdd.map((lessonId, index) => ({
        user_id: mockUserId,
        lesson_id: lessonId,
        status: 'queued',
        order_index: index,
        added_at: new Date().toISOString()
      }));

      const { error: queueError } = await supabase
        .from('user_lesson_queue')
        .insert(lessonEntries);

      if (queueError) {
        console.error('Error creating lesson queue:', queueError);
      }
    }

    // Award initial XP for completing onboarding
    const { error: xpError } = await supabase
      .from('user_xp_log')
      .insert({
        user_id: mockUserId,
        xp_amount: 100,
        source: 'onboarding_completed',
        description: `Completed onboarding quiz - assigned to ${path} path`,
        created_at: new Date().toISOString()
      });

    if (xpError) {
      console.error('Error awarding onboarding XP:', xpError);
    }

    return NextResponse.json({ 
      success: true, 
      path,
      message: 'Path saved successfully' 
    });

  } catch (error) {
    console.error('Error in /api/user/path:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
