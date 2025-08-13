import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notify } from '@/lib/notify';

// Mock mode for development
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
                  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_supabase_service_role_key' ||
                  process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_new_service_role_key' ||
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_new_anon_key';

const supabase = MOCK_MODE ? null : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WaitlistRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  useCase?: string;
  referred_by?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WaitlistRequest;
    const { email, firstName, lastName, company, role, useCase, referred_by } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const userReferralCode = `AMOS${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    if (MOCK_MODE) {
      // Mock response for development
      console.log(`[MOCK] Waitlist submission:`, {
        email,
        firstName,
        lastName,
        company,
        role,
        useCase,
        referred_by,
        userReferralCode,
        timestamp: new Date().toISOString()
      });

      // Send notification even in mock mode
      const notificationMessage = `🧠 [MOCK] Waitlist Signup\n` +
        `📧 ${email}\n` +
        `� ${firstName || ''} ${lastName || ''}\n` +
        `🏢 ${company || 'N/A'}\n` +
        `�🔗 Referral: ${referred_by || '—'}\n` +
        `🎫 Code: ${userReferralCode}`;

      await notify(notificationMessage);

      return NextResponse.json({
        success: true,
        message: 'Successfully joined waitlist (mock mode)',
        referralCode: userReferralCode,
        mock: true
      });
    }

    // Insert waitlist entry
    const { error: insertError } = await supabase!
      .from('waitlist_entries')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        company,
        role,
        use_case: useCase,
        referral_code: userReferralCode,
        referred_by,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    // Track referral if provided
    if (referred_by) {
      const { error: referralError } = await supabase!
        .from('referral_tracking')
        .insert({
          referrer_code: referred_by,
          new_user_email: email,
          points_awarded: 100,
          event_type: 'signup',
          created_at: new Date().toISOString()
        });

      if (referralError) {
        console.warn('Referral tracking failed (non-critical):', referralError);
      }
    }

    // Send notification
    const notificationMessage = `🧠 Waitlist Signup\n` +
      `📧 ${email}\n` +
      `👤 ${firstName || ''} ${lastName || ''}\n` +
      `🏢 ${company || 'N/A'}\n` +
      `🔗 Referral: ${referred_by || '—'}\n` +
      `🎫 Code: ${userReferralCode}`;

    await notify(notificationMessage);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode: userReferralCode
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Send error notification
    await notify(`❌ Waitlist signup error\n` +
      `Error: ${errorMessage}\n` +
      `Timestamp: ${new Date().toISOString()}`);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
