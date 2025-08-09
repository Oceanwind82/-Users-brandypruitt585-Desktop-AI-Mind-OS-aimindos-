'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  badge?: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  lastUpdate: string;
  totalPlayers: number;
  status: string;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchLeaderboard, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Leaderboard unavailable');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-400';
      case 'mock': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'text-purple-400';
    if (level >= 5) return 'text-blue-400';
    if (level >= 3) return 'text-green-400';
    return 'text-gray-400';
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'founder': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'early adopter': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'community leader': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      case 'automation expert': return 'bg-gradient-to-r from-green-400 to-emerald-400';
      case 'productivity guru': return 'bg-gradient-to-r from-indigo-400 to-purple-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading leaderboard...</p>
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
            <h1 className="text-xl font-semibold">🏆 Leaderboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${data?.status === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className={`text-sm ${getStatusColor(data?.status || 'unknown')}`}>
                {data?.status || 'Unknown'}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {data?.totalPlayers || 0} players
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <button 
              onClick={fetchLeaderboard}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{data?.totalPlayers || 0}</div>
                <div className="text-sm text-gray-400">Total Players</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{data?.leaderboard?.[0]?.xp || 0}</div>
                <div className="text-sm text-gray-400">Top XP</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{data?.leaderboard?.[0]?.streak || 0}</div>
                <div className="text-sm text-gray-400">Top Streak</div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-bold">🏆 Top Performers</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Last updated: {data ? formatTime(data.lastUpdate) : 'Never'}
                </p>
              </div>

              {data?.leaderboard && data.leaderboard.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {data.leaderboard.map((entry) => (
                    <div key={entry.rank} className={`px-6 py-4 hover:bg-gray-800/50 transition-colors ${entry.rank <= 3 ? 'bg-gray-800/30' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div className={`text-xl font-bold ${entry.rank <= 3 ? 'text-yellow-400' : 'text-gray-400'} min-w-[3rem]`}>
                            {getRankEmoji(entry.rank)}
                          </div>

                          {/* Name & Badge */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{entry.name}</span>
                              {entry.badge && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getBadgeColor(entry.badge)}`}>
                                  {entry.badge}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Level */}
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getLevelColor(entry.level)}`}>
                              Lv.{entry.level}
                            </div>
                            <div className="text-xs text-gray-500">Level</div>
                          </div>

                          {/* XP */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">
                              {entry.xp.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">XP</div>
                          </div>

                          {/* Current Streak */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">
                              {entry.streak}
                            </div>
                            <div className="text-xs text-gray-500">Streak</div>
                          </div>

                          {/* Longest Streak */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {entry.longestStreak}
                            </div>
                            <div className="text-xs text-gray-500">Best</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p>No leaderboard data available</p>
                </div>
              )}
            </div>

            {/* XP System Info */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">💎 XP System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Earn XP By:</h4>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Daily login: +10 XP</li>
                    <li>• Submit intelligence: +100 XP</li>
                    <li>• Complete lessons: +50 XP</li>
                    <li>• Maintain streaks: Bonus multipliers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-2">Level Benefits:</h4>
                  <ul className="space-y-1 text-gray-400">
                    <li>• Higher levels unlock premium content</li>
                    <li>• Special badges and recognition</li>
                    <li>• Early access to new features</li>
                    <li>• Community leadership opportunities</li>
                  </ul>
                </div>
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
                  href="/submit-intel"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🧠 Earn XP
                </Link>
                
                <button 
                  onClick={fetchLeaderboard}
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
