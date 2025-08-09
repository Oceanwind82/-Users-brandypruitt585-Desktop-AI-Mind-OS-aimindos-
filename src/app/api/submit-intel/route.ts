import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { title, content, category, submittedBy } = await req.json()

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      // Mock mode for development
      console.log('🧠 MOCK COMMUNITY INTEL SUBMISSION:', {
        title,
        content: content.slice(0, 100) + '...',
        category: category || 'general',
        submittedBy: submittedBy || 'Anonymous',
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Community intel submitted (mock mode)',
        xpEarned: 100,
        lessonId: `mock-${Date.now()}`
      })
    }

    // Real Supabase integration
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

    // Check auth (optional for community submissions)
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    // AI content polishing with OpenAI
    let polishedContent = content
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (openaiKey && !openaiKey.includes('your_openai') && openaiKey.startsWith('sk-')) {
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${openaiKey}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { 
                role: 'system', 
                content: 'You are the AI Mind OS content curator. Create tight, tactical, accurate content. Bold voice. Focus on actionable insights for AI-powered productivity and dangerous thinking.' 
              },
              { 
                role: 'user', 
                content: `TITLE: ${title}\n\nCONTENT:\n${content}\n\nPolish this for AI Mind OS. Keep it dangerous and actionable. Maintain the core message but make it more compelling and structured.` 
              }
            ],
            max_tokens: 800,
            temperature: 0.7
          })
        })

        const aiData = await aiResponse.json()
        polishedContent = aiData?.choices?.[0]?.message?.content || content
        console.log('✨ AI content polishing completed')
      } catch (aiError) {
        console.error('AI polishing failed, using original content:', aiError)
        polishedContent = content
      }
    } else {
      console.log('🔧 OpenAI not configured, using original content')
    }

    // Generate insights from content
    const insights = extractInsights(polishedContent, title)

    // Insert into daily_lessons table
    const { data: lessonData, error } = await supabase.from('daily_lessons').insert({
      title,
      content: polishedContent,
      insights,
      category: category || 'community_intelligence',
      difficulty_level: 2,
      estimated_read_time: Math.ceil(polishedContent.length / 200), // ~200 chars per minute
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).select().single()

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    // Send Telegram notification
    if (process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_BOT_TOKEN.includes('your_telegram')) {
      try {
        const text = [
          '🧠 NEW COMMUNITY INTEL',
          `📰 ${title}`,
          `👤 ${submittedBy || 'Anonymous'}`,
          `🎯 ${category || 'general'}`,
          `💡 ${insights.length} insights extracted`,
          `⚡ Published as lesson #${lessonData.id}`
        ].join('\n')
        
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chat_id: process.env.TELEGRAM_CHAT_ID, 
            text 
          })
        })
        console.log('📱 Telegram notification sent')
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Community intel published successfully',
      xpEarned: isAuthenticated ? 100 : 50,
      lessonId: lessonData.id,
      polished: polishedContent !== content
    })

  } catch (error) {
    console.error('Community intel submission error:', error)
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to extract insights from content
function extractInsights(content: string, title: string): string[] {
  const insights: string[] = []
  
  // Extract key points from content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Add title as primary insight
  insights.push(title)
  
  // Look for actionable statements
  const actionableKeywords = ['implement', 'use', 'apply', 'leverage', 'automate', 'optimize', 'build', 'create', 'deploy']
  const actionableSentences = sentences.filter(sentence => 
    actionableKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  ).slice(0, 2)
  
  insights.push(...actionableSentences.map(s => s.trim()))
  
  // Look for key concepts
  const conceptKeywords = ['AI', 'automation', 'productivity', 'efficiency', 'innovation', 'strategy', 'system', 'process']
  const conceptSentences = sentences.filter(sentence => 
    conceptKeywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))
  ).slice(0, 1)
  
  insights.push(...conceptSentences.map(s => s.trim()))
  
  // Return unique insights, limited to 5
  return [...new Set(insights)].slice(0, 5).filter(insight => insight.length > 10)
}
