'use client';

import React, { useState } from 'react';
import { useAIPersonality } from '@/lib/ai-personality';
import { useSensory, useAudioFeedback } from '@/lib/sensory-system';
import { 
  Users, 
  Brain, 
  Star, 
  MessageSquare, 
  Zap,
  Download,
  Upload,
  Plus,
  X,
  Play,
  Pause
} from 'lucide-react';

export default function AIPersonalitySelector() {
  const { 
    personalities, 
    activePersonality, 
    hivemind,
    switchPersonality,
    activateHivemind,
    deactivateHivemind,
    askHivemind,
    exportPersonality,
    importPersonality
  } = useAIPersonality();
  
  const { currentTheme } = useSensory();
  const { onClick, onHover } = useAudioFeedback();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHivemind, setShowHivemind] = useState(false);
  const [selectedForHivemind, setSelectedForHivemind] = useState<string[]>([]);
  const [hivemindMode, setHivemindMode] = useState<'sequential' | 'parallel' | 'debate' | 'synthesis'>('sequential');
  const [testQuestion, setTestQuestion] = useState('');
  const [testResult, setTestResult] = useState('');

  const getPersonalityColor = (personality: typeof personalities[0]) => {
    const colors = {
      creator: 'from-purple-500 to-pink-500',
      analyst: 'from-blue-500 to-cyan-500',
      facilitator: 'from-green-500 to-emerald-500',
      innovator: 'from-yellow-500 to-orange-500',
      mentor: 'from-indigo-500 to-purple-500'
    };
    return colors[personality.id as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getAnimationClass = () => {
    switch (currentTheme.ui.animation) {
      case 'dramatic': return 'transition-all duration-500 ease-out transform';
      case 'snappy': return 'transition-all duration-200 ease-out transform';
      default: return 'transition-all duration-300 ease-in-out transform';
    }
  };

  const handleHivemindTest = async () => {
    if (!testQuestion.trim()) return;
    
    try {
      const result = await askHivemind(testQuestion);
      setTestResult(result);
    } catch {
      setTestResult('Error: Hivemind is not active');
    }
  };

  const handleFileImport = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    file.text().then(async (text) => {
      try {
        await importPersonality(text);
        onClick();
      } catch {
        alert('Failed to import personality');
      }
    });
  };

  return (
    <>
      {/* Main Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onClick();
          }}
          onMouseEnter={onHover}
          className={`relative bg-gradient-to-r ${getPersonalityColor(activePersonality || personalities[0])} hover:scale-110 text-white p-4 rounded-full shadow-lg ${getAnimationClass()}`}
        >
          <Brain className="h-6 w-6" />
          
          {/* Active Personality Indicator */}
          <div className="absolute -bottom-1 -right-1 bg-white text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {activePersonality?.avatar}
          </div>
          
          {/* Hivemind Indicator */}
          {hivemind.isActive && (
            <div className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              <Users className="h-3 w-3" />
            </div>
          )}
        </button>
      </div>

      {/* Personality Panel */}
      {isExpanded && (
        <div 
          className={`fixed top-20 right-6 w-96 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 z-40 ${getAnimationClass()}`}
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
              <h3 className="text-xl font-bold text-white">AI Personalities</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowHivemind(!showHivemind);
                  onClick();
                }}
                onMouseEnter={onHover}
                className={`p-2 rounded-lg transition-colors ${
                  hivemind.isActive 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'bg-gray-500/20 text-gray-400 hover:text-white'
                }`}
              >
                <Users className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active Personality Info */}
          {activePersonality && (
            <div className={`mb-6 p-4 rounded-lg bg-gradient-to-r ${getPersonalityColor(activePersonality)}/20 border border-white/10`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{activePersonality.avatar}</div>
                <div>
                  <h4 className="text-white font-semibold">{activePersonality.name}</h4>
                  <p className="text-gray-300 text-sm">{activePersonality.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {activePersonality.usage.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {activePersonality.usage.totalInteractions}
                </div>
              </div>
            </div>
          )}

          {/* Personality Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {personalities.map((personality) => (
              <button
                key={personality.id}
                onClick={() => {
                  switchPersonality(personality.id);
                  onClick();
                }}
                onMouseEnter={onHover}
                className={`p-3 rounded-lg border transition-all text-left hover:scale-[1.02] ${
                  activePersonality?.id === personality.id
                    ? `bg-gradient-to-r ${getPersonalityColor(personality)}/30 border-white/30`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">{personality.avatar}</div>
                  <div className="flex-1">
                    <h5 className="text-white font-medium text-sm">{personality.name}</h5>
                    <p className="text-gray-400 text-xs">{personality.personality.tone}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Creative: {Math.round(personality.personality.creativity * 100)}%</span>
                  <span>{personality.usage.totalInteractions} uses</span>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                // TODO: Implement personality creator
                console.log('Personality creator coming soon');
                onClick();
              }}
              onMouseEnter={onHover}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
            
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = handleFileImport;
                input.click();
                onClick();
              }}
              onMouseEnter={onHover}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Upload className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => {
                if (activePersonality) {
                  const data = exportPersonality(activePersonality.id);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activePersonality.name}.json`;
                  a.click();
                  onClick();
                }
              }}
              onMouseEnter={onHover}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Hivemind Panel */}
          {showHivemind && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Hivemind Mode
              </h4>
              
              {!hivemind.isActive ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {personalities.map((personality) => (
                      <label
                        key={personality.id}
                        className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedForHivemind.includes(personality.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForHivemind(prev => [...prev, personality.id]);
                            } else {
                              setSelectedForHivemind(prev => prev.filter(id => id !== personality.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span>{personality.avatar} {personality.name}</span>
                      </label>
                    ))}
                  </div>
                  
                  <select
                    value={hivemindMode}
                    onChange={(e) => setHivemindMode(e.target.value as 'sequential' | 'parallel' | 'debate' | 'synthesis')}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                  >
                    <option value="sequential">Sequential</option>
                    <option value="parallel">Parallel</option>
                    <option value="debate">Debate</option>
                    <option value="synthesis">Synthesis</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      if (selectedForHivemind.length >= 2) {
                        activateHivemind(selectedForHivemind, hivemindMode);
                        onClick();
                      }
                    }}
                    disabled={selectedForHivemind.length < 2}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Activate Hivemind
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm mb-2">
                      Active: {hivemind.activePersonalities.length} AIs in {hivemind.collaboration.mode} mode
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      {hivemind.activePersonalities.map(id => {
                        const personality = personalities.find(p => p.id === id);
                        return personality ? (
                          <span key={id} className="text-lg">{personality.avatar}</span>
                        ) : null;
                      })}
                    </div>
                    <div className="text-xs text-yellow-300">
                      Consensus: {Math.round(hivemind.collaboration.consensus * 100)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={testQuestion}
                      onChange={(e) => setTestQuestion(e.target.value)}
                      placeholder="Ask the hivemind..."
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm placeholder-gray-400"
                    />
                    <button
                      onClick={handleHivemindTest}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Zap className="h-4 w-4 inline mr-2" />
                      Ask Hivemind
                    </button>
                    
                    {testResult && (
                      <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                        {testResult}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      deactivateHivemind();
                      setTestResult('');
                      onClick();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Deactivate Hivemind
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
