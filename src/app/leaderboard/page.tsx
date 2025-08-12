'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Award, Users, ArrowLeft } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  level: number;
  xp: number;
  missions_completed: number;
  achievements_count: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default:
        return 'bg-gray-800/50 border-gray-700/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400">Error: {error}</p>
            <button 
              onClick={fetchLeaderboard}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold">Global Leaderboard</h1>
          </div>
          <p className="text-gray-400">
            See how you rank against other AI Mind OS users
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No leaderboard data available yet.</p>
              <p className="text-gray-500 mt-2">Complete some missions to appear on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((user) => (
              <div
                key={user.id}
                className={`p-6 rounded-xl border ${getRankColor(user.rank)} transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(user.rank)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      <p className="text-gray-400">Level {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{user.xp.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-green-400">{user.missions_completed}</p>
                        <p className="text-sm text-gray-400">Missions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-purple-400">{user.achievements_count}</p>
                        <p className="text-sm text-gray-400">Achievements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            Leaderboard updates every hour. Keep completing missions to climb the ranks!
          </p>
        </div>
      </div>
    </div>
  );
}
