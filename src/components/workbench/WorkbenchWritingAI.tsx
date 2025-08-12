'use client';

import React from 'react';
import { Send, Copy, Download, Sparkles, RefreshCw } from 'lucide-react';

const templates: { name: string; prompt: string; category: string }[] = [
  { name: 'Insta Bio', prompt: 'Write a 150-char Instagram bio for AI Mind OS: bold, rebellious, clever. 3 options.', category: 'Social' },
  { name: 'Hook (TikTok)', prompt: 'Give 10 ultra-hooky opening lines for a 9:16 video about mastering AI fast. Keep each under 8 words.', category: 'Social' },
  { name: 'Caption', prompt: 'Write a 2-sentence caption + 5 hashtags for a teaser video announcing AI Mind OS.', category: 'Social' },
  { name: 'Blog Intro', prompt: 'Write an engaging blog introduction about the future of AI-powered thinking tools.', category: 'Content' },
  { name: 'Product Copy', prompt: 'Write compelling product copy for AI Mind OS landing page, focusing on transformation.', category: 'Marketing' },
  { name: 'Email Subject', prompt: 'Generate 5 email subject lines for AI Mind OS launch announcement.', category: 'Email' },
  { name: 'Tweet Thread', prompt: 'Create a 5-tweet thread explaining why traditional thinking tools are becoming obsolete.', category: 'Social' },
  { name: 'Press Release', prompt: 'Write a press release announcing AI Mind OS as the breakthrough in cognitive enhancement.', category: 'PR' },
];

const tones = ['Professional', 'Casual', 'Bold', 'Technical', 'Creative', 'Persuasive'];
const contentTypes = ['Blog Post', 'Social Media', 'Email', 'Documentation', 'Marketing Copy', 'Creative Writing'];

export default function WorkbenchWritingAI() {
  const [prompt, setPrompt] = React.useState('Write a 3-bullet summary about AI Mind OS.');
  const [output, setOutput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [selectedTone, setSelectedTone] = React.useState('Professional');
  const [selectedType, setSelectedType] = React.useState('Blog Post');
  const [wordCount, setWordCount] = React.useState(200);
  const [history, setHistory] = React.useState<Array<{prompt: string; output: string; timestamp: Date; tone: string; type: string}>>([]);

  const generateText = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Tone: ${selectedTone}. Content Type: ${selectedType}. Target Length: ~${wordCount} words.\n\n${prompt}`,
          type: 'writing_assistant',
          context: 'AI Mind OS Workbench',
          tone: selectedTone,
          contentType: selectedType,
          wordCount
        })
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      const generatedText = data.content || 'No content generated';
      
      setOutput(generatedText);
      setHistory(prev => [{
        prompt,
        output: generatedText,
        timestamp: new Date(),
        tone: selectedTone,
        type: selectedType
      }, ...prev.slice(0, 4)]); // Keep last 5 items
      
    } catch (error) {
      setOutput('Error: ' + (error as Error).message + '\n\nPlease check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadText = () => {
    const blob = new Blob([`Prompt: ${prompt}\n\n---\n\n${output}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_writing_output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectTemplate = (template: string) => {
    setPrompt(template);
  };

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4">
      {/* Header with templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Writing Assistant</h3>
        </div>
        
        {/* Advanced Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div>
            <label className="text-xs text-gray-300 block mb-1">Tone</label>
            <select 
              value={selectedTone} 
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
            >
              {tones.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-300 block mb-1">Content Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
            >
              {contentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-300 block mb-1">Word Count</label>
            <input
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              min={50}
              max={2000}
              className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTone('Professional');
                setSelectedType('Blog Post');
                setWordCount(200);
                setPrompt('');
              }}
              className="w-full px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded text-white transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {templates
            .reduce((acc, template) => {
              const category = template.category;
              if (!acc[category]) acc[category] = [];
              acc[category].push(template);
              return acc;
            }, {} as Record<string, typeof templates>)
            [Object.keys(templates.reduce((acc, t) => ({ ...acc, [t.category]: true }), {})).find(() => true) || 'Social']
            ?.slice(0, 8)
            .map((template) => (
              <button
                key={template.name}
                onClick={() => selectTemplate(template.prompt)}
                className="text-left p-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-gray-400 text-xs mt-1">{template.category}</div>
              </button>
            ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Your Prompt</h4>
            <span className="text-xs text-gray-400">{prompt.length} characters</span>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 outline-none focus:border-purple-500/50 resize-none"
            placeholder="Describe what you want to write about..."
            rows={8}
          />
          
          <button
            onClick={generateText}
            disabled={loading || !prompt.trim()}
            className="mt-3 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate Text
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">AI Output</h4>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
                <button
                  onClick={downloadText}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-slate-800/50 border border-white/20 rounded-lg p-3 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400">Generating your content...</p>
                </div>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                {output}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-center">
                <div>
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your AI-generated content will appear here</p>
                  <p className="text-sm mt-2">Enter a prompt and click Generate Text</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <h4 className="font-semibold text-white mb-3">Recent Generations</h4>
          <div className="space-y-2 max-h-32 overflow-auto">
            {history.map((item, index) => (
              <div
                key={index}
                className="p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => {
                  setPrompt(item.prompt);
                  setOutput(item.output);
                }}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {item.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-sm text-white truncate">
                  {item.prompt.substring(0, 60)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
