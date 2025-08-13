// AI Context Manager for Cross-Tool Memory & Suggestions
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AIContext {
  // Current session data
  sessionId: string;
  currentTool: string;
  
  // Cross-tool memory
  toolHistory: ToolActivity[];
  sharedAssets: SharedAsset[];
  aiSuggestions: AISuggestion[];
  
  // User preferences from onboarding
  userProfile: UserProfile | null;
}

export interface ToolActivity {
  id: string;
  tool: string;
  action: string;
  content: string | object | null;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

export interface SharedAsset {
  id: string;
  type: 'text' | 'image' | 'video' | 'outline' | 'script' | 'whiteboard';
  content: string | object | null;
  sourceTool: string;
  title: string;
  tags: string[];
  createdAt: Date;
  lastModified: Date;
}

export interface AISuggestion {
  id: string;
  type: 'next_step' | 'cross_tool' | 'enhancement' | 'export';
  title: string;
  description: string;
  action: () => void;
  priority: 'low' | 'medium' | 'high';
  targetTool?: string;
  context: string;
}

export interface UserProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  preferredTone: string;
  goals: string[];
}

interface AIContextManagerProps {
  children: ReactNode;
}

interface AIContextValue {
  context: AIContext;
  
  // Context management
  updateContext: (updates: Partial<AIContext>) => void;
  addActivity: (activity: Omit<ToolActivity, 'id' | 'timestamp'>) => void;
  addAsset: (asset: Omit<SharedAsset, 'id' | 'createdAt' | 'lastModified'>) => void;
  
  // AI suggestions
  generateSuggestions: () => Promise<AISuggestion[]>;
  dismissSuggestion: (id: string) => void;
  
  // Cross-tool operations
  transferAsset: (assetId: string, targetTool: string) => SharedAsset | null;
  getRelevantAssets: (tool: string) => SharedAsset[];
  
  // Smart prompting
  buildContextualPrompt: (basePrompt: string, tool: string) => string;
}

const AIContextContext = createContext<AIContextValue | null>(null);

