'use client';

import React, { useState } from 'react';
import { useDynamicScenes } from '@/lib/dynamic-scenes';
import { useSensory, useAudioFeedback } from '@/lib/sensory-system';
import {
  Palette,
  Wand2,
  EyeOff,
  Clock,
  Brain,
  Play,
  Pause
} from 'lucide-react';

export default function SceneControls() {
  const {
    currentScene,
    moodContext,
    autoMode,
    scenes,
    setScene,
    updateMoodContext,
    setAutoMode,
    suggestScene,
    adaptToTime
  } = useDynamicScenes();
  
  const { currentTheme } = useSensory();
  const { onClick, onHover } = useAudioFeedback();
  const [isExpanded, setIsExpanded] = useState(false);

  const getAnimationClass = () => {
    switch (currentTheme.ui.animation) {
      case 'dramatic': return 'transition-all duration-500 ease-out transform';
      case 'snappy': return 'transition-all duration-200 ease-out transform';
      default: return 'transition-all duration-300 ease-in-out transform';
    }
  };

  const activities = [
    { key: 'writing', label: 'Writing', icon: '✍️' },
    { key: 'designing', label: 'Designing', icon: '🎨' },
    { key: 'coding', label: 'Coding', icon: '💻' },
    { key: 'brainstorming', label: 'Brainstorming', icon: '💡' },
    { key: 'presenting', label: 'Presenting', icon: '🎯' },
    { key: 'researching', label: 'Researching', icon: '🔍' }
  ];

  const sceneCategories = [
    { key: 'cyberpunk', label: 'Cyberpunk', icon: '🌃', color: 'from-purple-500 to-blue-500' },
    { key: 'nature', label: 'Nature', icon: '🌿', color: 'from-green-500 to-blue-500' },
    { key: 'space', label: 'Space', icon: '🚀', color: 'from-blue-500 to-purple-500' },
    { key: 'paper', label: 'Paper', icon: '📄', color: 'from-yellow-500 to-orange-500' },
    { key: 'minimal', label: 'Minimal', icon: '⚪', color: 'from-gray-500 to-gray-700' }
  ];

  const handleSuggestScene = () => {
    const suggested = suggestScene();
    if (suggested) {
      setScene(suggested.id);
      onClick();
    }
  };

  return (
    <>
      {/* Main Toggle Button */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onClick();
          }}
          onMouseEnter={onHover}
          className={`relative bg-gradient-to-r ${
            currentScene ? 'from-indigo-500 to-purple-500' : 'from-gray-500 to-gray-600'
          } hover:scale-110 text-white px-6 py-3 rounded-full shadow-lg ${getAnimationClass()} flex items-center gap-2`}
        >
          <Palette className="h-5 w-5" />
          <span className="font-medium">{currentScene?.name || 'No Scene'}</span>
          
          {/* Auto Mode Indicator */}
          {autoMode && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              <Wand2 className="h-3 w-3" />
            </div>
          )}
        </button>
      </div>

      {/* Scene Control Panel */}
      {isExpanded && (
        <div 
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 w-96 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 z-40 ${getAnimationClass()}`}
          style={{ 
            background: currentTheme.ui.glassmorphism 
              ? 'rgba(0,0,0,0.2)' 
              : currentTheme.ui.background 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">Scene Control</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAutoMode(!autoMode);
                  onClick();
                }}
                onMouseEnter={onHover}
                className={`p-2 rounded-lg transition-colors ${
                  autoMode 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {autoMode ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Current Activity */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Current Activity
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {activities.map((activity) => (
                <button
                  key={activity.key}
                  onClick={() => {
                    updateMoodContext({ activity: activity.key as 'writing' | 'designing' | 'coding' | 'brainstorming' | 'presenting' | 'researching' });
                    onClick();
                  }}
                  onMouseEnter={onHover}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    moodContext.activity === activity.key 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{activity.icon}</span>
                    <span className="text-xs">{activity.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scene Categories */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Scene Categories</h4>
            <div className="grid grid-cols-5 gap-2">
              {sceneCategories.map((category) => {
                const categoryScenes = scenes.filter(s => s.category === category.key);
                const isActive = currentScene?.category === category.key;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => {
                      if (categoryScenes.length > 0) {
                        const randomScene = categoryScenes[Math.floor(Math.random() * categoryScenes.length)];
                        setScene(randomScene.id);
                        onClick();
                      }
                    }}
                    onMouseEnter={onHover}
                    className={`p-3 rounded-lg text-center transition-all hover:scale-105 ${
                      isActive 
                        ? `bg-gradient-to-r ${category.color} text-white` 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="text-xs">{category.label}</div>
                    <div className="text-xs opacity-60">{categoryScenes.length}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Scenes */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Available Scenes</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setScene(scene.id);
                    onClick();
                  }}
                  onMouseEnter={onHover}
                  className={`w-full p-3 rounded-lg text-left transition-all hover:scale-[1.02] ${
                    currentScene?.id === scene.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{scene.name}</h5>
                      <p className="text-xs opacity-75 capitalize">{scene.category} • {scene.type}</p>
                    </div>
                    <div className="text-sm opacity-60">
                      {scene.config.animation?.intensity ? Math.round(scene.config.animation.intensity * 100) : 0}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Context */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Mood Settings</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Focus Level</label>
                <select
                  value={moodContext.focus}
                  onChange={(e) => updateMoodContext({ focus: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Energy Level</label>
                <select
                  value={moodContext.energy}
                  onChange={(e) => updateMoodContext({ energy: e.target.value as 'calm' | 'energetic' | 'intense' })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm"
                >
                  <option value="calm">Calm</option>
                  <option value="energetic">Energetic</option>
                  <option value="intense">Intense</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSuggestScene}
              onMouseEnter={onHover}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              AI Suggest
            </button>
            
            <button
              onClick={() => {
                adaptToTime();
                onClick();
              }}
              onMouseEnter={onHover}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <Clock className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>

          {/* Current Scene Info */}
          {currentScene && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="text-sm text-gray-300">
                <div className="font-medium text-white mb-1">{currentScene.name}</div>
                <div className="flex items-center justify-between text-xs">
                  <span>Type: {currentScene.type}</span>
                  <span>Auto: {autoMode ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
