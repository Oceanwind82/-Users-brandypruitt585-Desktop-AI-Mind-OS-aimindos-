import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { email, referralCode } = await req.json()

  try {
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

    if (process.env.TELEGRAM_BOT_TOKEN) {
      const text = [
        '🚨 NEW AI MIND OS RECRUIT',
        `📧 Email: ${email}`,
        `🔗 Referral: ${referralCode || 'Direct signup'}`,
        `🎯 Code: ${userReferralCode}`,
        `⏰ ${new Date().toLocaleString()}`
      ].join('\n')
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
      })
    }

    return NextResponse.json({ success: true, referralCode: userReferralCode })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
