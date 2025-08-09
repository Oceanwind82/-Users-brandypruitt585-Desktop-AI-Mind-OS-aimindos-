import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
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
        xpAwarded: baseXp,
        totalXp: 1250 + baseXp,
        level: Math.floor((1250 + baseXp) / 500) + 1,
        levelProgress: ((1250 + baseXp) % 500) / 500,
        streakBonus: 25,
        completed: true
      }

      return NextResponse.json({ 
        success: true, 
        result: mockResult,
        status: 'MOCK_MODE_ACTIVE'
      })
    }

    // Production mode - use Supabase
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('award_xp_on_lesson', {
      _user: session.user.id, 
      _lesson: lessonId, 
      _base_xp: baseXp
    })

    if (error) {
      console.error('Lesson completion error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Try to trigger N8N webhook for automation
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
      // Continue execution - webhook failure shouldn't block the response
    }

    return NextResponse.json({ success: true, result: data })

  } catch (error) {
    console.error('Lesson completion API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
