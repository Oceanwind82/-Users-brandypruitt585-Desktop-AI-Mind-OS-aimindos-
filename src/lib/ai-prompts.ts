// Enhanced AI Prompt Templates for AI Mind OS Tools
// Brand-aware, context-rich prompts for better AI outputs

export interface PromptTemplate {
  id: string;
  tool: string;
  type: string;
  template: string;
  variables: string[];
  brandContext: boolean;
  contextAware: boolean;
}

export const BRAND_CONTEXT = `
You are an AI assistant for AI Mind OS - "The Operating System for Dangerous Thinkers."

Brand Personality:
- Bold, rebellious, thought-provoking
- Challenges conventional wisdom
- Empowers intellectual revolution
- Modern, cutting-edge, slightly edgy
- Confident but not arrogant
- Innovative and disruptive

Tone Guidelines:
- Professional yet provocative
- Clear and direct
- Inspiring and motivational
- Intelligent without being pretentious
- Action-oriented
`;

export const TOOL_PROMPT_TEMPLATES: PromptTemplate[] = [
  // Whiteboard AI Templates
  {
    id: 'whiteboard_brainstorm',
    tool: 'whiteboard',
    type: 'brainstorm',
    template: `${BRAND_CONTEXT}

Generate 6-8 thought-provoking ideas around: {topic}

Context: User is in AI Mind OS Whiteboard, visually exploring concepts.

Requirements:
- Each idea should be 2-8 words max (whiteboard-friendly)
- Challenge conventional thinking
- Spark intellectual curiosity
- Connect to bigger implications
- Mix practical and visionary concepts

Format as simple array of strings, no explanations.`,
    variables: ['topic'],
    brandContext: true,
    contextAware: true
  },

  {
    id: 'whiteboard_expand',
    tool: 'whiteboard',
    type: 'expand_idea',
    template: `${BRAND_CONTEXT}

User selected this idea on their whiteboard: "{selectedIdea}"

Generate 4-6 related concepts that:
- Expand on different angles of this idea
- Challenge assumptions
- Connect to practical applications
- Reveal hidden connections
- Push thinking further

Keep each response under 6 words. Focus on intellectual depth over breadth.`,
    variables: ['selectedIdea'],
    brandContext: true,
    contextAware: true
  },

  // Writing AI Templates
  {
    id: 'writing_content',
    tool: 'writing',
    type: 'content_generation',
    template: `${BRAND_CONTEXT}

Generate {contentType} content about: {topic}

Specifications:
- Tone: {tone}
- Target length: ~{wordCount} words
- Audience: Dangerous thinkers, innovators, change-makers

Content should:
- Challenge conventional wisdom
- Provide actionable insights
- Spark intellectual curiosity
- Maintain AI Mind OS brand voice
- Be memorable and quotable

{contextualInfo}`,
    variables: ['contentType', 'topic', 'tone', 'wordCount', 'contextualInfo'],
    brandContext: true,
    contextAware: true
  },

  {
    id: 'writing_refine',
    tool: 'writing',
    type: 'content_refinement',
    template: `${BRAND_CONTEXT}

Refine this content to be more impactful:

"{originalContent}"

Improvements to make:
- Sharper, more provocative language
- Stronger opening and closing
- More concrete examples
- Better flow and readability
- Align with "Dangerous Thinkers" brand
- {specificInstructions}

Maintain the core message while making it more compelling.`,
    variables: ['originalContent', 'specificInstructions'],
    brandContext: true,
    contextAware: true
  },

  // Video AI Templates
  {
    id: 'video_script',
    tool: 'video',
    type: 'script_generation',
    template: `${BRAND_CONTEXT}

Create a compelling video script for: {videoTopic}

Video specs:
- Format: {videoFormat}
- Duration: {duration}
- Audience: Forward-thinking professionals and creators

Script structure:
1. Hook (first 3 seconds - grab attention)
2. Problem/Challenge (establish stakes)
3. Solution/Insight (provide value)
4. Call to action (what they should do)

Style:
- Conversational yet authoritative
- Visual language (describe what viewers see)
- Provocative statements that make people think
- AI Mind OS brand voice throughout

{additionalContext}`,
    variables: ['videoTopic', 'videoFormat', 'duration', 'additionalContext'],
    brandContext: true,
    contextAware: true
  },

  {
    id: 'video_storyboard',
    tool: 'video',
    type: 'storyboard',
    template: `${BRAND_CONTEXT}

Create a visual storyboard for: "{scriptContent}"

For each key scene, provide:
- Visual description (what we see)
- Duration (seconds)
- Key message/emotion
- Transition style

Focus on:
- Dynamic, engaging visuals
- Modern, tech-forward aesthetic
- Visual metaphors for complex ideas
- Smooth narrative flow
- AI Mind OS brand aesthetics (dark themes, neon accents)

Format as numbered scenes with clear visual directions.`,
    variables: ['scriptContent'],
    brandContext: true,
    contextAware: true
  },

  // Node AI Templates
  {
    id: 'nodes_workflow',
    tool: 'nodes',
    type: 'workflow_design',
    template: `${BRAND_CONTEXT}

Design an AI automation workflow for: {workflowGoal}

Context: User wants to automate {processDescription}

Create a logical node sequence that:
- Breaks down the process into clear steps
- Uses AI tools effectively
- Maintains quality and brand voice
- Scales efficiently
- Includes error handling

Provide:
1. Node sequence with clear labels
2. Input/output for each node
3. AI prompts where applicable
4. Quality checkpoints

Make it practical yet innovative - worthy of "Dangerous Thinkers."`,
    variables: ['workflowGoal', 'processDescription'],
    brandContext: true,
    contextAware: true
  }
];

