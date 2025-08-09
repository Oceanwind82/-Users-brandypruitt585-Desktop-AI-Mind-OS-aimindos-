import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notify } from '@/lib/notify'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { email, firstName, lastName, company, role, useCase, referralCode } = await req.json()
  
  try {
    // Mock mode for development
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      console.log('🎯 MOCK WAITLIST SUBMISSION:', {
        email,
        firstName,
        lastName,
        company,
        role,
        useCase,
        referredBy: referralCode,
        timestamp: new Date().toISOString()
      })

      const userReferralCode = `AMOS${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      
      await notify(`🧠 <b>Waitlist</b>\n📧 ${email}\n🔗 Referral: ${referralCode || "—"}`)
      
      return NextResponse.json({
        success: true,
        message: 'Successfully joined waitlist (mock mode)',
        referralCode: userReferralCode
      })
    }

    // Production mode - use Supabase
    const userReferralCode = `AMOS${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Insert waitlist entry
    const { error: insertError } = await supabase.from('waitlist_entries').insert({
      email,
      first_name: firstName,
      last_name: lastName,
      company,
      role,
      use_case: useCase,
      referral_code: userReferralCode,
      referred_by: referralCode,
      created_at: new Date().toISOString()
    })

    if (insertError) throw insertError

    // Track referral if provided
    if (referralCode) {
      await supabase.from('referral_tracking').insert({
        referrer_code: referralCode,
        new_user_email: email,
        points_awarded: 100,
        event_type: 'signup',
      })
    }

    await notify(`🧠 <b>Waitlist</b>\n📧 ${email}\n🔗 Referral: ${referralCode || "—"}`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode: userReferralCode
    })

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await notify(`❌ <b>Waitlist error</b>\n<code>${errorMessage}</code>\n📧 ${email}`)
    console.error('Waitlist signup error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
