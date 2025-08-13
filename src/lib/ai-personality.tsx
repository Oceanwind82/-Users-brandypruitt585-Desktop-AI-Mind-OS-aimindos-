'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// AI Personality Types
export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  description: string;
  expertise: string[];
  personality: {
    tone: 'friendly' | 'professional' | 'casual' | 'enthusiastic' | 'analytical' | 'creative';
    creativity: number; // 0-1
    verbosity: number; // 0-1
    riskTolerance: number; // 0-1
    focusAreas: string[];
  };
  promptTemplate: string;
  capabilities: string[];
  contextMemory: Record<string, unknown>;
  isActive: boolean;
  usage: {
    totalInteractions: number;
    averageRating: number;
    lastUsed: Date;
    specializations: string[];
  };
}

export interface HivemindState {
  isActive: boolean;
  activePersonalities: string[];
  collaboration: {
    mode: 'sequential' | 'parallel' | 'debate' | 'synthesis';
    leader: string | null;
    consensus: number; // 0-1
  };
  sharedContext: Record<string, unknown>;
  decisionHistory: Array<{
    timestamp: Date;
    question: string;
    responses: Record<string, string>;
    finalDecision: string;
    confidence: number;
  }>;
}

interface AIPersonalityContextType {
  personalities: AIPersonality[];
  activePersonality: AIPersonality | null;
  hivemind: HivemindState;
  switchPersonality: (id: string) => void;
  createCustomPersonality: (base: Partial<AIPersonality>) => Promise<AIPersonality>;
  activateHivemind: (personalityIds: string[], mode: HivemindState['collaboration']['mode']) => void;
  deactivateHivemind: () => void;
  askHivemind: (question: string) => Promise<string>;
  updatePersonalityContext: (id: string, context: Record<string, unknown>) => void;
  rateInteraction: (personalityId: string, rating: number) => void;
  exportPersonality: (id: string) => string;
  importPersonality: (data: string) => Promise<AIPersonality>;
}

const AIPersonalityContext = createContext<AIPersonalityContextType | null>(null);

// Predefined AI Personalities
const DEFAULT_PERSONALITIES: AIPersonality[] = [
  {
    id: 'creator',
    name: 'Maya Creative',
    avatar: '🎨',
    description: 'Your creative companion for brainstorming and artistic expression',
    expertise: ['creative writing', 'visual design', 'storytelling', 'brainstorming'],
    personality: {
      tone: 'enthusiastic',
      creativity: 0.9,
      verbosity: 0.7,
      riskTolerance: 0.8,
      focusAreas: ['innovation', 'aesthetics', 'narrative']
    },
    promptTemplate: `You are Maya, an enthusiastic creative AI. You love bold ideas, artistic expression, and pushing boundaries. Always encourage experimentation and offer multiple creative angles. Use vivid language and metaphors. Context: {context}`,
    capabilities: ['content creation', 'design feedback', 'idea generation', 'creative problem solving'],
    contextMemory: {},
    isActive: true,
    usage: {
      totalInteractions: 0,
      averageRating: 0,
      lastUsed: new Date(),
      specializations: []
    }
  },
  {
    id: 'analyst',
    name: 'Alex Analyst',
    avatar: '📊',
    description: 'Data-driven insights and strategic thinking',
    expertise: ['data analysis', 'market research', 'strategy', 'optimization'],
    personality: {
      tone: 'analytical',
      creativity: 0.4,
      verbosity: 0.8,
      riskTolerance: 0.3,
      focusAreas: ['accuracy', 'evidence', 'metrics']
    },
    promptTemplate: `You are Alex, a meticulous analytical AI. You prioritize data, evidence, and logical reasoning. Always ask for metrics and provide structured analysis. Be thorough and cite sources when possible. Context: {context}`,
    capabilities: ['data analysis', 'trend identification', 'risk assessment', 'strategic planning'],
    contextMemory: {},
    isActive: true,
    usage: {
      totalInteractions: 0,
      averageRating: 0,
      lastUsed: new Date(),
      specializations: []
    }
  },
  {
    id: 'facilitator',
    name: 'Sam Social',
    avatar: '🤝',
    description: 'Collaboration expert and team facilitator',
    expertise: ['team dynamics', 'communication', 'conflict resolution', 'project management'],
    personality: {
      tone: 'friendly',
      creativity: 0.6,
      verbosity: 0.6,
      riskTolerance: 0.5,
      focusAreas: ['harmony', 'efficiency', 'inclusion']
    },
    promptTemplate: `You are Sam, a warm and diplomatic AI facilitator. You excel at bringing people together, managing projects, and ensuring everyone's voice is heard. Focus on collaboration and clear communication. Context: {context}`,
    capabilities: ['meeting facilitation', 'team coordination', 'communication coaching', 'workflow optimization'],
    contextMemory: {},
    isActive: true,
    usage: {
      totalInteractions: 0,
      averageRating: 0,
      lastUsed: new Date(),
      specializations: []
    }
  },
  {
    id: 'innovator',
    name: 'Quinn Quantum',
    avatar: '🔮',
    description: 'Future-focused AI for emerging technologies and trends',
    expertise: ['emerging tech', 'future trends', 'innovation', 'disruption'],
    personality: {
      tone: 'enthusiastic',
      creativity: 0.95,
      verbosity: 0.5,
      riskTolerance: 0.9,
      focusAreas: ['disruption', 'possibility', 'transformation']
    },
    promptTemplate: `You are Quinn, a visionary AI focused on the future. You see possibilities others miss and aren't afraid of radical ideas. Think 10 years ahead and challenge conventional wisdom. Be concise but thought-provoking. Context: {context}`,
    capabilities: ['trend forecasting', 'innovation strategy', 'technology assessment', 'paradigm shifting'],
    contextMemory: {},
    isActive: true,
    usage: {
      totalInteractions: 0,
      averageRating: 0,
      lastUsed: new Date(),
      specializations: []
    }
  },
  {
    id: 'mentor',
    name: 'Dr. Wisdom',
    avatar: '🧠',
    description: 'Patient teacher and knowledge guide',
    expertise: ['education', 'skill development', 'mentoring', 'knowledge synthesis'],
    personality: {
      tone: 'professional',
      creativity: 0.5,
      verbosity: 0.9,
      riskTolerance: 0.4,
      focusAreas: ['understanding', 'growth', 'mastery']
    },
    promptTemplate: `You are Dr. Wisdom, a patient and knowledgeable AI mentor. You break down complex topics, ask probing questions, and guide learning journeys. Focus on deep understanding over quick answers. Context: {context}`,
    capabilities: ['knowledge synthesis', 'learning design', 'skill assessment', 'educational content'],
    contextMemory: {},
    isActive: true,
    usage: {
      totalInteractions: 0,
      averageRating: 0,
      lastUsed: new Date(),
      specializations: []
    }
  }
];

