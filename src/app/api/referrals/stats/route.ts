import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/referrals/stats - Get referral statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get referral statistics
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('status, reward_claimed, xp_reward')
      .eq('referrer_id', userId);

    if (error) {
      console.error('Error fetching referral stats:', error);
      return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      total_referrals: referrals.length,
      successful_referrals: referrals.filter(r => r.status === 'completed').length,
      pending_referrals: referrals.filter(r => r.status === 'pending').length,
      total_rewards_earned: referrals
        .filter(r => r.reward_claimed)
        .reduce((sum, r) => sum + (r.xp_reward || 50), 0),
      unclaimed_rewards: referrals
        .filter(r => r.status === 'completed' && !r.reward_claimed)
        .reduce((sum, r) => sum + (r.xp_reward || 50), 0)
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in referrals stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
