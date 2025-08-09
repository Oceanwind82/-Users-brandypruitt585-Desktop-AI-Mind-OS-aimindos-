import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notify } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      // Mock mode for testing without Supabase
      console.log('🎯 MOCK WAITLIST SUBMISSION:', {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        company: body.company,
        role: body.role,
        useCase: body.useCase,
        referredBy: body.referredBy || body.referralCode,
        timestamp: new Date().toISOString()
      })
      
      const userReferralCode = `AMOS${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      
      return NextResponse.json({
        success: true,
        message: 'Successfully joined waitlist (mock mode)',
        referralCode: userReferralCode
      })
    }
    
    // Original Supabase code continues here...
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { email, referralCode } = body
    const userReferralCode = `AMOS${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    
    const { error } = await supabase.from('waitlist_entries').insert({
      email,
      referral_code: referralCode || null,
      source: 'landing_page',
      created_at: new Date().toISOString(),
    })
    
    if (error) return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 400 })

    if (referralCode) {
      await supabase.from('referral_tracking').insert({
        referrer_code: referralCode,
        new_user_email: email,
        points_awarded: 100,
        event_type: 'signup',
      })
    }

    // Send Telegram notification
    const telegramMessage = [
      '🚨 <b>NEW AI MIND OS RECRUIT</b>',
      `📧 Email: <code>${email}</code>`,
      `🔗 Referral: ${referralCode || 'Direct signup'}`,
      `🎯 Code: <code>${userReferralCode}</code>`,
      `⏰ ${new Date().toLocaleString()}`
    ].join('\n')
    await notify(telegramMessage)

    return NextResponse.json({ success: true, referralCode: userReferralCode })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