// Cross-tool integration templates
export const CROSS_TOOL_TEMPLATES: PromptTemplate[] = [
  {
    id: 'whiteboard_to_writing',
    tool: 'cross_tool',
    type: 'workflow_transition',
    template: `${BRAND_CONTEXT}

User created these ideas in Whiteboard: {whiteboardIdeas}

Now they want to turn this into {contentType}.

Create content that:
- Builds upon their visual thinking
- Maintains the creative momentum
- Connects ideas into coherent narrative
- Preserves the innovative spirit
- Challenges conventional approaches

Seamlessly integrate their brainstorming into polished content.`,
    variables: ['whiteboardIdeas', 'contentType'],
    brandContext: true,
    contextAware: true
  },

  {
    id: 'writing_to_video',
    tool: 'cross_tool',
    type: 'content_adaptation',
    template: `${BRAND_CONTEXT}

Transform this written content into a compelling video script:

"{writtenContent}"

Video adaptation should:
- Translate text into visual storytelling
- Maintain key messages and brand voice
- Add dynamic visual elements
- Create engaging hooks for video format
- Structure for {videoLength} duration

Focus on making complex ideas visually accessible to "Dangerous Thinkers."`,
    variables: ['writtenContent', 'videoLength'],
    brandContext: true,
    contextAware: true
  }
];

// Smart suggestion templates
export const SUGGESTION_TEMPLATES = {
  next_step: {
    whiteboard_to_writing: "You've mapped out brilliant ideas - ready to turn them into powerful content?",
    writing_to_video: "Your content is compelling - want to make it visual and shareable?",
    video_to_nodes: "Great video concept - shall we automate the production workflow?",
    writing_to_nodes: "Scale this content creation with an automated workflow?"
  },
  
  enhancement: {
    add_visuals: "Enhance with visual elements to make your ideas more impactful",
    improve_flow: "Optimize the structure and flow for better engagement",
    add_examples: "Strengthen with concrete examples and case studies",
    expand_scope: "Explore broader implications and applications"
  },
  
  cross_tool: {
    import_assets: "Use your previous work from {sourceTool} to accelerate this project",
    sync_projects: "Connect this with your ongoing project in {targetTool}",
    workflow_optimization: "Create an automated workflow to streamline this process"
  }
};

// Function to build contextual prompts
export function buildEnhancedPrompt(
  templateId: string,
  variables: Record<string, string>,
  userProfile?: {
    learningStyle?: string;
    skillLevel?: string;
    interests?: string[];
  },
  toolHistory?: Array<{
    tool: string;
    action: string;
  }>,
  sharedAssets?: Array<{
    type: string;
    title: string;
  }>
): string {
  const template = [...TOOL_PROMPT_TEMPLATES, ...CROSS_TOOL_TEMPLATES]
    .find(t => t.id === templateId);
    
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  let prompt = template.template;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  // Add contextual information if template supports it
  if (template.contextAware) {
    let contextInfo = '';

    // Add user profile context
    if (userProfile) {
      contextInfo += `\n\nUser Profile:
- Learning Style: ${userProfile.learningStyle}
- Skill Level: ${userProfile.skillLevel}
- Interests: ${userProfile.interests?.join(', ') || 'General'}`;
    }

    // Add recent activity context
    if (toolHistory && toolHistory.length > 0) {
      contextInfo += `\n\nRecent Activity:`;
      toolHistory.slice(0, 3).forEach(activity => {
        contextInfo += `\n- Used ${activity.tool} for ${activity.action}`;
      });
    }

    // Add available assets
    if (sharedAssets && sharedAssets.length > 0) {
      contextInfo += `\n\nAvailable Assets:`;
      sharedAssets.slice(0, 2).forEach(asset => {
        contextInfo += `\n- ${asset.type}: ${asset.title}`;
      });
    }

    prompt = prompt.replace('{contextualInfo}', contextInfo);
  }

  return prompt;
}

// Export the enhanced prompt builder
const aiPrompts = {
  TOOL_PROMPT_TEMPLATES,
  CROSS_TOOL_TEMPLATES,
  SUGGESTION_TEMPLATES,
  buildEnhancedPrompt,
  BRAND_CONTEXT
};

export default aiPrompts;
