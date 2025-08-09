import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface EventData {
  [key: string]: string | number | boolean | undefined
}

interface AnalyticsEvent {
  event_type: string
  created_at: string
  event_data: EventData
  user_id?: string
}

export async function POST(req: Request) {
  try {
    const { eventType, eventData, userId } = await req.json()

    // Validate required fields
    if (!eventType) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 })
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      // Mock analytics tracking for development
      console.log('📊 MOCK ANALYTICS EVENT:', {
        eventType,
        eventData: eventData || {},
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Event tracked (mock mode)',
        eventId: `mock-${Date.now()}`
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

    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData || {},
      user_id: userId || null,
      created_at: new Date().toISOString()
    })
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ 
      error: 'Analytics tracking failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      // Mock analytics data for development
      const mockEvents = generateMockAnalytics()
      const analytics = processAnalyticsData(mockEvents)
      
      console.log('📊 MOCK ANALYTICS DASHBOARD:', {
        totalEvents: analytics.totalEvents,
        eventTypes: Object.keys(analytics.eventTypes).length,
        dailyActivity: Object.keys(analytics.dailyActivity).length
      })
      
      return NextResponse.json({ 
        analytics, 
        status: 'MOCK_ANALYTICS_ACTIVE',
        lastUpdate: new Date().toISOString()
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

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at, event_data, user_id')
      .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error

    const analytics = processAnalyticsData(data)
    
    return NextResponse.json({ 
      analytics, 
      status: 'ANALYTICS_ACTIVE',
      lastUpdate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ 
      error: 'Analytics system offline',
      status: 'ANALYTICS_ERROR'
    }, { status: 500 })
  }
}

// Helper function to process analytics data
function processAnalyticsData(data: AnalyticsEvent[]) {
  const analytics = {
    totalEvents: data.length,
    eventTypes: data.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {}),
    dailyActivity: data.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}),
    topEvents: Object.entries(
      data.reduce((acc: Record<string, number>, event: AnalyticsEvent) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1
        return acc
      }, {})
    )
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5),
    uniqueUsers: new Set(data.filter(e => e.user_id).map(e => e.user_id)).size
  }
  
  return analytics
}

// Generate mock analytics data for development
function generateMockAnalytics(): AnalyticsEvent[] {
  const eventTypes = [
    'page_view', 'waitlist_signup', 'intel_submission', 'leaderboard_view',
    'intelligence_dashboard_view', 'user_login', 'content_share', 'search',
    'feature_click', 'session_start'
  ]
  
  const mockEvents: AnalyticsEvent[] = []
  const now = new Date()
  
  // Generate events for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const eventsPerDay = Math.floor(Math.random() * 50) + 20 // 20-70 events per day
    
    for (let j = 0; j < eventsPerDay; j++) {
      const eventTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      
      mockEvents.push({
        event_type: eventType,
        created_at: eventTime.toISOString(),
        event_data: generateMockEventData(eventType),
        user_id: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 100)}` : undefined
      })
    }
  }
  
  return mockEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Generate mock event data based on event type
function generateMockEventData(eventType: string): EventData {
  const baseData = {
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: new Date().toISOString()
  }
  
  switch (eventType) {
    case 'page_view':
      return { ...baseData, page: ['/', '/intelligence', '/leaderboard', '/submit-intel'][Math.floor(Math.random() * 4)] }
    case 'waitlist_signup':
      return { ...baseData, source: 'landing_page', referral: Math.random() > 0.7 }
    case 'intel_submission':
      return { ...baseData, category: ['ai-research', 'automation', 'productivity'][Math.floor(Math.random() * 3)] }
    case 'user_login':
      return { ...baseData, method: 'email', success: Math.random() > 0.1 }
    default:
      return baseData
  }
}
