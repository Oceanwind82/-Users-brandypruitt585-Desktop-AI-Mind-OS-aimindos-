'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Types for predictive system
interface PredictedAction {
  id: string;
  type: 'generate_content' | 'switch_tool' | 'apply_template' | 'optimize_content' | 'share_creation';
  confidence: number;
  description: string;
  icon: string;
  quickAction: () => Promise<void>;
  estimatedTime: string;
  tool?: 'video' | 'writing' | 'whiteboard' | 'intelligence';
  context: Record<string, unknown>;
}

interface UserPattern {
  toolSequence: string[];
  timePatterns: Record<number, string[]>; // hour -> common actions
  projectTypes: string[];
  successfulWorkflows: string[];
  preferredFormats: string[];
  brandElements: {
    colors: string[];
    tone: string;
    keywords: string[];
  };
}

interface BackgroundDraft {
  id: string;
  type: string;
  content: unknown;
  tool: string;
  confidence: number;
  readyAt: Date;
  basedOn: string;
}

interface PredictiveContextType {
  predictions: PredictedAction[];
  userPattern: UserPattern;
  backgroundDrafts: BackgroundDraft[];
  isLearning: boolean;
  recordAction: (action: string, context: Record<string, unknown>) => void;
  executePrediction: (predictionId: string) => Promise<void>;
  enableAutoDraft: boolean;
  toggleAutoDraft: () => void;
  getNextSteps: (currentContext: Record<string, unknown>) => PredictedAction[];
}

const PredictiveContext = createContext<PredictiveContextType | undefined>(undefined);

