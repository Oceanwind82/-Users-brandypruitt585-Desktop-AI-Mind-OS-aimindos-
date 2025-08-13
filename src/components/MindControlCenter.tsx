'use client';

import React, { useState } from 'react';
import { useSensory, useAudioFeedback } from '@/lib/sensory-system';
import { usePredictive } from '@/lib/predictive-system';
import { useAIPersonality } from '@/lib/ai-personality';
import SpeedLanes from './SpeedLanes';
import AIPersonalitySelector from './AIPersonalitySelector';
import { 
  Settings, 
  Brain,
  Layers,
  Target,
  Sparkles,
  Eye
} from 'lucide-react';

export default function MindControlCenter() {
  const { currentTheme } = useSensory();
  const { enableAutoDraft, toggleAutoDraft } = usePredictive();
  const { activePersonality, hivemind } = useAIPersonality();
  const { onClick, onHover } = useAudioFeedback();
  
  const [isOpen, setIsOpen] = useState(false);

  const getAnimationClass = () => {
    switch (currentTheme.ui.animation) {
      case 'dramatic': return 'transition-all duration-500 ease-out transform';
      case 'snappy': return 'transition-all duration-200 ease-out transform';
      default: return 'transition-all duration-300 ease-in-out transform';
    }
  };

  return (
    <>
      {/* Control Center Toggle */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            onClick();
          }}
          onMouseEnter={onHover}
          className={`relative bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-110 text-white p-4 rounded-full shadow-lg ${getAnimationClass()}`}
        >
          <Settings className="h-6 w-6" />
          
          {/* Status Indicators */}
          <div className="absolute -top-1 -right-1 flex flex-col gap-1">
            {enableAutoDraft && (
              <div className="bg-blue-500 h-2 w-2 rounded-full animate-pulse" />
            )}
            {hivemind.isActive && (
              <div className="bg-yellow-500 h-2 w-2 rounded-full animate-pulse" />
            )}
          </div>
        </button>
      </div>

      {/* Control Panel */}
      {isOpen && (
        <div 
          className={`fixed bottom-20 left-6 w-80 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 z-40 ${getAnimationClass()}`}
          style={{ 
            background: currentTheme.ui.glassmorphism 
              ? 'rgba(0,0,0,0.2)' 
              : currentTheme.ui.background 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">Mind Control</h3>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>

          {/* Active Personality */}
          {activePersonality && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{activePersonality.avatar}</div>
                <div>
                  <h4 className="text-white font-semibold">{activePersonality.name}</h4>
                  <p className="text-gray-300 text-sm">{activePersonality.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
                <div>Creative: {Math.round(activePersonality.personality.creativity * 100)}%</div>
                <div>Risk: {Math.round(activePersonality.personality.riskTolerance * 100)}%</div>
                <div>Uses: {activePersonality.usage.totalInteractions}</div>
              </div>
            </div>
          )}
          
          {/* Hivemind Status */}
          {hivemind.isActive && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-200 font-semibold">Hivemind Active</span>
              </div>
              <div className="text-sm text-yellow-300">
                {hivemind.activePersonalities.length} AIs • {hivemind.collaboration.mode} mode
              </div>
              <div className="mt-1 text-sm text-yellow-300">
                Consensus: {Math.round(hivemind.collaboration.consensus * 100)}%
              </div>
            </div>
          )}

          {/* Quick Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm font-medium">Auto-Draft</span>
                <p className="text-gray-400 text-xs">Background content creation</p>
              </div>
              <button
                onClick={() => {
                  toggleAutoDraft();
                  onClick();
                }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  enableAutoDraft ? 'bg-blue-600' : 'bg-gray-600'
                } relative`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  enableAutoDraft ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-center">
              <Target className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Predictions</div>
              <div className="text-gray-400 text-xs">Learning patterns...</div>
            </div>
            
            <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-center">
              <Sparkles className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">Adaptations</div>
              <div className="text-gray-400 text-xs">Real-time sync</div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Lanes & AI Personality Components */}
      <SpeedLanes />
      <AIPersonalitySelector />
    </>
  );
}
