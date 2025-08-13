'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Sensory themes based on project type and user mood
interface SensoryTheme {
  id: string;
  name: string;
  description: string;
  projectType: 'video' | 'writing' | 'whiteboard' | 'collaboration' | 'general';
  mood: 'dangerous_rebel' | 'calm_mentor' | 'rapid_prototyper';
  ui: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    glassmorphism: boolean;
    borderRadius: string;
    animation: 'smooth' | 'snappy' | 'dramatic';
  };
  audio: {
    clickSound: string;
    hoverSound: string;
    successSound: string;
    errorSound: string;
    ambientLoop?: string;
  };
  animations: {
    pageTransition: string;
    buttonHover: string;
    loadingSpinner: string;
    microinteractions: boolean;
  };
}

interface SensoryContextType {
  currentTheme: SensoryTheme;
  setTheme: (themeId: string) => void;
  adaptToProject: (projectType: string) => void;
  setMood: (mood: 'dangerous_rebel' | 'calm_mentor' | 'rapid_prototyper') => void;
  playSound: (soundType: keyof SensoryTheme['audio']) => void;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}

const SensoryContext = createContext<SensoryContextType | undefined>(undefined);

// Predefined sensory themes
const SENSORY_THEMES: SensoryTheme[] = [
  {
    id: 'cyberpunk_video',
    name: 'Cyberpunk Creator',
    description: 'Dark, neon-infused interface for video editing with cinematic flair',
    projectType: 'video',
    mood: 'dangerous_rebel',
    ui: {
      primary: '#ff0080',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #000a1a 100%)',
      text: '#ffffff',
      glassmorphism: true,
      borderRadius: '0px',
      animation: 'dramatic'
    },
    audio: {
      clickSound: 'synth_click',
      hoverSound: 'synth_hover',
      successSound: 'cyberpunk_success',
      errorSound: 'glitch_error',
      ambientLoop: 'cyberpunk_ambient'
    },
    animations: {
      pageTransition: 'slide-matrix',
      buttonHover: 'glow-pulse',
      loadingSpinner: 'matrix-rain',
      microinteractions: true
    }
  },
  {
    id: 'minimal_writing',
    name: 'Zen Writer',
    description: 'Clean, minimal interface that fades away to let words flow',
    projectType: 'writing',
    mood: 'calm_mentor',
    ui: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#059669',
      background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
      text: '#1e293b',
      glassmorphism: false,
      borderRadius: '8px',
      animation: 'smooth'
    },
    audio: {
      clickSound: 'soft_click',
      hoverSound: 'paper_rustle',
      successSound: 'typewriter_ding',
      errorSound: 'gentle_error'
    },
    animations: {
      pageTransition: 'fade-gentle',
      buttonHover: 'lift-subtle',
      loadingSpinner: 'typewriter',
      microinteractions: false
    }
  },
  {
    id: 'neon_whiteboard',
    name: 'Electric Brainstorm',
    description: 'High-energy interface for rapid ideation and visual thinking',
    projectType: 'whiteboard',
    mood: 'rapid_prototyper',
    ui: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      background: 'linear-gradient(45deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      text: '#ffffff',
      glassmorphism: true,
      borderRadius: '16px',
      animation: 'snappy'
    },
    audio: {
      clickSound: 'electric_pop',
      hoverSound: 'energy_whoosh',
      successSound: 'power_up',
      errorSound: 'spark_error',
      ambientLoop: 'electric_hum'
    },
    animations: {
      pageTransition: 'lightning-fast',
      buttonHover: 'electric-pulse',
      loadingSpinner: 'energy-orb',
      microinteractions: true
    }
  },
  {
    id: 'collaborative_harmony',
    name: 'Team Harmony',
    description: 'Warm, collaborative interface that brings people together',
    projectType: 'collaboration',
    mood: 'calm_mentor',
    ui: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#10b981',
      background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 50%, #ede9fe 100%)',
      text: '#374151',
      glassmorphism: false,
      borderRadius: '12px',
      animation: 'smooth'
    },
    audio: {
      clickSound: 'harmony_click',
      hoverSound: 'gentle_chime',
      successSound: 'team_success',
      errorSound: 'soft_error'
    },
    animations: {
      pageTransition: 'flow-together',
      buttonHover: 'warm-glow',
      loadingSpinner: 'collaborative-dots',
      microinteractions: true
    }
  }
];

