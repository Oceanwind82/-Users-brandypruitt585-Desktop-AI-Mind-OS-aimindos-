'use client';
import { useState, useEffect, useCallback } from 'react';
import { Star, Award, Zap } from 'lucide-react';

interface XPData {
  current_xp: number;
  current_level: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  total_xp_earned: number;
  weekly_xp: number;
  daily_xp: number;
  rank: string;
}

interface XPProgressBarProps {
  showDetails?: boolean;
  className?: string;
}

export default function XPProgressBar({ showDetails = true, className = '' }: XPProgressBarProps) {
  const [xpData, setXpData] = useState<XPData>({
    current_xp: 0,
    current_level: 1,
    xp_for_current_level: 0,
    xp_for_next_level: 100,
    total_xp_earned: 0,
    weekly_xp: 0,
    daily_xp: 0,
    rank: 'Beginner'
  });
  const [loading, setLoading] = useState(true);
  const [animatedXP, setAnimatedXP] = useState(0);

  const fetchXPData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/xp');
      if (response.ok) {
        const data = await response.json();
        setXpData(data.xp || xpData);
      }
    } catch (error) {
      console.error('Error fetching XP data:', error);
    } finally {
      setLoading(false);
    }
  }, [xpData]);

  useEffect(() => {
    fetchXPData();
  }, [fetchXPData]);

  useEffect(() => {
    // Animate XP progress bar
    const targetXP = xpData.current_xp - xpData.xp_for_current_level;
    const duration = 1000; // 1 second
    const steps = 60; // 60fps
    const increment = targetXP / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetXP) {
        current = targetXP;
        clearInterval(timer);
      }
      setAnimatedXP(current);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [xpData.current_xp, xpData.xp_for_current_level]);

  const getProgressPercentage = () => {
    const xpInCurrentLevel = animatedXP;
    const xpNeededForLevel = xpData.xp_for_next_level - xpData.xp_for_current_level;
    return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'legend':
        return 'text-yellow-400';
      case 'master':
        return 'text-purple-400';
      case 'expert':
        return 'text-blue-400';
      case 'advanced':
        return 'text-green-400';
      case 'intermediate':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRankGradient = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'legend':
        return 'from-yellow-500 to-orange-500';
      case 'master':
        return 'from-purple-500 to-pink-500';
      case 'expert':
        return 'from-blue-500 to-cyan-500';
      case 'advanced':
        return 'from-green-500 to-emerald-500';
      case 'intermediate':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="text-yellow-400" size={20} />
          <span className="font-semibold text-white">Level {xpData.current_level}</span>
          <span className={`text-sm font-medium ${getRankColor(xpData.rank)}`}>
            {xpData.rank}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-yellow-400">
          <Star size={16} />
          <span className="font-bold">{xpData.current_xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>Progress to Level {xpData.current_level + 1}</span>
          <span>
            {Math.round(animatedXP)} / {xpData.xp_for_next_level - xpData.xp_for_current_level} XP
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getRankGradient(xpData.rank)} h-3 rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${getProgressPercentage()}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400 mt-1">
          {getProgressPercentage().toFixed(1)}% to next level
        </div>
      </div>

      {/* XP Stats */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{xpData.daily_xp}</div>
            <div className="text-xs text-gray-300">Today</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{xpData.weekly_xp}</div>
            <div className="text-xs text-gray-300">This Week</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{xpData.total_xp_earned.toLocaleString()}</div>
            <div className="text-xs text-gray-300">Total</div>
          </div>
        </div>
      )}

      {/* Level Up Preview */}
      {getProgressPercentage() > 90 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400">
            <Award size={16} />
            <span className="text-sm font-medium">
              Almost Level {xpData.current_level + 1}! Just {xpData.xp_for_next_level - xpData.current_xp} more XP to go!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone compact version for use in headers/navbars
export function CompactXPBar() {
  return (
    <XPProgressBar 
      showDetails={false} 
      className="!p-2 !bg-gray-800/80 !border-gray-600"
    />
  );
}