export function AIPersonalityProvider({ children }: { children: ReactNode }) {
  const [personalities, setPersonalities] = useState<AIPersonality[]>(DEFAULT_PERSONALITIES);
  const [activePersonality, setActivePersonality] = useState<AIPersonality | null>(personalities[0]);
  const [hivemind, setHivemind] = useState<HivemindState>({
    isActive: false,
    activePersonalities: [],
    collaboration: {
      mode: 'sequential',
      leader: null,
      consensus: 0
    },
    sharedContext: {},
    decisionHistory: []
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aiPersonalities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPersonalities(parsed.personalities || DEFAULT_PERSONALITIES);
        if (parsed.activePersonality) {
          setActivePersonality(parsed.activePersonality);
        }
        if (parsed.hivemind) {
          setHivemind(parsed.hivemind);
        }
      } catch (error) {
        console.error('Failed to load AI personalities:', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('aiPersonalities', JSON.stringify({
      personalities,
      activePersonality,
      hivemind
    }));
  }, [personalities, activePersonality, hivemind]);

  const switchPersonality = (id: string) => {
    const personality = personalities.find(p => p.id === id);
    if (personality) {
      setActivePersonality(personality);
      // Update usage stats
      setPersonalities(prev => prev.map(p => 
        p.id === id 
          ? { ...p, usage: { ...p.usage, lastUsed: new Date() } }
          : p
      ));
    }
  };

  const createCustomPersonality = async (base: Partial<AIPersonality>): Promise<AIPersonality> => {
    const newPersonality: AIPersonality = {
      id: `custom_${Date.now()}`,
      name: base.name || 'Custom AI',
      avatar: base.avatar || '🤖',
      description: base.description || 'Custom AI assistant',
      expertise: base.expertise || [],
      personality: {
        tone: 'friendly',
        creativity: 0.5,
        verbosity: 0.5,
        riskTolerance: 0.5,
        focusAreas: [],
        ...base.personality
      },
      promptTemplate: base.promptTemplate || `You are a helpful AI assistant. Context: {context}`,
      capabilities: base.capabilities || [],
      contextMemory: {},
      isActive: true,
      usage: {
        totalInteractions: 0,
        averageRating: 0,
        lastUsed: new Date(),
        specializations: []
      }
    };

    setPersonalities(prev => [...prev, newPersonality]);
    return newPersonality;
  };

  const activateHivemind = (personalityIds: string[], mode: HivemindState['collaboration']['mode']) => {
    const validPersonalities = personalityIds.filter(id => 
      personalities.some(p => p.id === id)
    );
    
    setHivemind(prev => ({
      ...prev,
      isActive: true,
      activePersonalities: validPersonalities,
      collaboration: {
        mode,
        leader: validPersonalities[0] || null,
        consensus: 0
      }
    }));
  };

  const deactivateHivemind = () => {
    setHivemind(prev => ({
      ...prev,
      isActive: false,
      activePersonalities: [],
      collaboration: {
        mode: 'sequential',
        leader: null,
        consensus: 0
      }
    }));
  };

  const askHivemind = async (question: string): Promise<string> => {
    if (!hivemind.isActive || hivemind.activePersonalities.length === 0) {
      throw new Error('Hivemind is not active');
    }

    const responses: Record<string, string> = {};
    const activeAIs = personalities.filter(p => 
      hivemind.activePersonalities.includes(p.id)
    );

    // Simulate AI responses based on their personalities
    for (const ai of activeAIs) {
      // In a real implementation, this would call the AI API
      responses[ai.id] = `[${ai.name}]: Based on my ${ai.expertise.join(', ')} expertise, I suggest... (${ai.personality.tone} response)`;
    }

    // Synthesize final response based on collaboration mode
    let finalResponse = '';
    let confidence = 0;

    switch (hivemind.collaboration.mode) {
      case 'sequential':
        finalResponse = Object.values(responses).join('\n\n');
        confidence = 0.7;
        break;
      case 'parallel':
        finalResponse = `Multiple perspectives:\n${Object.values(responses).join('\n')}`;
        confidence = 0.8;
        break;
      case 'debate':
        finalResponse = `After debate among AIs:\n${Object.values(responses).join('\n→ ')}\n\nConsensus: Most agree on...`;
        confidence = 0.9;
        break;
      case 'synthesis':
        finalResponse = `Synthesized insight: Combining all perspectives, the best approach is...`;
        confidence = 0.95;
        break;
    }

    // Record decision
    const decision = {
      timestamp: new Date(),
      question,
      responses,
      finalDecision: finalResponse,
      confidence
    };

    setHivemind(prev => ({
      ...prev,
      decisionHistory: [...prev.decisionHistory, decision],
      collaboration: { ...prev.collaboration, consensus: confidence }
    }));

    return finalResponse;
  };

  const updatePersonalityContext = (id: string, context: Record<string, unknown>) => {
    setPersonalities(prev => prev.map(p => 
      p.id === id 
        ? { ...p, contextMemory: { ...p.contextMemory, ...context } }
        : p
    ));
  };

  const rateInteraction = (personalityId: string, rating: number) => {
    setPersonalities(prev => prev.map(p => {
      if (p.id === personalityId) {
        const newTotal = p.usage.totalInteractions + 1;
        const newAverage = (p.usage.averageRating * p.usage.totalInteractions + rating) / newTotal;
        return {
          ...p,
          usage: {
            ...p.usage,
            totalInteractions: newTotal,
            averageRating: newAverage
          }
        };
      }
      return p;
    }));
  };

  const exportPersonality = (id: string): string => {
    const personality = personalities.find(p => p.id === id);
    if (!personality) throw new Error('Personality not found');
    return JSON.stringify(personality, null, 2);
  };

  const importPersonality = async (data: string): Promise<AIPersonality> => {
    try {
      const personality = JSON.parse(data) as AIPersonality;
      personality.id = `imported_${Date.now()}`;
      personality.usage = {
        totalInteractions: 0,
        averageRating: 0,
        lastUsed: new Date(),
        specializations: []
      };
      
      setPersonalities(prev => [...prev, personality]);
      return personality;
    } catch {
      throw new Error('Invalid personality data');
    }
  };

  return (
    <AIPersonalityContext.Provider value={{
      personalities,
      activePersonality,
      hivemind,
      switchPersonality,
      createCustomPersonality,
      activateHivemind,
      deactivateHivemind,
      askHivemind,
      updatePersonalityContext,
      rateInteraction,
      exportPersonality,
      importPersonality
    }}>
      {children}
    </AIPersonalityContext.Provider>
  );
}

export function useAIPersonality() {
  const context = useContext(AIPersonalityContext);
  if (!context) {
    throw new Error('useAIPersonality must be used within AIPersonalityProvider');
  }
  return context;
}
