'use client';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
// Ensure SourcePanel.tsx exists in the same folder, or update the path below if needed:
import SourcePanel from '@/components/SourcePanel';
import AppHeader from '@/components/AppHeader';
import AchievementToast, { useAchievementNotifications } from '@/components/AchievementToast';
import { useEffect } from 'react';

export default function WhiteboardApp() {
  const { currentAchievement, showAchievement, hideAchievement } = useAchievementNotifications();

  // Award XP for whiteboard usage
  useEffect(() => {
    const timer = setTimeout(() => {
      showAchievement({
        id: 'whiteboard_explorer',
        title: 'Whiteboard Explorer',
        description: 'Started your first whiteboard session!',
        badge_icon: '🎨',
        xp_bonus: 25,
        rarity: 'common'
      });
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [showAchievement]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Achievement Toast */}
      <AchievementToast 
        achievement={currentAchievement} 
        onClose={hideAchievement} 
      />

      {/* Header */}
      <AppHeader 
        title="🎨 AI Mind Whiteboard"
        subtitle="Visual AI canvas for mind mapping and brainstorming"
      />

      {/* Main whiteboard area */}
      <div className="h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-3">
        {/* Whiteboard Canvas */}
        <div className="lg:col-span-2 bg-white/5 border-r border-white/10">
          <div className="h-full relative">
            <Tldraw 
              inferDarkMode 
              persistenceKey="ai-mind-os-whiteboard"
            />
          </div>
        </div>
        
        {/* AI Source Panel */}
        <div className="lg:col-span-1">
          <SourcePanel />
        </div>
      </div>
    </div>
  );
}
