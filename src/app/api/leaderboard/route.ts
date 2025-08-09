import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface UserData {
  email: string
  full_name?: string
  total_xp?: number
  current_level?: number
  current_streak?: number
  longest_streak?: number
  badge?: string
}

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
      // Mock leaderboard for development
      const mockLeaderboard = [
        {
          rank: 1,
          name: "Brandy Pruitt",
          xp: 2847,
          level: 12,
          streak: 23,
          longestStreak: 45,
          badge: "Founder"
        },
        {
          rank: 2,
          name: "TechFounder",
          xp: 2340,
          level: 11,
          streak: 18,
          longestStreak: 32,
          badge: "Early Adopter"
        },
        {
          rank: 3,
          name: "AIEnthusiast",
          xp: 1950,
          level: 9,
          streak: 15,
          longestStreak: 28,
          badge: "Community Leader"
        },
        {
          rank: 4,
          name: "AutomationKing",
          xp: 1680,
          level: 8,
          streak: 12,
          longestStreak: 24,
          badge: "Automation Expert"
        },
        {
          rank: 5,
          name: "ProductivityHacker",
          xp: 1420,
          level: 7,
          streak: 9,
          longestStreak: 19,
          badge: "Productivity Guru"
        },
        {
          rank: 6,
          name: "DataScientist",
          xp: 1180,
          level: 6,
          streak: 7,
          longestStreak: 16,
          badge: "Data Master"
        },
        {
          rank: 7,
          name: "StartupCEO",
          xp: 950,
          level: 5,
          streak: 5,
          longestStreak: 13,
          badge: "Visionary"
        },
        {
          rank: 8,
          name: "CodeWizard",
          xp: 780,
          level: 4,
          streak: 3,
          longestStreak: 11,
          badge: "Developer"
        },
        {
          rank: 9,
          name: "InnovatorX",
          xp: 620,
          level: 3,
          streak: 2,
          longestStreak: 8,
          badge: "Innovator"
        },
        {
          rank: 10,
          name: "FutureThinker",
          xp: 450,
          level: 2,
          streak: 1,
          longestStreak: 5,
          badge: "Rising Star"
        }
      ]
      
      console.log('🏆 MOCK LEADERBOARD:', mockLeaderboard.length, 'players')
      
      return NextResponse.json({
        leaderboard: mockLeaderboard,
        lastUpdate: new Date().toISOString(),
        totalPlayers: mockLeaderboard.length,
        status: 'mock'
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

    const { data: top, error } = await supabase
      .from('users')
      .select('email, full_name, total_xp, current_level, current_streak, longest_streak, badge')
      .order('total_xp', { ascending: false })
      .limit(50)
    
    if (error) throw error

    const leaderboard = top.map((u: UserData, i: number) => ({
      rank: i + 1,
      name: u.full_name || u.email.split('@')[0],
      xp: u.total_xp || 0,
      level: u.current_level || 1,
      streak: u.current_streak || 0,
      longestStreak: u.longest_streak || 0,
      badge: u.badge || 'Member'
    }))

    return NextResponse.json({ 
      leaderboard, 
      lastUpdate: new Date().toISOString(),
      totalPlayers: leaderboard.length,
      status: 'live'
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ 
      error: 'Leaderboard temporarily unavailable',
      lastUpdate: new Date().toISOString(),
      status: 'error'
    }, { status: 500 })
  }
}
