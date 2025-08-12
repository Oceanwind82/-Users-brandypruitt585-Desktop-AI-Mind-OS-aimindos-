import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/referrals/[id]/claim - Claim referral reward
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: referralId } = await params;

    if (!referralId) {
      return NextResponse.json({ error: 'Referral ID is required' }, { status: 400 });
    }

    // Get referral details
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      console.error('Error fetching referral:', referralError);
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    // Check if referral is completed and reward not claimed
    if (referral.status !== 'completed') {
      return NextResponse.json({ error: 'Referral not completed yet' }, { status: 400 });
    }

    if (referral.reward_claimed) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
    }

    // Start transaction
    const { error: transactionError } = await supabase.rpc('claim_referral_reward', {
      p_referral_id: referralId,
      p_referrer_id: referral.referrer_id,
      p_xp_reward: referral.xp_reward || 50
    });

    if (transactionError) {
      console.error('Error claiming referral reward:', transactionError);
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Reward claimed successfully',
      xp_earned: referral.xp_reward || 50
    });
  } catch (error) {
    console.error('Error in claim referral reward API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
