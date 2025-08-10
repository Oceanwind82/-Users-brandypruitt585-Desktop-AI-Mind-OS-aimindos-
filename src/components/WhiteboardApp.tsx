'use client';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
// Ensure SourcePanel.tsx exists in the same folder, or update the path below if needed:
import SourcePanel from '@/components/SourcePanel';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function WhiteboardApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                🎨 AI Mind Whiteboard
              </h1>
              <p className="text-purple-200 text-sm">
                Visual AI canvas for mind mapping and brainstorming
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-colors"
            >
              <Home size={16} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main whiteboard area */}
      <div className="h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-3">
        {/* Whiteboard Canvas */}
        <div className="lg:col-span-2 bg-white/5 border-r border-white/10">
          <div className="h-full relative">
            <Tldraw 
              inferDarkMode 
              persistenceKey="ai-mind-os-whiteboard"
            />
          </div>
        </div>
        
        {/* AI Source Panel */}
        <div className="lg:col-span-1">
          <SourcePanel />
        </div>
      </div>
    </div>
  );
}
