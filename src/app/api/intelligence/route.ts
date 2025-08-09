import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    let briefing = null
    
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase')) {
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
      
      const { data: latest, error } = await supabase
        .from('daily_lessons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (!error) {
        briefing = latest
      }
    } else {
      // Mock briefing for development
      briefing = {
        id: 1,
        title: "AI Mind OS Daily Brief",
        content: "Today's focus: Building the future of AI-powered productivity. Key developments in LLM capabilities and automation trends.",
        created_at: new Date().toISOString(),
        insights: ["AGI progress accelerating", "Automation adoption increasing", "AI safety frameworks evolving"]
      }
      console.log('🧠 MOCK INTELLIGENCE BRIEFING:', briefing)
    }

    // Fetch AI news if News API key is available
    let liveIntel = []
    const newsApiKey = process.env.NEWS_API_KEY
    
    if (newsApiKey && !newsApiKey.includes('your_news_api')) {
      try {
        const newsRes = await fetch(
          `https://newsapi.org/v2/everything?q=artificial%20intelligence%20OR%20LLM%20OR%20automation&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`,
          { next: { revalidate: 300 } }
        )
        const news = await newsRes.json()
        liveIntel = news.articles?.slice(0, 3) || []
      } catch (newsError) {
        console.error('News API error:', newsError)
        // Fall back to mock news
        liveIntel = [
          {
            title: "OpenAI Releases GPT-5 with Enhanced Reasoning",
            description: "Latest language model shows significant improvements in complex problem solving and mathematical reasoning.",
            url: "https://example.com/gpt5",
            publishedAt: new Date().toISOString(),
            source: { name: "AI News" }
          },
          {
            title: "Autonomous AI Agents Show Promise in Enterprise",
            description: "New study reveals 40% productivity gains from AI agent deployment in knowledge work.",
            url: "https://example.com/ai-agents",
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: { name: "Tech Weekly" }
          },
          {
            title: "AI Safety Frameworks Gain Industry Adoption",
            description: "Major tech companies align on new standards for responsible AI development and deployment.",
            url: "https://example.com/ai-safety",
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: { name: "AI Ethics Today" }
          }
        ]
      }
    } else {
      // Mock intel for development
      liveIntel = [
        {
          title: "OpenAI Releases GPT-5 with Enhanced Reasoning",
          description: "Latest language model shows significant improvements in complex problem solving and mathematical reasoning.",
          url: "https://example.com/gpt5",
          publishedAt: new Date().toISOString(),
          source: { name: "AI News" }
        },
        {
          title: "Autonomous AI Agents Show Promise in Enterprise",
          description: "New study reveals 40% productivity gains from AI agent deployment in knowledge work.",
          url: "https://example.com/ai-agents",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Tech Weekly" }
        },
        {
          title: "AI Safety Frameworks Gain Industry Adoption",
          description: "Major tech companies align on new standards for responsible AI development and deployment.",
          url: "https://example.com/ai-safety",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "AI Ethics Today" }
        }
      ]
      console.log('🧠 MOCK LIVE INTEL:', liveIntel.length, 'articles')
    }

    return NextResponse.json({
      briefing,
      liveIntel,
      lastUpdate: new Date().toISOString(),
      status: 'operational'
    })
  } catch (e) {
    console.error('Intelligence API error:', e)
    return NextResponse.json({ 
      error: 'Intelligence system temporarily unavailable',
      status: 'degraded',
      lastUpdate: new Date().toISOString()
    }, { status: 500 })
  }
}
