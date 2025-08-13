'use client';

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Vector3, Euler } from 'three';

// 3D Spatial Types
export interface SpatialPanel {
  id: string;
  title: string;
  component: ReactNode;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  size: { width: number; height: number };
  isVisible: boolean;
  isDragging: boolean;
  zIndex: number;
  metadata: {
    type: 'tool' | 'content' | 'ai' | 'social';
    priority: number;
    lastAccessed: Date;
    usage: number;
  };
}

export interface SpatialEnvironment {
  scene: 'cyberpunk' | 'paper' | 'nature' | 'space' | 'minimal';
  lighting: 'ambient' | 'dramatic' | 'soft' | 'neon';
  atmosphere: {
    fog: boolean;
    particles: boolean;
    effects: string[];
  };
}

export interface SpatialMode {
  is3D: boolean;
  cameraMode: 'orbit' | 'fly' | 'fixed';
  physics: boolean;
  autoArrange: boolean;
}

interface Spatial3DContextType {
  panels: SpatialPanel[];
  environment: SpatialEnvironment;
  mode: SpatialMode;
  activePanel: string | null;
  
  // Panel Management
  addPanel: (panel: Omit<SpatialPanel, 'id' | 'zIndex'>) => string;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<SpatialPanel>) => void;
  bringToFront: (id: string) => void;
  
  // Environment Controls
  setEnvironment: (env: Partial<SpatialEnvironment>) => void;
  setMode: (mode: Partial<SpatialMode>) => void;
  
  // Interactions
  startDrag: (id: string) => void;
  endDrag: (id: string) => void;
  focusPanel: (id: string) => void;
  arrangeInGrid: () => void;
  arrangeInCircle: () => void;
  
  // Presets
  loadPreset: (name: string) => void;
  savePreset: (name: string) => void;
}

const Spatial3DContext = createContext<Spatial3DContextType | null>(null);

// Default environments for different contexts
const ENVIRONMENT_PRESETS: Record<string, SpatialEnvironment> = {
  cyberpunk: {
    scene: 'cyberpunk',
    lighting: 'neon',
    atmosphere: {
      fog: true,
      particles: true,
      effects: ['rain', 'holographic-glitch', 'city-lights']
    }
  },
  paper: {
    scene: 'paper',
    lighting: 'soft',
    atmosphere: {
      fog: false,
      particles: false,
      effects: ['paper-texture', 'ink-drops']
    }
  },
  nature: {
    scene: 'nature',
    lighting: 'ambient',
    atmosphere: {
      fog: true,
      particles: true,
      effects: ['floating-leaves', 'wind', 'birds']
    }
  },
  space: {
    scene: 'space',
    lighting: 'dramatic',
    atmosphere: {
      fog: false,
      particles: true,
      effects: ['stars', 'nebula', 'floating-debris']
    }
  },
  minimal: {
    scene: 'minimal',
    lighting: 'soft',
    atmosphere: {
      fog: false,
      particles: false,
      effects: []
    }
  }
};

