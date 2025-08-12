'use client';

import React from 'react';
import { SquarePen, Settings, Trophy, User } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AchievementToast, { useAchievementNotifications } from '@/components/AchievementToast';
import WorkbenchSidebar from './WorkbenchSidebar';
import WorkbenchWhiteboard from './WorkbenchWhiteboard';
import WorkbenchWritingAI from './WorkbenchWritingAI';
import WorkbenchVideoAI from './WorkbenchVideoAI';
import WorkbenchNodeAI from './WorkbenchNodeAI';

type ToolKey = 'whiteboard' | 'writing' | 'video' | 'nodes';

export default function WorkbenchApp() {
  const [tool, setTool] = React.useState<ToolKey>('whiteboard');
  const { currentAchievement, showAchievement, hideAchievement } = useAchievementNotifications();

  // Award XP for workbench usage
  React.useEffect(() => {
    const timer = setTimeout(() => {
      showAchievement({
        id: 'workbench_creator',
        title: 'Creative Genius',
        description: 'Started using the AI Mind Workbench!',
        badge_icon: '🎨',
        xp_bonus: 30,
        rarity: 'common'
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [showAchievement]);

  // Award tool-specific XP
  const handleToolSelect = (newTool: ToolKey) => {
    setTool(newTool);
    
    // Award XP for exploring different tools
    const toolAchievements = {
      whiteboard: { id: 'whiteboard_artist', title: 'Visual Thinker', description: 'Explored the whiteboard tool', icon: '🎨', xp: 15 },
      writing: { id: 'writing_master', title: 'Word Wizard', description: 'Used AI writing assistance', icon: '✍️', xp: 20 },
      video: { id: 'video_creator', title: 'Storyteller', description: 'Generated video scripts', icon: '🎬', xp: 25 },
      nodes: { id: 'node_architect', title: 'System Builder', description: 'Explored node workflows', icon: '🧠', xp: 30 }
    };

    const achievement = toolAchievements[newTool];
    setTimeout(() => {
      showAchievement({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        badge_icon: achievement.icon,
        xp_bonus: achievement.xp,
        rarity: 'common'
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Achievement Toast */}
      <AchievementToast 
        achievement={currentAchievement} 
        onClose={hideAchievement} 
      />

      {/* Header */}
      <AppHeader 
        title="🎨 AI Mind Workbench"
        subtitle="Creative tools for visual thinking and content creation"
      />

      {/* Workbench Interface */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-160px)]">
          {/* Sidebar */}
          <WorkbenchSidebar 
            active={tool} 
            onSelect={handleToolSelect} 
          />
          
          {/* Main Tool Area */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 overflow-hidden">
            {tool === 'whiteboard' && <WorkbenchWhiteboard />}
            {tool === 'writing' && <WorkbenchWritingAI />}
            {tool === 'video' && <WorkbenchVideoAI />}
            {tool === 'nodes' && <WorkbenchNodeAI />}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <SquarePen className="h-6 w-6 text-blue-400" />
              <div>
                <p className="text-blue-200 text-sm">Active Tool</p>
                <p className="text-lg font-bold text-white capitalize">{tool}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-200 text-sm">XP Earned</p>
                <p className="text-lg font-bold text-white">+{tool === 'nodes' ? 30 : tool === 'video' ? 25 : tool === 'writing' ? 20 : 15}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-purple-400" />
              <div>
                <p className="text-purple-200 text-sm">Tools Available</p>
                <p className="text-lg font-bold text-white">4</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-yellow-400" />
              <div>
                <p className="text-yellow-200 text-sm">Session</p>
                <p className="text-lg font-bold text-white">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
