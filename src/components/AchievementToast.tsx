'use client';
import { useState, useEffect } from 'react';
import { X, Trophy, Star } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  badge_icon: string;
  xp_bonus: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-yellow-500/20';
      case 'epic':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-purple-500/20';
      case 'rare':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-blue-500/20';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/50 shadow-gray-500/20';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-2xl shadow-yellow-500/30';
      case 'epic':
        return 'shadow-2xl shadow-purple-500/30';
      case 'rare':
        return 'shadow-xl shadow-blue-500/30';
      default:
        return 'shadow-lg shadow-gray-500/20';
    }
  };

  if (!achievement) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${getRarityStyles(achievement.rarity)} backdrop-blur-lg rounded-xl border p-6 max-w-sm ${getRarityGlow(achievement.rarity)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="text-yellow-400" size={20} />
            <span className="font-bold text-white text-sm uppercase tracking-wider">
              Achievement Unlocked!
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Achievement Content */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{achievement.badge_icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">{achievement.title}</h3>
            <p className="text-gray-300 text-sm mb-2">{achievement.description}</p>
            
            {/* XP Bonus */}
            {achievement.xp_bonus > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Star size={14} />
                <span className="text-sm font-medium">+{achievement.xp_bonus} XP Bonus!</span>
              </div>
            )}
            
            {/* Rarity Badge */}
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {achievement.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* Celebration Animation */}
        <div className="absolute -top-2 -left-2 w-full h-full pointer-events-none">
          <div className="animate-ping absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full opacity-75"></div>
          <div className="animate-ping absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full opacity-75" style={{animationDelay: '0.5s'}}></div>
          <div className="animate-ping absolute bottom-6 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-75" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const showAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
  };

  const hideAchievement = () => {
    setCurrentAchievement(null);
  };

  return {
    currentAchievement,
    showAchievement,
    hideAchievement
  };
}
