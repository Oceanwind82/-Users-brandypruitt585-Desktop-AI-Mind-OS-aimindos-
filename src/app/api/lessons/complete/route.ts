import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notify } from '@/lib/notify'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { lessonId, baseXp = 100 } = await req.json()
  
  // Mock mode for development
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    console.log('🎓 MOCK LESSON COMPLETION:', {
      userId: 'mock_user_id',
      lessonId,
      baseXp,
      timestamp: new Date().toISOString()
    })

    const mockResult = {
      lessonId,
      xp_awarded: baseXp,
      totalXp: 1250 + baseXp,
      level: Math.floor((1250 + baseXp) / 500) + 1,
      levelProgress: ((1250 + baseXp) % 500) / 500,
      streak: 7,
      completed: true
    }

    await notify(`✅ <b>Mission Complete</b>\n👤 mock@user.com\n📚 ${lessonId}\n⚡ +${baseXp} XP • Streak ${mockResult.streak}`)

    return NextResponse.json({ 
      success: true, 
      result: mockResult,
      status: 'MOCK_MODE_ACTIVE'
    })
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  
  try {
    const { data, error } = await supabase.rpc("award_xp_on_lesson", {
      _user: session.user.id, _lesson: lessonId, _base_xp: baseXp
    })
    if (error) throw error
    
    await notify(`✅ <b>Mission Complete</b>\n👤 ${session.user.email}\n📚 ${lessonId}\n⚡ +${data.xp_awarded} XP • Streak ${data.streak}`)
    
    // Optional: N8N webhook for automation
    try {
      if (process.env.N8N_WEBHOOK_COMPLETE) {
        await fetch(process.env.N8N_WEBHOOK_COMPLETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: session.user.id, 
            lessonId, 
            result: data,
            timestamp: new Date().toISOString()
          })
        })
        console.log('📡 N8N webhook triggered for lesson completion')
      }
    } catch (webhookError) {
      console.warn('N8N webhook failed (non-critical):', webhookError)
    }
    
    return NextResponse.json({ success: true, result: data })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    await notify(`🔥 <b>Lesson completion error</b>\n👤 ${session.user.email}\n📚 ${lessonId}\n<code>${errorMessage}</code>`)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