export function SensoryProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<SensoryTheme>(SENSORY_THEMES[0]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && isAudioEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        setAudioContext(ctx);
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }, [isAudioEnabled]);

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply CSS custom properties
      root.style.setProperty('--sensory-primary', currentTheme.ui.primary);
      root.style.setProperty('--sensory-secondary', currentTheme.ui.secondary);
      root.style.setProperty('--sensory-accent', currentTheme.ui.accent);
      root.style.setProperty('--sensory-background', currentTheme.ui.background);
      root.style.setProperty('--sensory-text', currentTheme.ui.text);
      root.style.setProperty('--sensory-border-radius', currentTheme.ui.borderRadius);
      
      // Apply body class for theme-specific styles
      document.body.className = document.body.className.replace(/sensory-theme-\w+/g, '');
      document.body.classList.add(`sensory-theme-${currentTheme.id}`);
      
      // Store theme preference
      localStorage.setItem('ai_mind_os_sensory_theme', currentTheme.id);
    }
  }, [currentTheme]);

  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('ai_mind_os_sensory_theme');
      const savedAudioEnabled = localStorage.getItem('ai_mind_os_audio_enabled') === 'true';
      
      if (savedThemeId) {
        const savedTheme = SENSORY_THEMES.find(t => t.id === savedThemeId);
        if (savedTheme) {
          setCurrentTheme(savedTheme);
        }
      }
      
      setIsAudioEnabled(savedAudioEnabled);
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = SENSORY_THEMES.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const adaptToProject = (projectType: string) => {
    const adaptiveTheme = SENSORY_THEMES.find(t => 
      t.projectType === projectType || 
      (projectType === 'general' && t.projectType === 'general')
    );
    
    if (adaptiveTheme && adaptiveTheme.id !== currentTheme.id) {
      setCurrentTheme(adaptiveTheme);
      
      // Show adaptation notification
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('sensory-adaptation', {
          detail: { 
            from: currentTheme.name, 
            to: adaptiveTheme.name,
            reason: `Adapted to ${projectType} mode`
          }
        });
        window.dispatchEvent(event);
      }
    }
  };

  const setMood = (mood: 'dangerous_rebel' | 'calm_mentor' | 'rapid_prototyper') => {
    const moodTheme = SENSORY_THEMES.find(t => t.mood === mood);
    if (moodTheme) {
      setCurrentTheme(moodTheme);
    }
  };

  const playSound = async (soundType: keyof SensoryTheme['audio']) => {
    if (!isAudioEnabled || !audioContext || !currentTheme.audio[soundType]) return;

    try {
      // In production, these would be actual audio files
      // For now, we'll use Web Audio API to generate synthetic sounds
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sound types
      const frequencies = {
        clickSound: 800,
        hoverSound: 600,
        successSound: 1000,
        errorSound: 300,
        ambientLoop: 200
      };
      
      oscillator.frequency.setValueAtTime(frequencies[soundType] || 440, audioContext.currentTime);
      oscillator.type = currentTheme.mood === 'dangerous_rebel' ? 'sawtooth' : 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    localStorage.setItem('ai_mind_os_audio_enabled', newAudioState.toString());
  };

  return (
    <SensoryContext.Provider value={{
      currentTheme,
      setTheme,
      adaptToProject,
      setMood,
      playSound,
      isAudioEnabled,
      toggleAudio
    }}>
      {children}
    </SensoryContext.Provider>
  );
}

export function useSensory() {
  const context = useContext(SensoryContext);
  if (context === undefined) {
    throw new Error('useSensory must be used within a SensoryProvider');
  }
  return context;
}

// Hook for automatic project adaptation
export function useProjectAdaptation(projectType: string) {
  const { adaptToProject } = useSensory();
  
  useEffect(() => {
    adaptToProject(projectType);
  }, [projectType, adaptToProject]);
}

// Hook for reactive audio feedback
export function useAudioFeedback() {
  const { playSound, isAudioEnabled } = useSensory();
  
  return {
    onClick: () => playSound('clickSound'),
    onHover: () => playSound('hoverSound'),
    onSuccess: () => playSound('successSound'),
    onError: () => playSound('errorSound'),
    isEnabled: isAudioEnabled
  };
}