export function AIContextManager({ children }: AIContextManagerProps) {
  const [context, setContext] = useState<AIContext>({
    sessionId: crypto.randomUUID(),
    currentTool: 'whiteboard',
    toolHistory: [],
    sharedAssets: [],
    aiSuggestions: [],
    userProfile: null
  });

  const updateContext = useCallback((updates: Partial<AIContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const addActivity = useCallback((activity: Omit<ToolActivity, 'id' | 'timestamp'>) => {
    const newActivity: ToolActivity = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    
    setContext(prev => ({
      ...prev,
      toolHistory: [newActivity, ...prev.toolHistory.slice(0, 49)] // Keep last 50 activities
    }));
  }, []);

  const addAsset = useCallback((asset: Omit<SharedAsset, 'id' | 'createdAt' | 'lastModified'>) => {
    const newAsset: SharedAsset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    setContext(prev => ({
      ...prev,
      sharedAssets: [newAsset, ...prev.sharedAssets]
    }));
  }, []);

  const transferAsset = useCallback((assetId: string, targetTool: string): SharedAsset | null => {
    const asset = context.sharedAssets.find(a => a.id === assetId);
    if (!asset) return null;
    
    // Update asset metadata for transfer
    const updatedAsset = {
      ...asset,
      lastModified: new Date(),
      tags: [...asset.tags, `transferred_to_${targetTool}`]
    };
    
    setContext(prev => ({
      ...prev,
      sharedAssets: prev.sharedAssets.map(a => a.id === assetId ? updatedAsset : a)
    }));
    
    return updatedAsset;
  }, [context.sharedAssets]);

  const getRelevantAssets = useCallback((tool: string): SharedAsset[] => {
    return context.sharedAssets.filter(asset => {
      // Return assets that are relevant to the current tool
      const relevanceMap: Record<string, string[]> = {
        writing: ['text', 'outline'],
        video: ['text', 'script', 'outline'],
        whiteboard: ['text', 'image', 'outline'],
        nodes: ['text', 'outline', 'script']
      };
      
      return relevanceMap[tool]?.includes(asset.type) || false;
    });
  }, [context.sharedAssets]);

  const generateSuggestions = useCallback(async (): Promise<AISuggestion[]> => {
    const { currentTool, toolHistory, sharedAssets } = context;
    const suggestions: AISuggestion[] = [];
    
    // Recent activity analysis
    const recentActivities = toolHistory.slice(0, 5);
    const lastActivity = recentActivities[0];
    
    // Smart next-step suggestions based on current context
    if (currentTool === 'whiteboard' && lastActivity?.action === 'brainstorm') {
      suggestions.push({
        id: 'whiteboard_to_writing',
        type: 'next_step',
        title: 'Turn Ideas into Content',
        description: 'Convert your whiteboard ideas into polished writing',
        action: () => updateContext({ currentTool: 'writing' }),
        priority: 'high',
        targetTool: 'writing',
        context: 'You just brainstormed ideas - ready to write?'
      });
    }
    
    if (currentTool === 'writing' && lastActivity?.action === 'generate_content') {
      suggestions.push({
        id: 'writing_to_video',
        type: 'next_step',
        title: 'Create Video Script',
        description: 'Transform your writing into an engaging video script',
        action: () => updateContext({ currentTool: 'video' }),
        priority: 'medium',
        targetTool: 'video',
        context: 'Great content! Want to make it visual?'
      });
    }
    
    // Cross-tool asset suggestions
    const textAssets = sharedAssets.filter(a => a.type === 'text');
    if (currentTool === 'video' && textAssets.length > 0) {
      suggestions.push({
        id: 'use_text_in_video',
        type: 'cross_tool',
        title: 'Use Previous Writing',
        description: `Import text from ${textAssets[0].sourceTool} tool`,
        action: () => transferAsset(textAssets[0].id, 'video'),
        priority: 'medium',
        context: 'You have existing content to work with'
      });
    }
    
    // Workflow completion suggestions
    const hasWhiteboard = toolHistory.some(a => a.tool === 'whiteboard');
    const hasWriting = toolHistory.some(a => a.tool === 'writing');
    const hasVideo = toolHistory.some(a => a.tool === 'video');
    
    if (hasWhiteboard && hasWriting && !hasVideo) {
      suggestions.push({
        id: 'complete_workflow',
        type: 'enhancement',
        title: 'Complete Your Project',
        description: 'Add video elements to finish your creative workflow',
        action: () => updateContext({ currentTool: 'video' }),
        priority: 'medium',
        targetTool: 'video',
        context: 'You\'re almost done with a full project!'
      });
    }
    
    setContext(prev => ({ ...prev, aiSuggestions: suggestions }));
    return suggestions;
  }, [context, updateContext, transferAsset]);

  const dismissSuggestion = useCallback((id: string) => {
    setContext(prev => ({
      ...prev,
      aiSuggestions: prev.aiSuggestions.filter(s => s.id !== id)
    }));
  }, []);

  const buildContextualPrompt = useCallback((basePrompt: string, tool: string): string => {
    const { userProfile, toolHistory } = context;
    let enhancedPrompt = basePrompt;
    
    // Add user profile context
    if (userProfile) {
      enhancedPrompt += `\n\nUser Context:
- Learning Style: ${userProfile.learningStyle}
- Skill Level: ${userProfile.skillLevel}
- Preferred Tone: ${userProfile.preferredTone}
- Interests: ${userProfile.interests.join(', ')}`;
    }
    
    // Add recent activity context
    const recentActivities = toolHistory.slice(0, 3);
    if (recentActivities.length > 0) {
      enhancedPrompt += `\n\nRecent Activity:`;
      recentActivities.forEach(activity => {
        enhancedPrompt += `\n- ${activity.tool}: ${activity.action}`;
      });
    }
    
    // Add relevant assets context
    const relevantAssets = getRelevantAssets(tool);
    if (relevantAssets.length > 0) {
      enhancedPrompt += `\n\nAvailable Assets:`;
      relevantAssets.slice(0, 3).forEach(asset => {
        enhancedPrompt += `\n- ${asset.type}: ${asset.title} (from ${asset.sourceTool})`;
      });
    }
    
    // Add AI Mind OS brand context
    enhancedPrompt += `\n\nBrand Context: AI Mind OS - "The Operating System for Dangerous Thinkers". Bold, innovative, challenging conventional wisdom.`;
    
    return enhancedPrompt;
  }, [context, getRelevantAssets]);

  const value: AIContextValue = {
    context,
    updateContext,
    addActivity,
    addAsset,
    generateSuggestions,
    dismissSuggestion,
    transferAsset,
    getRelevantAssets,
    buildContextualPrompt
  };

  return (
    <AIContextContext.Provider value={value}>
      {children}
    </AIContextContext.Provider>
  );
}

export function useAIContext() {
  const context = useContext(AIContextContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIContextManager');
  }
  return context;
}

// Custom hooks for specific use cases
export function useSmartSuggestions() {
  const { context, generateSuggestions, dismissSuggestion } = useAIContext();
  return {
    suggestions: context.aiSuggestions,
    generateSuggestions,
    dismissSuggestion
  };
}

export function useCrossToolAssets(currentTool: string) {
  const { getRelevantAssets, transferAsset } = useAIContext();
  return {
    relevantAssets: getRelevantAssets(currentTool),
    transferAsset
  };
}

export function useContextualPrompting() {
  const { buildContextualPrompt } = useAIContext();
  return { buildContextualPrompt };
}
