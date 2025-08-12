import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/referrals/code - Get user's referral code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's referral code from profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching referral code:', error);
      return NextResponse.json({ error: 'Failed to fetch referral code' }, { status: 500 });
    }

    // If no referral code exists, generate one
    let referralCode = profile?.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode();
      
      // Update profile with new referral code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating referral code:', updateError);
        return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
      }
    }

    return NextResponse.json({ code: referralCode });
  } catch (error) {
    console.error('Error in referral code API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