export function Spatial3DProvider({ children }: { children: ReactNode }) {
  const [panels, setPanels] = useState<SpatialPanel[]>([]);
  const [environment, setEnvironmentState] = useState<SpatialEnvironment>(ENVIRONMENT_PRESETS.minimal);
  const [mode, setModeState] = useState<SpatialMode>({
    is3D: true,
    cameraMode: 'orbit',
    physics: true,
    autoArrange: false
  });
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const nextZIndex = useRef(1);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('spatial3d_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.panels) setPanels(parsed.panels);
        if (parsed.environment) setEnvironmentState(parsed.environment);
        if (parsed.mode) setModeState(parsed.mode);
      } catch (error) {
        console.error('Failed to load 3D spatial state:', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('spatial3d_state', JSON.stringify({
      panels,
      environment,
      mode
    }));
  }, [panels, environment, mode]);

  const addPanel = useCallback((panelData: Omit<SpatialPanel, 'id' | 'zIndex'>) => {
    const id = `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPanel: SpatialPanel = {
      ...panelData,
      id,
      zIndex: nextZIndex.current++,
      position: panelData.position || new Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 10
      ),
      rotation: panelData.rotation || new Euler(0, 0, 0),
      scale: panelData.scale || new Vector3(1, 1, 1)
    };
    
    setPanels(prev => [...prev, newPanel]);
    return id;
  }, []);

  const removePanel = useCallback((id: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== id));
    if (activePanel === id) {
      setActivePanel(null);
    }
  }, [activePanel]);

  const updatePanel = useCallback((id: string, updates: Partial<SpatialPanel>) => {
    setPanels(prev => prev.map(panel => 
      panel.id === id ? { ...panel, ...updates } : panel
    ));
  }, []);

  const bringToFront = useCallback((id: string) => {
    const newZIndex = nextZIndex.current++;
    updatePanel(id, { zIndex: newZIndex });
  }, [updatePanel]);

  const setEnvironment = useCallback((env: Partial<SpatialEnvironment>) => {
    setEnvironmentState(prev => ({ ...prev, ...env }));
  }, []);

  const setMode = useCallback((newMode: Partial<SpatialMode>) => {
    setModeState(prev => ({ ...prev, ...newMode }));
  }, []);

  const startDrag = useCallback((id: string) => {
    updatePanel(id, { isDragging: true });
    bringToFront(id);
    setActivePanel(id);
  }, [updatePanel, bringToFront]);

  const endDrag = useCallback((id: string) => {
    updatePanel(id, { isDragging: false });
  }, [updatePanel]);

  const focusPanel = useCallback((id: string) => {
    setActivePanel(id);
    bringToFront(id);
    
    // Smooth camera movement to panel (would be implemented in 3D scene)
    const panel = panels.find(p => p.id === id);
    if (panel) {
      // Update usage stats
      updatePanel(id, {
        metadata: {
          ...panel.metadata,
          lastAccessed: new Date(),
          usage: panel.metadata.usage + 1
        }
      });
    }
  }, [panels, bringToFront, updatePanel]);

  const arrangeInGrid = useCallback(() => {
    const gridSize = Math.ceil(Math.sqrt(panels.length));
    const spacing = 5;
    
    setPanels(prev => prev.map((panel, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      return {
        ...panel,
        position: new Vector3(
          (col - gridSize / 2) * spacing,
          (row - gridSize / 2) * spacing,
          0
        ),
        rotation: new Euler(0, 0, 0)
      };
    }));
  }, [panels.length]);

  const arrangeInCircle = useCallback(() => {
    const radius = Math.max(5, panels.length * 1.5);
    
    setPanels(prev => prev.map((panel, index) => {
      const angle = (index / panels.length) * Math.PI * 2;
      
      return {
        ...panel,
        position: new Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ),
        rotation: new Euler(0, -angle, 0)
      };
    }));
  }, [panels.length]);

  const loadPreset = useCallback((name: string) => {
    const preset = ENVIRONMENT_PRESETS[name];
    if (preset) {
      setEnvironmentState(preset);
    }
  }, []);

  const savePreset = useCallback((name: string) => {
    const presets = JSON.parse(localStorage.getItem('spatial3d_presets') || '{}');
    presets[name] = environment;
    localStorage.setItem('spatial3d_presets', JSON.stringify(presets));
  }, [environment]);

  return (
    <Spatial3DContext.Provider value={{
      panels,
      environment,
      mode,
      activePanel,
      addPanel,
      removePanel,
      updatePanel,
      bringToFront,
      setEnvironment,
      setMode,
      startDrag,
      endDrag,
      focusPanel,
      arrangeInGrid,
      arrangeInCircle,
      loadPreset,
      savePreset
    }}>
      {children}
    </Spatial3DContext.Provider>
  );
}

export function useSpatial3D() {
  const context = useContext(Spatial3DContext);
  if (!context) {
    throw new Error('useSpatial3D must be used within Spatial3DProvider');
  }
  return context;
}
