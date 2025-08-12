'use client';
import { useState, useEffect, useCallback } from 'react';
import { Target, Clock, CheckCircle, Star, Trophy } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'special';
  xp_reward: number;
  requirements: {
    target_value: number;
    current_value: number;
    unit: string;
  };
  status: 'active' | 'completed' | 'expired';
  expires_at?: string;
  completed_at?: string;
}

interface MissionStats {
  active_missions: number;
  completed_today: number;
  total_completed: number;
  streak_days: number;
}

export default function MissionTracker() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats>({
    active_missions: 0,
    completed_today: 0,
    total_completed: 0,
    streak_days: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchMissionData = useCallback(async () => {
    try {
      const [missionsRes, statsRes] = await Promise.all([
        fetch('/api/missions'),
        fetch('/api/missions/stats')
      ]);

      if (missionsRes.ok) {
        const missionsData = await missionsRes.json();
        setMissions(missionsData.missions || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching mission data:', error);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    fetchMissionData();
  }, [fetchMissionData]);

  const claimMissionReward = async (missionId: string) => {
    try {
      const response = await fetch(`/api/missions/${missionId}/claim`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchMissionData(); // Refresh data
      }
    } catch (error) {
      console.error('Error claiming mission reward:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'weekly':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'achievement':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'special':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getProgressPercentage = (mission: Mission) => {
    return Math.min(
      (mission.requirements.current_value / mission.requirements.target_value) * 100,
      100
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeMissions = missions.filter(m => m.status === 'active');
  const completedMissions = missions.filter(m => m.status === 'completed');

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="text-green-400" size={24} />
          <h2 className="text-xl font-bold text-white">Mission Tracker</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Trophy size={16} />
          <span>{stats.streak_days} day streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.active_missions}</div>
          <div className="text-sm text-gray-300">Active Missions</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.completed_today}</div>
          <div className="text-sm text-gray-300">Completed Today</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.total_completed}</div>
          <div className="text-sm text-gray-300">Total Completed</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.streak_days}</div>
          <div className="text-sm text-gray-300">Streak Days</div>
        </div>
      </div>

      {/* Active Missions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Missions</h3>
        {activeMissions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Target size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active missions. Complete lessons to unlock new missions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
              >
                {/* Mission Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getTypeColor(mission.type)}`}>
                        {mission.type}
                      </span>
                      {mission.expires_at && (
                        <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                          <Clock size={12} />
                          <span>{getTimeRemaining(mission.expires_at)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-white">{mission.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{mission.description}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400 ml-4">
                    <Star size={16} />
                    <span className="font-semibold">{mission.xp_reward}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Progress</span>
                    <span>
                      {mission.requirements.current_value} / {mission.requirements.target_value} {mission.requirements.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(mission)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {getProgressPercentage(mission).toFixed(0)}% Complete
                  </div>
                </div>

                {/* Action Button */}
                {getProgressPercentage(mission) >= 100 ? (
                  <button
                    onClick={() => claimMissionReward(mission.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Claim Reward</span>
                  </button>
                ) : (
                  <div className="w-full bg-gray-600/50 text-gray-400 py-2 px-4 rounded-lg text-center">
                    In Progress
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completions */}
      {completedMissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recently Completed</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {completedMissions.slice(0, 5).map((mission) => (
              <div
                key={mission.id}
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-400" size={20} />
                  <div>
                    <div className="font-medium text-white">{mission.title}</div>
                    <div className="text-sm text-gray-400">
                      Completed {mission.completed_at ? new Date(mission.completed_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star size={16} />
                  <span className="font-semibold">+{mission.xp_reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
