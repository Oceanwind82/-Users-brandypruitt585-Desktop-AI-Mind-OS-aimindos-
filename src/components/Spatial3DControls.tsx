'use client';

import React, { useState } from 'react';
import { useSpatial3D } from '@/lib/spatial-3d';
import { useSensory, useAudioFeedback } from '@/lib/sensory-system';
import {
  Box,
  Grid3X3,
  Circle,
  Eye,
  EyeOff,
  Move3D,
  Camera
} from 'lucide-react';

export default function Spatial3DControls() {
  const {
    mode,
    environment,
    panels,
    setMode,
    setEnvironment,
    arrangeInGrid,
    arrangeInCircle,
    loadPreset,
    activePanel
  } = useSpatial3D();
  
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

  const environmentPresets = [
    { key: 'minimal', label: 'Minimal', icon: '⚪', color: 'bg-gray-500' },
    { key: 'cyberpunk', label: 'Cyberpunk', icon: '🌃', color: 'bg-purple-500' },
    { key: 'paper', label: 'Paper', icon: '📄', color: 'bg-yellow-500' },
    { key: 'nature', label: 'Nature', icon: '🌿', color: 'bg-green-500' },
    { key: 'space', label: 'Space', icon: '🚀', color: 'bg-blue-500' }
  ];

  const cameraModes = [
    { key: 'orbit', label: 'Orbit', icon: <Move3D className="h-4 w-4" /> },
    { key: 'fly', label: 'Fly', icon: <Camera className="h-4 w-4" /> },
    { key: 'fixed', label: 'Fixed', icon: <Eye className="h-4 w-4" /> }
  ];

  return (
    <>
      {/* Main Toggle Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onClick();
          }}
          onMouseEnter={onHover}
          className={`relative bg-gradient-to-r ${
            mode.is3D 
              ? 'from-purple-500 to-blue-500' 
              : 'from-gray-500 to-gray-600'
          } hover:scale-110 text-white p-4 rounded-full shadow-lg ${getAnimationClass()}`}
        >
          <Box className="h-6 w-6" />
          
          {/* Active Panel Count */}
          {panels.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {panels.length}
            </div>
          )}
          
          {/* 3D Mode Indicator */}
          <div className={`absolute -bottom-1 -left-1 rounded-full h-5 w-5 flex items-center justify-center text-xs ${
            mode.is3D ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            {mode.is3D ? '3D' : '2D'}
          </div>
        </button>
      </div>

      {/* Controls Panel */}
      {isExpanded && (
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
              <Box className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">3D Spatial</h3>
            </div>
            
            <button
              onClick={() => {
                setMode({ is3D: !mode.is3D });
                onClick();
              }}
              onMouseEnter={onHover}
              className={`p-2 rounded-lg transition-colors ${
                mode.is3D 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {mode.is3D ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Display Mode</h4>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode({ is3D: true });
                  onClick();
                }}
                onMouseEnter={onHover}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode.is3D 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                3D Space
              </button>
              <button
                onClick={() => {
                  setMode({ is3D: false });
                  onClick();
                }}
                onMouseEnter={onHover}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !mode.is3D 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                2D Layout
              </button>
            </div>
          </div>

          {mode.is3D && (
            <>
              {/* Camera Controls */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Camera Mode</h4>
                <div className="grid grid-cols-3 gap-2">
                  {cameraModes.map((cam) => (
                    <button
                      key={cam.key}
                      onClick={() => {
                        setMode({ cameraMode: cam.key as 'orbit' | 'fly' | 'fixed' });
                        onClick();
                      }}
                      onMouseEnter={onHover}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        mode.cameraMode === cam.key 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {cam.icon}
                        <span className="text-xs">{cam.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment Presets */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Environment</h4>
                <div className="grid grid-cols-5 gap-2">
                  {environmentPresets.map((env) => (
                    <button
                      key={env.key}
                      onClick={() => {
                        loadPreset(env.key);
                        onClick();
                      }}
                      onMouseEnter={onHover}
                      className={`p-3 rounded-lg text-center transition-all hover:scale-105 ${
                        environment.scene === env.key 
                          ? `${env.color} text-white` 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="text-lg mb-1">{env.icon}</div>
                      <div className="text-xs">{env.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrangement Controls */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Panel Layout</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      arrangeInGrid();
                      onClick();
                    }}
                    onMouseEnter={onHover}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </button>
                  
                  <button
                    onClick={() => {
                      arrangeInCircle();
                      onClick();
                    }}
                    onMouseEnter={onHover}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Circle className="h-4 w-4" />
                    Circle
                  </button>
                </div>
              </div>

              {/* Physics & Effects */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3">Physics & Effects</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                    <span>Physics</span>
                    <input
                      type="checkbox"
                      checked={mode.physics}
                      onChange={(e) => setMode({ physics: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                    <span>Auto Arrange</span>
                    <input
                      type="checkbox"
                      checked={mode.autoArrange}
                      onChange={(e) => setMode({ autoArrange: e.target.checked })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                    <span>Fog Effects</span>
                    <input
                      type="checkbox"
                      checked={environment.atmosphere.fog}
                      onChange={(e) => setEnvironment({ 
                        atmosphere: { ...environment.atmosphere, fog: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                    <span>Particles</span>
                    <input
                      type="checkbox"
                      checked={environment.atmosphere.particles}
                      onChange={(e) => setEnvironment({ 
                        atmosphere: { ...environment.atmosphere, particles: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="border-t border-white/10 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-medium">Panels</div>
                <div className="text-white font-bold">{panels.length}</div>
              </div>
              <div>
                <div className="font-medium">Active</div>
                <div className="text-white font-bold">{activePanel ? '1' : '0'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
