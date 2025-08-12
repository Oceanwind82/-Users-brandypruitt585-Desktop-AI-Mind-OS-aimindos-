'use client';
import { useState } from 'react';
import { CheckCircle, Star, Trophy, Target } from 'lucide-react';
import AchievementToast, { useAchievementNotifications } from '@/components/AchievementToast';

interface LessonCompletionProps {
  lessonId: string;
  lessonTitle: string;
  baseXP: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  onComplete?: (xpEarned: number) => void;
}

export default function LessonCompletion({ 
  lessonId, 
  lessonTitle, 
  baseXP, 
  difficulty,
  onComplete 
}: LessonCompletionProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { currentAchievement, showAchievement, hideAchievement } = useAchievementNotifications();

  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'Expert': return 2.0;
      case 'Advanced': return 1.5;
      case 'Intermediate': return 1.2;
      default: return 1.0;
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Expert': return 'from-red-500 to-pink-500';
      case 'Advanced': return 'from-purple-500 to-indigo-500';
      case 'Intermediate': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  const completeLesson = async () => {
    setIsCompleting(true);
    
    try {
      const finalXP = Math.round(baseXP * getDifficultyMultiplier());
      
      // Simulate API call to complete lesson
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Award XP
      const xpResponse = await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user', // Replace with actual user ID
          xpAmount: finalXP,
          source: `lesson_${lessonId}`
        })
      });

      if (xpResponse.ok) {
        setIsCompleted(true);
        
        // Show completion achievement
        showAchievement({
          id: `lesson_${lessonId}`,
          title: 'Lesson Mastered!',
          description: `Completed "${lessonTitle}"`,
          badge_icon: '📚',
          xp_bonus: finalXP,
          rarity: difficulty === 'Expert' ? 'legendary' : 
                  difficulty === 'Advanced' ? 'epic' :
                  difficulty === 'Intermediate' ? 'rare' : 'common'
        });

        // Check for milestone achievements
        checkMilestoneAchievements();
        
        onComplete?.(finalXP);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const checkMilestoneAchievements = async () => {
    // Simulate checking for milestone achievements
    setTimeout(() => {
      if (Math.random() > 0.7) { // 30% chance for demonstration
        showAchievement({
          id: 'milestone_learner',
          title: 'Dedicated Learner',
          description: 'Completed 10 lessons this week!',
          badge_icon: '🎓',
          xp_bonus: 100,
          rarity: 'rare'
        });
      }
    }, 2000);
  };

  if (isCompleted) {
    return (
      <>
        <AchievementToast 
          achievement={currentAchievement} 
          onClose={hideAchievement} 
        />
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Lesson Completed! 🎉</h3>
          <p className="text-green-200 mb-4">
            You&apos;ve mastered &quot;{lessonTitle}&quot; and earned {Math.round(baseXP * getDifficultyMultiplier())} XP!
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="bg-green-500/20 rounded-lg px-3 py-2">
              <Star className="inline mr-1" size={16} />
              +{Math.round(baseXP * getDifficultyMultiplier())} XP
            </div>
            <div className="bg-purple-500/20 rounded-lg px-3 py-2">
              <Trophy className="inline mr-1" size={16} />
              {difficulty} Mastery
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AchievementToast 
        achievement={currentAchievement} 
        onClose={hideAchievement} 
      />
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <div className="text-center mb-6">
          <Target className="mx-auto text-purple-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Ready to Complete?</h3>
          <p className="text-gray-300 mb-4">
            Finish this lesson to earn XP and unlock achievements!
          </p>
        </div>

        {/* XP Preview */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Base XP Reward:</span>
            <span className="text-yellow-400 font-bold">{baseXP} XP</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Difficulty Bonus:</span>
            <span className="text-purple-400">×{getDifficultyMultiplier()}</span>
          </div>
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Total XP:</span>
              <span className="text-green-400 font-bold text-lg">
                {Math.round(baseXP * getDifficultyMultiplier())} XP
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex justify-center mb-6">
          <div className={`bg-gradient-to-r ${getDifficultyColor()} rounded-full px-4 py-2 text-white font-semibold text-sm`}>
            {difficulty} Level
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={completeLesson}
          disabled={isCompleting}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isCompleting
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isCompleting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Completing Lesson...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CheckCircle className="mr-2" size={20} />
              Complete Lesson & Earn {Math.round(baseXP * getDifficultyMultiplier())} XP
            </div>
          )}
        </button>

        {/* Motivational Text */}
        <p className="text-center text-gray-400 text-sm mt-4">
          🚀 Keep learning to unlock more achievements and climb the leaderboard!
        </p>
      </div>
    </>
  );
}
