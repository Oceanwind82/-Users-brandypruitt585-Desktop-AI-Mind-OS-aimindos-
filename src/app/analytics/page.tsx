'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalEvents: number;
  eventTypes: Record<string, number>;
  dailyActivity: Record<string, number>;
  topEvents: [string, number][];
  uniqueUsers: number;
}

interface AnalyticsResponse {
  analytics: AnalyticsData;
  status: string;
  lastUpdate: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Analytics system unavailable');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: string, eventData?: Record<string, string | number | boolean>) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventData,
          userId: 'demo_user' // In real app, get from auth
        })
      });
      console.log(`📊 Event tracked: ${eventType}`);
    } catch (err) {
      console.error('Event tracking failed:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANALYTICS_ACTIVE': return 'text-green-400';
      case 'MOCK_ANALYTICS_ACTIVE': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return '👁️';
      case 'waitlist_signup': return '📝';
      case 'intel_submission': return '🧠';
      case 'leaderboard_view': return '🏆';
      case 'user_login': return '🔐';
      case 'content_share': return '📤';
      case 'search': return '🔍';
      case 'feature_click': return '🖱️';
      case 'session_start': return '🚀';
      default: return '📊';
    }
  };

  const formatEventName = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-purple-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Mind OS
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold">📊 Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${data?.status === 'ANALYTICS_ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className={`text-sm ${getStatusColor(data?.status || 'unknown')}`}>
                {data?.status === 'MOCK_ANALYTICS_ACTIVE' ? 'Mock Mode' : 
                 data?.status === 'ANALYTICS_ACTIVE' ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{data?.analytics.totalEvents || 0}</div>
                <div className="text-sm text-gray-400">Total Events</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{data?.analytics.uniqueUsers || 0}</div>
                <div className="text-sm text-gray-400">Unique Users</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{Object.keys(data?.analytics.eventTypes || {}).length}</div>
                <div className="text-sm text-gray-400">Event Types</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{Object.keys(data?.analytics.dailyActivity || {}).length}</div>
                <div className="text-sm text-gray-400">Active Days</div>
              </div>
            </div>

            {/* Top Events */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-purple-400 mb-4">🔥 Top Events (7 days)</h2>
              {data?.analytics.topEvents && data.analytics.topEvents.length > 0 ? (
                <div className="space-y-3">
                  {data.analytics.topEvents.map(([eventType, count], index) => (
                    <div key={eventType} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getEventIcon(eventType)}</span>
                        <span className="font-medium">{formatEventName(eventType)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400 font-bold">{count}</span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No event data available</p>
              )}
            </div>

            {/* Daily Activity */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-400 mb-4">📅 Daily Activity</h2>
              {data?.analytics.dailyActivity && Object.keys(data.analytics.dailyActivity).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.analytics.dailyActivity)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 7)
                    .map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded">
                      <span className="text-gray-300">{new Date(date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${Math.min((count / Math.max(...Object.values(data.analytics.dailyActivity))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-green-400 font-medium min-w-[2rem] text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No daily activity data</p>
              )}
            </div>

            {/* Event Testing */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">🧪 Test Event Tracking</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => trackEvent('page_view', { page: '/analytics' })}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  👁️ Page View
                </button>
                <button 
                  onClick={() => trackEvent('feature_click', { feature: 'analytics_test' })}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🖱️ Feature Click
                </button>
                <button 
                  onClick={() => trackEvent('content_share', { content: 'analytics_dashboard' })}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  📤 Content Share
                </button>
                <button 
                  onClick={() => trackEvent('search', { query: 'test_search' })}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🔍 Search
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click buttons to test event tracking. Events will appear in real-time analytics.
              </p>
            </div>

            {/* System Info */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Last updated: {data ? formatTime(data.lastUpdate) : 'Never'}
                </span>
                <span className="text-gray-400">
                  Status: {data?.status || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Back to Dashboard
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/intelligence"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🧠 Intelligence
                </Link>
                
                <button 
                  onClick={fetchAnalytics}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
