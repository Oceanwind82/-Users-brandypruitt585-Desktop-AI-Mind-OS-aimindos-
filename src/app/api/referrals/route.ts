import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/referrals - Get user's referrals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Error in referrals API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/referrals - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const { referrer_id, referred_email, referral_code } = await request.json();

    if (!referrer_id || !referred_email || !referral_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer_id)
      .eq('referred_email', referred_email)
      .single();

    if (existingReferral) {
      return NextResponse.json({ error: 'Referral already exists' }, { status: 400 });
    }

    // Create new referral
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id,
        referred_email,
        referral_code,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating referral:', error);
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error('Error in referrals POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
