'use client';
import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Star, Gift } from 'lucide-react';

interface UserProfile {
  display_name: string;
  path: string;
  xp: number;
  streak: number;
  skill_level: string;
}

interface TodayMission {
  id: string;
  title: string;
  topic: string;
  difficulty: number;
  xp_reward: number;
  status: 'open' | 'done' | 'locked';
  description: string;
}

interface Achievement {
  achievement_type: string;
  title: string;
  badge_icon: string;
  unlocked_at: string;
}

interface LearningStats {
  total_lessons: number;
  amazing_lessons: number;
  avg_amazingness: number;
  total_hours: number;
}

interface DashboardData {
  profile: UserProfile;
  today_mission: TodayMission;
  recent_achievements: Achievement[];
  stats: LearningStats;
}

export default function GamificationPanel() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would call your API
      // For now, we'll use mock data to demonstrate the UI
      const mockData: DashboardData = {
        profile: {
          display_name: 'AI Learner',
          path: 'Builder',
          xp: 850,
          streak: 7,
          skill_level: 'intermediate'
        },
        today_mission: {
          id: '1',
          title: 'Build an AI Project Component',
          topic: 'AI Development',
          difficulty: 5,
          xp_reward: 20,
          status: 'open',
          description: 'Personalized AI Development mission for your learning journey'
        },
        recent_achievements: [
          {
            achievement_type: 'streak_7',
            title: '🚀 Weekly Warrior',
            badge_icon: '🚀',
            unlocked_at: new Date().toISOString()
          },
          {
            achievement_type: 'perfect_score',
            title: '💎 Perfect Score',
            badge_icon: '💎',
            unlocked_at: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        stats: {
          total_lessons: 25,
          amazing_lessons: 18,
          avg_amazingness: 127.5,
          total_hours: 12.5
        }
      };

      setDashboardData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const getXPProgress = (xp: number) => {
    const level = Math.floor(xp / 100);
    const progress = (xp % 100);
    return { level, progress };
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-400 bg-green-400/10';
    if (difficulty <= 6) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getPathEmoji = (path: string) => {
    switch (path) {
      case 'Builder': return '🛠️';
      case 'Automator': return '⚡';
      case 'Deal-Maker': return '💼';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-white/5 rounded-xl"></div>
        <div className="h-24 bg-white/5 rounded-xl"></div>
        <div className="h-40 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8 text-gray-400">
        Failed to load gamification data
      </div>
    );
  }

  const { profile, today_mission, recent_achievements, stats } = dashboardData;
  const { level, progress } = getXPProgress(profile.xp);

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getPathEmoji(profile.path)}</div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
              <p className="text-purple-200">{profile.path} • Level {level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Star size={16} />
              <span className="font-bold">{profile.xp} XP</span>
            </div>
            <div className="flex items-center space-x-2 text-orange-400 mt-1">
              <Flame size={16} />
              <span className="font-bold">{profile.streak} day streak</span>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            {progress}/100 XP to next level
          </p>
        </div>
      </div>

      {/* Today's Mission */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Today&apos;s Mission</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-white mb-1">{today_mission.title}</h4>
              <p className="text-sm text-gray-300 mb-2">{today_mission.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-purple-300">📚 {today_mission.topic}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(today_mission.difficulty)}`}>
                  Difficulty: {today_mission.difficulty}/10
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold">+{today_mission.xp_reward} XP</div>
              {today_mission.status === 'done' ? (
                <div className="text-green-400 text-sm mt-1">✅ Complete</div>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm mt-2 transition-colors">
                  Start Mission
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recent_achievements.length > 0 && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="text-yellow-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Recent Achievements</h3>
          </div>
          
          <div className="space-y-3">
            {recent_achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="text-2xl">{achievement.badge_icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{achievement.title}</h4>
                  <p className="text-xs text-gray-400">
                    Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </p>
                </div>
                <Gift className="text-yellow-400" size={16} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Stats */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Learning Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.total_lessons}</div>
            <div className="text-sm text-gray-300">Total Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.amazing_lessons}</div>
            <div className="text-sm text-gray-300">Amazing Scores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.avg_amazingness}</div>
            <div className="text-sm text-gray-300">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.total_hours}h</div>
            <div className="text-sm text-gray-300">Study Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
