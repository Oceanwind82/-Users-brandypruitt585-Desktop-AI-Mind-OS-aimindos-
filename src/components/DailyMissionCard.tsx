'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, CheckCircle, Target, Flame, Calendar } from 'lucide-react';

interface DailyMission {
  id: string;
  title: string;
  description: string;
  estimated_time: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  status: 'pending' | 'completed';
  assigned_date: string;
}

interface DailyMissionCardProps {
  userPath?: string;
}

const difficultyColors = {
  easy: 'from-green-500 to-emerald-500',
  medium: 'from-yellow-500 to-orange-500',
  hard: 'from-red-500 to-pink-500'
};

const difficultyIcons = {
  easy: '🌱',
  medium: '🔥',
  hard: '💪'
};

export default function DailyMissionCard({ userPath }: DailyMissionCardProps) {
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    const fetchDailyMission = async () => {
      try {
        const params = userPath ? `?path=${userPath}` : '';
        const response = await fetch(`/api/missions/daily${params}`);
        const data = await response.json();
        
        if (data.success) {
          setMission(data.mission);
        }
      } catch (error) {
        console.error('Error fetching daily mission:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyMission();
  }, [userPath]);

  const completeMission = async () => {
    if (!mission) return;
    
    setCompleting(true);
    
    try {
      const response = await fetch('/api/missions/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: mission.id,
          completion_notes: completionNotes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMission(prev => prev ? { ...prev, status: 'completed' } : null);
        setShowNoteInput(false);
        setCompletionNotes('');
        
        // Show success message (you could add a toast notification here)
        console.log(`Mission completed! Earned ${data.xp_earned} XP`);
      }
    } catch (error) {
      console.error('Error completing mission:', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No mission available today</p>
      </div>
    );
  }

  const isCompleted = mission.status === 'completed';

  return (
    <div className={`bg-slate-800 rounded-xl p-6 border-2 transition-all duration-200 ${
      isCompleted 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-slate-700 hover:border-purple-500/30'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${difficultyColors[mission.difficulty]} flex items-center justify-center text-white font-bold mr-3`}>
            {difficultyIcons[mission.difficulty]}
          </div>
          <div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Daily Mission</span>
              {isCompleted && <CheckCircle className="w-4 h-4 text-green-400 ml-2" />}
            </div>
            <h3 className="text-lg font-bold text-white">{mission.title}</h3>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center text-purple-400 mb-1">
            <Zap className="w-4 h-4 mr-1" />
            <span className="font-bold">+{mission.xp_reward} XP</span>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>{mission.estimated_time}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4">{mission.description}</p>

      {/* Difficulty and Category */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${difficultyColors[mission.difficulty]} text-white`}>
            {mission.difficulty.toUpperCase()}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-gray-300">
            {mission.category}
          </span>
        </div>
        
        <div className="flex items-center text-orange-400">
          <Flame className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Streak Builder</span>
        </div>
      </div>

      {/* Completion Section */}
      {!isCompleted && (
        <div>
          {!showNoteInput ? (
            <button
              onClick={() => setShowNoteInput(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Complete Mission
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Optional: Share how you completed this mission..."
                className="w-full bg-slate-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={completeMission}
                  disabled={completing}
                  className="flex-1 bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {completing ? 'Completing...' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 font-medium">Mission Completed!</p>
          <p className="text-green-200 text-sm">You earned {mission.xp_reward} XP</p>
        </div>
      )}

      {/* Streak Info */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Complete daily missions to build your streak</span>
          <div className="flex items-center text-orange-400">
            <Flame className="w-4 h-4 mr-1" />
            <span className="font-medium">Day 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
