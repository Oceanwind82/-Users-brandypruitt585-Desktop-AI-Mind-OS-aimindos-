'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Scene Types
export interface SceneBackdrop {
  id: string;
  name: string;
  type: 'gradient' | 'animated' | 'video' | 'webgl' | 'particles';
  category: 'cyberpunk' | 'nature' | 'space' | 'paper' | 'minimal' | 'creative';
  config: {
    colors?: string[];
    animation?: {
      type: 'float' | 'pulse' | 'wave' | 'spiral' | 'chaos';
      speed: number;
      intensity: number;
    };
    effects?: {
      particles?: boolean;
      fog?: boolean;
      glitch?: boolean;
      holographic?: boolean;
      paper_texture?: boolean;
    };
    responsive?: boolean;
  };
  css?: string;
  webgl?: {
    shader: string;
    uniforms: Record<string, unknown>;
  };
}

export interface MoodContext {
  activity: 'writing' | 'designing' | 'coding' | 'brainstorming' | 'presenting' | 'researching';
  focus: 'high' | 'medium' | 'low';
  creativity: 'analytical' | 'balanced' | 'artistic';
  energy: 'calm' | 'energetic' | 'intense';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface DynamicScenesContextType {
  currentScene: SceneBackdrop | null;
  moodContext: MoodContext;
  autoMode: boolean;
  scenes: SceneBackdrop[];
  
  // Scene Management
  setScene: (sceneId: string) => void;
  updateMoodContext: (context: Partial<MoodContext>) => void;
  setAutoMode: (enabled: boolean) => void;
  
  // AI Scene Selection
  suggestScene: () => SceneBackdrop | null;
  adaptToActivity: (activity: MoodContext['activity']) => void;
  adaptToTime: () => void;
  
  // Custom Scenes
  createCustomScene: (scene: Omit<SceneBackdrop, 'id'>) => string;
  saveCurrentAsPreset: (name: string) => void;
}

const DynamicScenesContext = createContext<DynamicScenesContextType | null>(null);

// Predefined scene backdrops
const DEFAULT_SCENES: SceneBackdrop[] = [
  // Cyberpunk Scenes
  {
    id: 'cyberpunk_city',
    name: 'Neon Metropolis',
    type: 'animated',
    category: 'cyberpunk',
    config: {
      colors: ['#0f0f0f', '#1a1a2e', '#16213e', '#8b5cf6', '#06b6d4'],
      animation: { type: 'wave', speed: 0.5, intensity: 0.3 },
      effects: { particles: true, glitch: true, holographic: true }
    },
    css: `
      background: linear-gradient(45deg, #0f0f0f 0%, #1a1a2e 25%, #16213e 50%, #8b5cf6 75%, #06b6d4 100%);
      background-size: 400% 400%;
      animation: neonPulse 8s ease-in-out infinite;
    `
  },
  {
    id: 'cyberpunk_rain',
    name: 'Digital Rain',
    type: 'webgl',
    category: 'cyberpunk',
    config: {
      colors: ['#000000', '#003300', '#00ff00'],
      animation: { type: 'chaos', speed: 2, intensity: 0.8 },
      effects: { particles: true, glitch: false }
    },
    webgl: {
      shader: 'matrix_rain',
      uniforms: { speed: 2.0, density: 0.8, color: [0, 1, 0] }
    }
  },
  
  // Nature Scenes
  {
    id: 'forest_morning',
    name: 'Forest Dawn',
    type: 'gradient',
    category: 'nature',
    config: {
      colors: ['#1e3a8a', '#3b82f6', '#10b981', '#fbbf24'],
      animation: { type: 'float', speed: 0.2, intensity: 0.1 },
      effects: { particles: true, fog: true }
    },
    css: `
      background: linear-gradient(180deg, #1e3a8a 0%, #3b82f6 30%, #10b981 70%, #fbbf24 100%);
      background-size: 100% 200%;
      animation: forestBreeze 12s ease-in-out infinite;
    `
  },
  {
    id: 'ocean_waves',
    name: 'Ocean Depths',
    type: 'animated',
    category: 'nature',
    config: {
      colors: ['#0c4a6e', '#0284c7', '#06b6d4', '#67e8f9'],
      animation: { type: 'wave', speed: 0.8, intensity: 0.4 },
      effects: { particles: true, fog: false }
    },
    css: `
      background: radial-gradient(circle at 50% 80%, #0c4a6e 0%, #0284c7 40%, #06b6d4 70%, #67e8f9 100%);
      background-size: 150% 150%;
      animation: oceanWaves 10s ease-in-out infinite;
    `
  },
  
  // Space Scenes
  {
    id: 'nebula_purple',
    name: 'Purple Nebula',
    type: 'webgl',
    category: 'space',
    config: {
      colors: ['#000000', '#1a1a2e', '#8b5cf6', '#d946ef'],
      animation: { type: 'spiral', speed: 0.3, intensity: 0.5 },
      effects: { particles: true, fog: true }
    },
    webgl: {
      shader: 'nebula',
      uniforms: { time: 0, color1: [0.545, 0.361, 0.965], color2: [0.851, 0.275, 0.937] }
    }
  },
  {
    id: 'starfield',
    name: 'Deep Space',
    type: 'particles',
    category: 'space',
    config: {
      colors: ['#000000', '#ffffff'],
      animation: { type: 'float', speed: 0.1, intensity: 0.2 },
      effects: { particles: true, fog: false }
    },
    css: `
      background: radial-gradient(circle at 20% 30%, #1a1a2e 0%, #000000 50%);
    `
  },
  
  // Paper Scenes
  {
    id: 'paper_vintage',
    name: 'Vintage Paper',
    type: 'gradient',
    category: 'paper',
    config: {
      colors: ['#fef3c7', '#fbbf24', '#d97706'],
      animation: { type: 'float', speed: 0.1, intensity: 0.05 },
      effects: { paper_texture: true }
    },
    css: `
      background: linear-gradient(45deg, #fef3c7 0%, #fbbf24 50%, #d97706 100%);
      background-size: 300% 300%;
      animation: paperFloat 15s ease-in-out infinite;
    `
  },
  {
    id: 'paper_clean',
    name: 'Clean Sheet',
    type: 'gradient',
    category: 'paper',
    config: {
      colors: ['#ffffff', '#f8fafc', '#e2e8f0'],
      animation: { type: 'pulse', speed: 0.05, intensity: 0.02 },
      effects: { paper_texture: true }
    },
    css: `
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
    `
  },
  
  // Minimal Scenes
  {
    id: 'minimal_dark',
    name: 'Deep Focus',
    type: 'gradient',
    category: 'minimal',
    config: {
      colors: ['#000000', '#1a1a1a', '#2a2a2a'],
      animation: { type: 'pulse', speed: 0.1, intensity: 0.1 },
      effects: {}
    },
    css: `
      background: linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%);
    `
  },
  {
    id: 'minimal_light',
    name: 'Clean Slate',
    type: 'gradient',
    category: 'minimal',
    config: {
      colors: ['#f8fafc', '#e2e8f0', '#cbd5e1'],
      animation: { type: 'float', speed: 0.05, intensity: 0.05 },
      effects: {}
    },
    css: `
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
    `
  }
];

// CSS Animations
const SCENE_ANIMATIONS = `
@keyframes neonPulse {
  0%, 100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  50% { background-position: 100% 50%; filter: hue-rotate(30deg); }
}

@keyframes forestBreeze {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}

@keyframes oceanWaves {
  0%, 100% { background-position: 50% 0%; transform: scale(1); }
  50% { background-position: 80% 50%; transform: scale(1.1); }
}

@keyframes paperFloat {
  0%, 100% { background-position: 0% 50%; }
  33% { background-position: 100% 0%; }
  66% { background-position: 50% 100%; }
}
`;

export function DynamicScenesProvider({ children }: { children: ReactNode }) {
  const [scenes] = useState<SceneBackdrop[]>(DEFAULT_SCENES);
  const [currentScene, setCurrentScene] = useState<SceneBackdrop | null>(null);
  const [autoMode, setAutoModeState] = useState(true);
  const [moodContext, setMoodContextState] = useState<MoodContext>({
    activity: 'brainstorming',
    focus: 'medium',
    creativity: 'balanced',
    energy: 'calm',
    timeOfDay: 'afternoon'
  });

  // Inject CSS animations on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = SCENE_ANIMATIONS;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-detect time of day
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      let timeOfDay: MoodContext['timeOfDay'];
      
      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';
      
      setMoodContextState(prev => ({ ...prev, timeOfDay }));
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('dynamic_scenes_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentScene) {
          const scene = scenes.find(s => s.id === parsed.currentScene.id);
          if (scene) setCurrentScene(scene);
        }
        if (parsed.autoMode !== undefined) setAutoModeState(parsed.autoMode);
        if (parsed.moodContext) setMoodContextState(prev => ({ ...prev, ...parsed.moodContext }));
      } catch (error) {
        console.error('Failed to load dynamic scenes state:', error);
      }
    }
    
    // Set default scene if none selected
    if (!currentScene && scenes.length > 0) {
      setCurrentScene(scenes.find(s => s.id === 'minimal_dark') || scenes[0]);
    }
  }, [scenes, currentScene]);

  // Save state changes
  useEffect(() => {
    localStorage.setItem('dynamic_scenes_state', JSON.stringify({
      currentScene: currentScene ? { id: currentScene.id } : null,
      autoMode,
      moodContext
    }));
  }, [currentScene, autoMode, moodContext]);

  const setScene = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentScene(scene);
    }
  };

  const updateMoodContext = (context: Partial<MoodContext>) => {
    setMoodContextState(prev => ({ ...prev, ...context }));
    
    // Auto-adapt scene if enabled
    if (autoMode) {
      const suggested = suggestSceneForContext({ ...moodContext, ...context });
      if (suggested && suggested.id !== currentScene?.id) {
        setCurrentScene(suggested);
      }
    }
  };

  const setAutoMode = (enabled: boolean) => {
    setAutoModeState(enabled);
    
    if (enabled) {
      const suggested = suggestScene();
      if (suggested) setCurrentScene(suggested);
    }
  };

  const suggestSceneForContext = (context: MoodContext): SceneBackdrop | null => {
    // AI-like scene suggestion based on context
    let category: SceneBackdrop['category'] = 'minimal';
    
    switch (context.activity) {
      case 'writing':
        category = context.creativity === 'artistic' ? 'paper' : 'minimal';
        break;
      case 'designing':
        category = 'creative';
        break;
      case 'coding':
        category = context.timeOfDay === 'night' ? 'cyberpunk' : 'minimal';
        break;
      case 'brainstorming':
        category = context.energy === 'intense' ? 'cyberpunk' : 'nature';
        break;
      case 'presenting':
        category = 'minimal';
        break;
      case 'researching':
        category = context.focus === 'high' ? 'minimal' : 'nature';
        break;
    }
    
    // Find matching scenes
    const categoryScenes = scenes.filter(s => s.category === category);
    if (categoryScenes.length === 0) {
      return scenes.find(s => s.category === 'minimal') || scenes[0];
    }
    
    // Further refine based on energy and time
    let filtered = categoryScenes;
    
    if (context.energy === 'calm') {
      filtered = filtered.filter(s => 
        s.config.animation?.intensity && s.config.animation.intensity < 0.3
      );
    } else if (context.energy === 'intense') {
      filtered = filtered.filter(s => 
        s.config.animation?.intensity && s.config.animation.intensity > 0.5
      );
    }
    
    if (filtered.length === 0) filtered = categoryScenes;
    
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  const suggestScene = () => {
    return suggestSceneForContext(moodContext);
  };

  const adaptToActivity = (activity: MoodContext['activity']) => {
    updateMoodContext({ activity });
  };

  const adaptToTime = () => {
    const hour = new Date().getHours();
    let energy: MoodContext['energy'] = 'calm';
    
    if (hour >= 6 && hour < 10) energy = 'energetic'; // Morning
    else if (hour >= 10 && hour < 14) energy = 'intense'; // Peak hours
    else if (hour >= 14 && hour < 18) energy = 'energetic'; // Afternoon
    else energy = 'calm'; // Evening/Night
    
    updateMoodContext({ energy });
  };

  const createCustomScene = (sceneData: Omit<SceneBackdrop, 'id'>): string => {
    const id = `custom_${Date.now()}`;
    const newScene: SceneBackdrop = { ...sceneData, id };
    
    // In a real app, you'd add this to a custom scenes collection
    setCurrentScene(newScene);
    return id;
  };

  const saveCurrentAsPreset = (name: string) => {
    if (currentScene) {
      const customScenes = JSON.parse(localStorage.getItem('custom_scenes') || '[]');
      customScenes.push({ ...currentScene, name, id: `preset_${Date.now()}` });
      localStorage.setItem('custom_scenes', JSON.stringify(customScenes));
    }
  };

  return (
    <DynamicScenesContext.Provider value={{
      currentScene,
      moodContext,
      autoMode,
      scenes,
      setScene,
      updateMoodContext,
      setAutoMode,
      suggestScene,
      adaptToActivity,
      adaptToTime,
      createCustomScene,
      saveCurrentAsPreset
    }}>
      {children}
    </DynamicScenesContext.Provider>
  );
}

export function useDynamicScenes() {
  const context = useContext(DynamicScenesContext);
  if (!context) {
    throw new Error('useDynamicScenes must be used within DynamicScenesProvider');
  }
  return context;
}