export function PredictiveProvider({ children }: { children: React.ReactNode }) {
  const [predictions, setPredictions] = useState<PredictedAction[]>([]);
  const [userPattern, setUserPattern] = useState<UserPattern>({
    toolSequence: [],
    timePatterns: {},
    projectTypes: [],
    successfulWorkflows: [],
    preferredFormats: [],
    brandElements: {
      colors: [],
      tone: 'professional',
      keywords: []
    }
  });
  const [backgroundDrafts, setBackgroundDrafts] = useState<BackgroundDraft[]>([]);
  const [isLearning] = useState(true);
  const [enableAutoDraft, setEnableAutoDraft] = useState(false);

  // Initialize learning from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPattern = localStorage.getItem('ai_mind_os_user_pattern');
      const savedAutoDraft = localStorage.getItem('ai_mind_os_auto_draft') === 'true';
      
      if (savedPattern) {
        try {
          setUserPattern(JSON.parse(savedPattern));
        } catch (error) {
          console.warn('Failed to load user pattern:', error);
        }
      }
      
      setEnableAutoDraft(savedAutoDraft);
    }
  }, []);

  // Save pattern changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_mind_os_user_pattern', JSON.stringify(userPattern));
    }
  }, [userPattern]);

  const recordAction = (action: string, context: Record<string, unknown>) => {
    if (!isLearning) return;

    setUserPattern(prev => {
      const updated = { ...prev };
      
      // Update tool sequence
      if (context.tool) {
        updated.toolSequence = [...updated.toolSequence.slice(-4), context.tool as string];
      }
      
      // Update time patterns
      const currentHour = new Date().getHours();
      if (!updated.timePatterns[currentHour]) {
        updated.timePatterns[currentHour] = [];
      }
      updated.timePatterns[currentHour] = [
        ...updated.timePatterns[currentHour].slice(-2),
        action
      ];
      
      // Update project types
      if (context.projectType && !updated.projectTypes.includes(context.projectType as string)) {
        updated.projectTypes.push(context.projectType as string);
      }
      
      // Update successful workflows
      if (context.success && context.workflow) {
        const workflow = context.workflow as string;
        if (!updated.successfulWorkflows.includes(workflow)) {
          updated.successfulWorkflows.push(workflow);
        }
      }
      
      // Update brand elements
      if (context.colors) {
        const colors = context.colors as string[];
        updated.brandElements.colors = [
          ...new Set([...updated.brandElements.colors, ...colors])
        ].slice(0, 5);
      }
      
      if (context.tone) {
        updated.brandElements.tone = context.tone as string;
      }
      
      if (context.keywords) {
        const keywords = context.keywords as string[];
        updated.brandElements.keywords = [
          ...new Set([...updated.brandElements.keywords, ...keywords])
        ].slice(0, 10);
      }
      
      return updated;
    });

    // Generate new predictions based on the action
    generatePredictions(action, context);
  };

  const generatePredictions = async (lastAction: string, context: Record<string, unknown>) => {
    // Simulate AI prediction generation
    const newPredictions: PredictedAction[] = [];
    
    // Pattern-based predictions
    if (lastAction === 'created_video_script' && userPattern.toolSequence.includes('whiteboard')) {
      newPredictions.push({
        id: 'pred_1',
        type: 'switch_tool',
        confidence: 0.87,
        description: 'Create visual storyboard for your script',
        icon: '🎨',
        quickAction: async () => {
          // Switch to whiteboard with script context
          window.location.href = '/whiteboard?context=video_storyboard';
        },
        estimatedTime: '3 min',
        tool: 'whiteboard',
        context: { fromTool: 'video', scriptContent: context.content }
      });
    }

    if (lastAction === 'completed_whiteboard' && context.projectType === 'content_strategy') {
      newPredictions.push({
        id: 'pred_2',
        type: 'generate_content',
        confidence: 0.92,
        description: 'Generate social posts from your strategy',
        icon: '📝',
        quickAction: async () => {
          // Auto-generate based on whiteboard content
          generateBackgroundDraft('social_posts', context);
        },
        estimatedTime: '1 min',
        tool: 'writing',
        context: { sourceContent: context.content }
      });
    }

    // Time-based predictions
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 11 && userPattern.timePatterns[currentHour]?.includes('content_planning')) {
      newPredictions.push({
        id: 'pred_3',
        type: 'apply_template',
        confidence: 0.76,
        description: 'Use your morning content planning template',
        icon: '📅',
        quickAction: async () => {
          // Load morning template
          console.log('Loading morning template...');
        },
        estimatedTime: '30 sec',
        context: { template: 'morning_content_plan' }
      });
    }

    // Cross-tool learning predictions
    if (userPattern.successfulWorkflows.includes('video_to_posts_amplification')) {
      newPredictions.push({
        id: 'pred_4',
        type: 'optimize_content',
        confidence: 0.83,
        description: 'Turn this into cross-platform content',
        icon: '🚀',
        quickAction: async () => {
          generateBackgroundDraft('cross_platform_adaptation', context);
        },
        estimatedTime: '2 min',
        context: { workflow: 'amplification' }
      });
    }

    setPredictions(newPredictions);
  };

  const generateBackgroundDraft = async (type: string, context: Record<string, unknown>) => {
    if (!enableAutoDraft) return;

    const draft: BackgroundDraft = {
      id: `draft_${Date.now()}`,
      type,
      content: await simulateContentGeneration(type, context),
      tool: inferToolFromType(type),
      confidence: 0.85,
      readyAt: new Date(Date.now() + Math.random() * 30000 + 10000), // 10-40 seconds
      basedOn: JSON.stringify(context)
    };

    setBackgroundDrafts(prev => [...prev, draft]);

    // Notify when ready
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('background-draft-ready', {
          detail: { draft }
        });
        window.dispatchEvent(event);
      }
    }, draft.readyAt.getTime() - Date.now());
  };

  const simulateContentGeneration = async (type: string, context: Record<string, unknown>): Promise<unknown> => {
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    switch (type) {
      case 'social_posts':
        return {
          posts: [
            { platform: 'twitter', content: 'Generated tweet based on strategy...' },
            { platform: 'linkedin', content: 'Generated LinkedIn post...' },
            { platform: 'instagram', content: 'Generated Instagram caption...' }
          ]
        };
      case 'cross_platform_adaptation':
        return {
          adaptations: [
            { platform: 'tiktok', format: 'vertical_video', duration: '60s' },
            { platform: 'youtube', format: 'shorts', duration: '60s' },
            { platform: 'instagram', format: 'reel', duration: '30s' }
          ]
        };
      default:
        return { generated: true, type, context };
    }
  };

  const inferToolFromType = (type: string): string => {
    const toolMap: Record<string, string> = {
      'social_posts': 'writing',
      'video_script': 'video',
      'storyboard': 'whiteboard',
      'cross_platform_adaptation': 'video'
    };
    return toolMap[type] || 'writing';
  };

  const executePrediction = async (predictionId: string) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    try {
      await prediction.quickAction();
      
      // Record successful prediction use
      recordAction('executed_prediction', {
        predictionType: prediction.type,
        confidence: prediction.confidence,
        success: true
      });
      
      // Remove executed prediction
      setPredictions(prev => prev.filter(p => p.id !== predictionId));
      
    } catch (error) {
      console.error('Failed to execute prediction:', error);
      recordAction('executed_prediction', {
        predictionType: prediction.type,
        confidence: prediction.confidence,
        success: false,
        error: error
      });
    }
  };

  const getNextSteps = (currentContext: Record<string, unknown>): PredictedAction[] => {
    // Generate contextual next steps based on current state
    const nextSteps: PredictedAction[] = [];
    
    // Add common next steps based on user patterns
    if (userPattern.toolSequence.length > 0) {
      const lastTool = userPattern.toolSequence[userPattern.toolSequence.length - 1];
      const commonNextTools = getCommonNextTools(lastTool);
      
      commonNextTools.forEach((tool, index) => {
        nextSteps.push({
          id: `next_${index}`,
          type: 'switch_tool',
          confidence: 0.7 - (index * 0.1),
          description: `Continue with ${tool}`,
          icon: getToolIcon(tool),
          quickAction: async () => {
            window.location.href = `/${tool}`;
          },
          estimatedTime: '2 min',
          tool: tool as 'video' | 'writing' | 'whiteboard' | 'intelligence',
          context: currentContext
        });
      });
    }
    
    return nextSteps;
  };

  const getCommonNextTools = (currentTool: string): string[] => {
    const toolFlows: Record<string, string[]> = {
      'writing': ['video', 'whiteboard'],
      'video': ['writing', 'whiteboard'],
      'whiteboard': ['writing', 'video'],
      'intelligence': ['writing', 'video', 'whiteboard']
    };
    return toolFlows[currentTool] || [];
  };

  const getToolIcon = (tool: string): string => {
    const icons: Record<string, string> = {
      'writing': '✍️',
      'video': '🎬',
      'whiteboard': '🎨',
      'intelligence': '🧠'
    };
    return icons[tool] || '🔧';
  };

  const toggleAutoDraft = () => {
    const newState = !enableAutoDraft;
    setEnableAutoDraft(newState);
    localStorage.setItem('ai_mind_os_auto_draft', newState.toString());
  };

  return (
    <PredictiveContext.Provider value={{
      predictions,
      userPattern,
      backgroundDrafts,
      isLearning,
      recordAction,
      executePrediction,
      enableAutoDraft,
      toggleAutoDraft,
      getNextSteps
    }}>
      {children}
    </PredictiveContext.Provider>
  );
}

export function usePredictive() {
  const context = useContext(PredictiveContext);
  if (context === undefined) {
    throw new Error('usePredictive must be used within a PredictiveProvider');
  }
  return context;
}

// Hook for automatic action recording
export function useActionRecording() {
  const { recordAction } = usePredictive();
  
  return {
    recordToolSwitch: (tool: string) => recordAction('switched_tool', { tool }),
    recordContentCreation: (type: string, content: unknown) => recordAction('created_content', { type, content }),
    recordWorkflowCompletion: (workflow: string) => recordAction('completed_workflow', { workflow, success: true })
  };
}
