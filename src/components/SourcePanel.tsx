'use client';
import { useState } from 'react';
import { Link, FileText, Sparkles, Target, Lightbulb, PenTool } from 'lucide-react';
import NoteInserter from './NoteInserter';

async function fetchTextFromUrl(url: string): Promise<string> {
  const res = await fetch('/api/whiteboard/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text as string;
}

async function generateNotes(sourceText: string, goal: string): Promise<string[]> {
  const res = await fetch('/api/whiteboard/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceText, goal }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.notes as string[];
}

const goalOptions = [
  { value: 'ideas', label: 'Key Ideas', icon: Lightbulb, description: 'Extract main concepts and insights' },
  { value: 'headline', label: 'Headlines', icon: Target, description: 'Generate compelling headlines' },
  { value: 'hooks', label: 'Hooks', icon: Sparkles, description: 'Create attention-grabbing hooks' },
  { value: 'outline', label: 'Outline', icon: PenTool, description: 'Structure and organize content' },
];

export default function SourcePanel() {
  const [mode, setMode] = useState<'paste' | 'url'>('paste');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [goal, setGoal] = useState<'ideas' | 'headline' | 'hooks' | 'outline'>('ideas');
  const [notes, setNotes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentGoal = goalOptions.find(g => g.value === goal)!;

  const run = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotes(null);
      
      const sourceText = mode === 'paste' ? text : await fetchTextFromUrl(url);
      if (!sourceText.trim()) {
        throw new Error('Please provide some content to analyze');
      }
      
      const generatedNotes = await generateNotes(sourceText, goal);
      setNotes(generatedNotes);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-black/40 backdrop-blur-lg border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-2">🤖 AI Assistant</h2>
        <p className="text-purple-200 text-sm">
          Transform content into visual mind maps
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Goal Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            What should I extract?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {goalOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setGoal(option.value as typeof goal)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    goal === option.value
                      ? 'bg-purple-600 text-white border-2 border-purple-400'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent size={16} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-4">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'paste'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Paste Text
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'url'
                  ? 'bg-white text-slate-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Link size={16} className="inline mr-2" />
              From URL
            </button>
          </div>
        </div>

        {/* Input Area */}
        {mode === 'paste' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Content to analyze
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste article, transcript, notes, or any content here..."
              className="w-full h-40 text-sm rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/50 focus:bg-white/10 focus:border-purple-400 outline-none transition-all"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Website URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full text-sm rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/50 focus:bg-white/10 focus:border-purple-400 outline-none transition-all"
            />
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={run}
          disabled={loading || (mode === 'paste' ? !text.trim() : !url.trim())}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              AI is thinking...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <currentGoal.icon size={16} />
              Generate {currentGoal.label}
            </div>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {Array.isArray(notes) && notes.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Generated {currentGoal.label}
              </h3>
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                {notes.length} items
              </span>
            </div>
            
            <div className="max-h-40 overflow-auto mb-4">
              <ul className="space-y-2">
                {notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <NoteInserter notes={notes} />
          </div>
        )}
      </div>
    </div>
  );
}
