'use client';

import { Paintbrush, PenTool, Video, GitBranch } from 'lucide-react';

type ToolKey = 'whiteboard' | 'writing' | 'video' | 'nodes';

interface WorkbenchSidebarProps {
  active: ToolKey;
  onSelect: (key: ToolKey) => void;
}

export default function WorkbenchSidebar({ active, onSelect }: WorkbenchSidebarProps) {
  const tools = [
    { 
      key: 'whiteboard' as ToolKey, 
      label: 'Enhanced Whiteboard', 
      icon: Paintbrush,
      description: 'Advanced drag-and-drop canvas with AI templates',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    },
    { 
      key: 'writing' as ToolKey, 
      label: 'Writing AI', 
      icon: PenTool,
      description: 'Context-aware AI text generation',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    },
    { 
      key: 'video' as ToolKey, 
      label: 'Video Creator', 
      icon: Video,
      description: 'AI-powered video script & storyboard generation',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
    },
    { 
      key: 'nodes' as ToolKey, 
      label: 'Node AI', 
      icon: GitBranch,
      description: 'Visual workflow builder',
      color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    },
  ];

  return (
    <aside className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Creative Tools</h3>
        <p className="text-sm text-gray-300">Choose your workbench tool</p>
      </div>

      <nav className="space-y-3">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = active === tool.key;
          
          return (
            <button
              key={tool.key}
              onClick={() => onSelect(tool.key)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                isActive 
                  ? `bg-gradient-to-r ${tool.color} shadow-lg scale-105` 
                  : 'border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    isActive ? 'text-white' : 'text-gray-200'
                  }`}>
                    {tool.label}
                  </h4>
                  <p className={`text-sm ${
                    isActive ? 'text-gray-200' : 'text-gray-400'
                  }`}>
                    {tool.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
        <h4 className="font-semibold text-white mb-2">🎯 Pro Tip</h4>
        <p className="text-sm text-gray-300">
          Combine tools for maximum creativity! Use Video AI to plan, Whiteboard to visualize, and Writing AI to refine.
        </p>
      </div>
    </aside>
  );
}
