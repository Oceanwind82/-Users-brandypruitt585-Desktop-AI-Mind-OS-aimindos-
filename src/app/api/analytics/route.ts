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

interface AnalyticsEvent {
  event: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

interface AnalyticsQuery {
  start_date?: string;
  end_date?: string;
  event_type?: string;
  user_id?: string;
  limit?: number;
}

// High-value events that should trigger notifications
const HIGH_VALUE_EVENTS = [
  'user_signup',
  'subscription_created',
  'payment_successful',
  'lesson_completed',
  'achievement_unlocked',
  'referral_successful'
];

function isHighValueEvent(event: string): boolean {
  return HIGH_VALUE_EVENTS.includes(event.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalyticsEvent;
    const { event, user_id, session_id, metadata } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    if (MOCK_MODE) {
      // Mock response for development
      const mockEventId = `mock_${Date.now()}`;
      console.log(`[MOCK] Analytics event recorded:`, { event, user_id, metadata });
      
      // Send notification for high-value events even in mock mode
      if (isHighValueEvent(event)) {
        const notificationMessage = `🎉 [MOCK] High-value event: ${event}\n` +
          `User: ${user_id || 'Anonymous'}\n` +
          `Metadata: ${JSON.stringify(metadata, null, 2)}`;
        
        await notify(notificationMessage);
      }

      return NextResponse.json({
        success: true,
        event_id: mockEventId,
        message: 'Event recorded successfully (mock mode)',
        mock: true
      });
    }

    // Insert analytics event
    const { data, error } = await supabase!
      .from('analytics_events')
      .insert({
        event,
        user_id,
        session_id,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record event' },
        { status: 500 }
      );
    }

    // Send notification for high-value events
    if (isHighValueEvent(event)) {
      const notificationMessage = `🎉 High-value event: ${event}\n` +
        `User: ${user_id || 'Anonymous'}\n` +
        `Metadata: ${JSON.stringify(metadata, null, 2)}`;
      
      await notify(notificationMessage);
    }

    return NextResponse.json({
      success: true,
      event_id: data.id,
      message: 'Event recorded successfully'
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: AnalyticsQuery = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      event_type: searchParams.get('event_type') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    };

    if (MOCK_MODE) {
      // Mock response for development
      const mockEvents = [
        {
          id: 'mock_1',
          event: 'user_signup',
          user_id: 'mock_user_1',
          metadata: { source: 'organic' },
          timestamp: new Date().toISOString()
        },
        {
          id: 'mock_2',
          event: 'lesson_completed',
          user_id: 'mock_user_2',
          metadata: { lesson_id: 'intro_101' },
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      const summary = {
        total_events: mockEvents.length,
        unique_users: 2,
        event_breakdown: { 'user_signup': 1, 'lesson_completed': 1 },
        date_range: {
          start: mockEvents[1].timestamp,
          end: mockEvents[0].timestamp
        }
      };

      console.log(`[MOCK] Analytics query:`, query);

      return NextResponse.json({
        success: true,
        events: mockEvents,
        summary,
        mock: true
      });
    }

    let dbQuery = supabase!
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false });

    if (query.start_date) {
      dbQuery = dbQuery.gte('timestamp', query.start_date);
    }

    if (query.end_date) {
      dbQuery = dbQuery.lte('timestamp', query.end_date);
    }

    if (query.event_type) {
      dbQuery = dbQuery.eq('event', query.event_type);
    }

    if (query.user_id) {
      dbQuery = dbQuery.eq('user_id', query.user_id);
    }

    if (query.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }

    const { data: events, error } = await dbQuery;

    if (error) {
      console.error('Analytics query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Generate summary statistics
    const eventCounts = events?.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const uniqueUsers = new Set(
      events?.filter(e => e.user_id).map(e => e.user_id)
    ).size;

    const summary = {
      total_events: events?.length || 0,
      unique_users: uniqueUsers,
      event_breakdown: eventCounts,
      date_range: {
        start: query.start_date || events?.[events.length - 1]?.timestamp,
        end: query.end_date || events?.[0]?.timestamp
      }
    };

    return NextResponse.json({
      success: true,
      events: events || [],
      summary
    });

  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
