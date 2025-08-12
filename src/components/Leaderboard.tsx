'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Crown, Trophy, Medal, Star, Users, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  total_xp: number;
  weekly_xp: number;
  daily_xp: number;
  rank: number;
  badge?: string;
  is_current_user: boolean;
}

interface LeaderboardData {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  daily: LeaderboardEntry[];
  current_user_global_rank: number;
  total_users: number;
}

type LeaderboardType = 'global' | 'weekly' | 'daily';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    global: [],
    weekly: [],
    daily: [],
    current_user_global_rank: 0,
    total_users: 0
  });
  const [activeTab, setActiveTab] = useState<LeaderboardType>('weekly');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard || leaderboardData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [leaderboardData]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={20} />;
      case 2:
        return <Trophy className="text-gray-300" size={20} />;
      case 3:
        return <Medal className="text-orange-400" size={20} />;
      default:
        return <span className="text-gray-400 font-bold text-sm">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-blue-500/20 border-blue-500/50';
    }
    
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-orange-500/10 border-orange-500/30';
      default:
        return 'bg-gray-800/50 border-gray-600';
    }
  };

  const getTabIcon = (type: LeaderboardType) => {
    switch (type) {
      case 'global':
        return <Trophy size={16} />;
      case 'weekly':
        return <TrendingUp size={16} />;
      case 'daily':
        return <Star size={16} />;
    }
  };

  const getXPForTab = (entry: LeaderboardEntry, type: LeaderboardType) => {
    switch (type) {
      case 'global':
        return entry.total_xp;
      case 'weekly':
        return entry.weekly_xp;
      case 'daily':
        return entry.daily_xp;
    }
  };

  const currentData = leaderboardData[activeTab] || [];

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-700 rounded flex-1"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="text-yellow-400" size={24} />
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Users size={16} />
          <span>
            #{leaderboardData.current_user_global_rank} of {leaderboardData.total_users.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {(['global', 'weekly', 'daily'] as LeaderboardType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors font-medium text-sm ${
              activeTab === type
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {getTabIcon(type)}
            <span className="capitalize">{type}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {currentData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No leaderboard data available yet.</p>
            <p className="text-sm">Complete lessons to start climbing the ranks!</p>
          </div>
        ) : (
          currentData.map((entry) => (
            <div
              key={entry.id}
              className={`border rounded-lg p-4 transition-all hover:bg-gray-700/50 ${getRankBg(
                entry.rank,
                entry.is_current_user
              )}`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {entry.avatar ? (
                    <Image
                      src={entry.avatar}
                      alt={entry.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="text-gray-400" size={24} />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-semibold ${entry.is_current_user ? 'text-blue-400' : 'text-white'}`}>
                      {entry.name}
                      {entry.is_current_user && <span className="text-sm text-blue-300 ml-1">(You)</span>}
                    </h3>
                    {entry.badge && (
                      <span className="text-lg" title={entry.badge}>
                        {entry.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    Level {entry.level} • {getXPForTab(entry, activeTab).toLocaleString()} XP
                  </div>
                </div>

                {/* XP Display */}
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Star size={16} />
                    <span className="font-bold text-lg">
                      {getXPForTab(entry, activeTab).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activeTab === 'global' ? 'Total XP' : 
                     activeTab === 'weekly' ? 'This Week' : 'Today'}
                  </div>
                </div>
              </div>

              {/* Top 3 Highlights */}
              {entry.rank <= 3 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-sm font-semibold text-purple-400">
                        {entry.total_xp.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Total XP</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-400">
                        {entry.weekly_xp.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Weekly XP</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-400">
                        Level {entry.level}
                      </div>
                      <div className="text-xs text-gray-400">Current Level</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchLeaderboardData}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Refresh Rankings
        </button>
      </div>
    </div>
  );
}
