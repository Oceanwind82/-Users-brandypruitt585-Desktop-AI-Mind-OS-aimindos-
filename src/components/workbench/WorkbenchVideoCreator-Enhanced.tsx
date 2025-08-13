'use client';

import React from 'react';
import { 
  Wand2, 
  Download, 
  Upload, 
  Film, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Settings, 
  Copy,
  Zap,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Type
} from 'lucide-react';
import { useAIContext, useCrossToolAssets } from '@/lib/ai-context';
import { buildEnhancedPrompt } from '@/lib/ai-prompts';

interface VideoProject {
  id: string;
  title: string;
  script: string;
  storyboard: Array<{
    id: string;
    description: string;
    duration: number;
    visualStyle: string;
    transition: string;
  }>;
  videoSettings: {
    format: '16:9' | '9:16' | '1:1';
    duration: number;
    style: 'modern' | 'cinematic' | 'minimal' | 'dynamic';
    voiceOver: boolean;
    music: boolean;
  };
  assets: Array<{
    id: string;
    type: 'image' | 'video' | 'audio' | 'text';
    src: string;
    title: string;
  }>;
  generatedVideo?: {
    url: string;
    thumbnail: string;
    status: 'processing' | 'completed' | 'failed';
  };
}

export default function WorkbenchVideoCreatorEnhanced() {
  const [scriptPrompt, setScriptPrompt] = React.useState('');
  const [generatedScript, setGeneratedScript] = React.useState('');
  const [storyboard, setStoryboard] = React.useState<VideoProject['storyboard']>([]);
  const [videoSettings, setVideoSettings] = React.useState<VideoProject['videoSettings']>({
    format: '16:9',
    duration: 60,
    style: 'modern',
    voiceOver: true,
    music: true
  });
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'script' | 'storyboard' | 'assets' | 'generate'>('script');
  const [uploadedAssets, setUploadedAssets] = React.useState<VideoProject['assets']>([]);

  // Enhanced AI context integration
  const { context, addActivity, addAsset } = useAIContext();
  const { relevantAssets, transferAsset } = useCrossToolAssets('video');

  const scriptTemplates = [
    {
      name: 'AI Explainer',
      prompt: 'Create a 60-second video script explaining a complex AI concept in simple terms for professionals.',
      category: 'Education'
    },
    {
      name: 'Product Demo',
      prompt: 'Write a compelling product demonstration script showcasing AI Mind OS features.',
      category: 'Marketing'
    },
    {
      name: 'Thought Leadership',
      prompt: 'Create a provocative video script about the future of AI that challenges conventional thinking.',
      category: 'Leadership'
    },
    {
      name: 'Tutorial',
      prompt: 'Develop a step-by-step tutorial video script for using AI tools effectively.',
      category: 'Education'
    }
  ];

  const generateScript = async () => {
    if (!scriptPrompt.trim()) return;
    
    setLoading(true);
    
    try {
      // Build enhanced prompt with context from other tools
      const enhancedPrompt = buildEnhancedPrompt(
        'video_script',
        {
          videoTopic: scriptPrompt,
          videoFormat: videoSettings.format,
          duration: videoSettings.duration.toString(),
          additionalContext: relevantAssets.length > 0 
            ? `Context from other tools: ${relevantAssets.slice(0, 2).map(a => a.title).join(', ')}`
            : ''
        },
        context.userProfile || undefined,
        context.toolHistory.slice(0, 3),
        relevantAssets.slice(0, 2)
      );

      // Track activity
      addActivity({
        tool: 'video',
        action: 'generate_script',
        content: `Generated video script: ${scriptPrompt.substring(0, 50)}...`
      });

      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          type: 'video_script_enhanced',
          context: 'AI Mind OS Video Creator',
          settings: videoSettings
        })
      });
      
      if (!response.ok) throw new Error('Script generation failed');
      
      const data = await response.json();
      const script = data.content || 'No script generated';
      
      setGeneratedScript(script);
      
      // Add to shared assets
      addAsset({
        type: 'text',
        content: script,
        sourceTool: 'video',
        title: `Video Script: ${scriptPrompt.substring(0, 30)}...`,
        tags: ['video-script', videoSettings.style, videoSettings.format]
      });

    } catch (error) {
      setGeneratedScript('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generateStoryboard = async () => {
    if (!generatedScript.trim()) return;
    
    setLoading(true);
    
    try {
      const enhancedPrompt = buildEnhancedPrompt(
        'video_storyboard',
        {
          scriptContent: generatedScript
        },
        context.userProfile || undefined,
        context.toolHistory.slice(0, 3),
        relevantAssets.slice(0, 2)
      );

      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          type: 'video_storyboard',
          context: 'AI Mind OS Video Creator'
        })
      });
      
      if (!response.ok) throw new Error('Storyboard generation failed');
      
      // For Phase 2, we'll simulate structured storyboard response
      const parsedStoryboard = [
        {
          id: crypto.randomUUID(),
          description: "Opening scene with dynamic visual",
          duration: 5,
          visualStyle: "Modern tech aesthetic",
          transition: "Fade in"
        },
        {
          id: crypto.randomUUID(),
          description: "Key concept explanation",
          duration: 15,
          visualStyle: "Split screen with graphics",
          transition: "Smooth slide"
        },
        {
          id: crypto.randomUUID(),
          description: "Call to action",
          duration: 5,
          visualStyle: "Bold text overlay",
          transition: "Zoom out"
        }
      ];
      
      setStoryboard(parsedStoryboard);
      setActiveTab('storyboard');

      // Track activity
      addActivity({
        tool: 'video',
        action: 'generate_storyboard',
        content: `Created storyboard with ${parsedStoryboard.length} scenes`
      });

    } catch (error) {
      console.error('Storyboard generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const asset: VideoProject['assets'][0] = {
        id: crypto.randomUUID(),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 
              file.type.startsWith('audio/') ? 'audio' : 'text',
        src: url,
        title: file.name
      };
      
      setUploadedAssets(prev => [...prev, asset]);
    });
  };

  const handleAssetUse = (asset: { id: string; type: string; content: string | object | null; title: string; sourceTool: string }) => {
    if (asset.type === 'text' && typeof asset.content === 'string') {
      if (asset.content.includes('script') || asset.title.toLowerCase().includes('script')) {
        setGeneratedScript(asset.content);
        setActiveTab('script');
      } else {
        setScriptPrompt(`Create a video about: "${asset.content.substring(0, 200)}..."`);
      }
    }
    transferAsset(asset.id, 'video');
  };

  const startVideoGeneration = async () => {
    if (!generatedScript || storyboard.length === 0) return;
    
    setLoading(true);
    
    try {
      // This would integrate with video generation API
      const response = await fetch('/api/ai/video-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: generatedScript,
          storyboard,
          settings: videoSettings,
          assets: uploadedAssets
        })
      });
      
      if (!response.ok) throw new Error('Video generation failed');
      
      // Track major achievement
      addActivity({
        tool: 'video',
        action: 'generate_video',
        content: `Generated video project: ${scriptPrompt.substring(0, 50)}...`
      });

      // For now, show success message
      alert('Video generation started! This feature will be fully implemented in the next update.');
      
    } catch (error) {
      console.error('Video generation failed:', error);
      alert('Video generation is currently in development. Coming soon!');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  const downloadScript = () => {
    const blob = new Blob([`Video Script\n\nPrompt: ${scriptPrompt}\n\n---\n\n${generatedScript}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_script.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full grid grid-rows-[auto_1fr] gap-4">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">AI Video Creator</h3>
          {context.userProfile && (
            <div className="ml-auto px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-300">
              {context.userProfile.learningStyle} • Enhanced Mode
            </div>
          )}
        </div>

        {/* Cross-Tool Assets */}
        {relevantAssets.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Available Content from Other Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {relevantAssets.slice(0, 3).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleAssetUse(asset)}
                  className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs text-purple-300 hover:bg-purple-600/30 transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  {asset.title.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'script', label: 'Script', icon: Type },
            { id: 'storyboard', label: 'Storyboard', icon: Layers },
            { id: 'assets', label: 'Assets', icon: ImageIcon },
            { id: 'generate', label: 'Generate', icon: Wand2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'script' | 'storyboard' | 'assets' | 'generate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1">
        {activeTab === 'script' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Script Input */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
              <h4 className="font-semibold text-white mb-4">Script Generation</h4>
              
              {/* Template Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {scriptTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => setScriptPrompt(template.prompt)}
                      className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-left transition-colors"
                    >
                      <div className="text-sm font-medium text-white">{template.name}</div>
                      <div className="text-xs text-gray-400">{template.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Settings */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-1 block">Format</label>
                  <select
                    value={videoSettings.format}
                    onChange={(e) => setVideoSettings(prev => ({ ...prev, format: e.target.value as '16:9' | '9:16' | '1:1' }))}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg p-2 text-white"
                  >
                    <option value="16:9">16:9 (YouTube)</option>
                    <option value="9:16">9:16 (TikTok)</option>
                    <option value="1:1">1:1 (Instagram)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-1 block">Duration (seconds)</label>
                  <input
                    type="number"
                    value={videoSettings.duration}
                    onChange={(e) => setVideoSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg p-2 text-white"
                    min="15"
                    max="300"
                  />
                </div>
              </div>

              {/* Script Prompt */}
              <textarea
                value={scriptPrompt}
                onChange={(e) => setScriptPrompt(e.target.value)}
                className="flex-1 w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 outline-none focus:border-blue-500/50 resize-none mb-3"
                placeholder="Describe your video concept..."
                rows={6}
              />
              
              <button
                onClick={generateScript}
                disabled={loading || !scriptPrompt.trim()}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating Script...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Script
                  </>
                )}
              </button>
            </div>

            {/* Script Output */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">Generated Script</h4>
                {generatedScript && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyScript}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                    <button
                      onClick={downloadScript}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                    <button
                      onClick={generateStoryboard}
                      disabled={loading}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    >
                      <Layers className="h-3 w-3" />
                      Create Storyboard
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-slate-800/50 border border-white/20 rounded-lg p-3 overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-400">Creating your video script...</p>
                    </div>
                  </div>
                ) : generatedScript ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                    {generatedScript}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-center">
                    <div>
                      <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Your AI-generated script will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storyboard' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Visual Storyboard</h4>
              {!loading && storyboard.length === 0 && generatedScript && (
                <button
                  onClick={generateStoryboard}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Storyboard
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Layers className="h-8 w-8 animate-pulse text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400">Creating visual storyboard...</p>
                </div>
              </div>
            ) : storyboard.length > 0 ? (
              <div className="flex-1 overflow-auto space-y-4">
                {storyboard.map((scene, index) => (
                  <div key={scene.id} className="bg-slate-800/50 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-medium">Scene {index + 1}</h5>
                        <p className="text-xs text-gray-400">{scene.duration}s • {scene.transition}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{scene.description}</p>
                    <div className="text-xs text-blue-300 bg-blue-500/20 inline-block px-2 py-1 rounded">
                      {scene.visualStyle}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400 text-center">
                <div>
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate a script first to create storyboard</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Video Assets</h4>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Assets
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={handleAssetUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1 overflow-auto">
              {uploadedAssets.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedAssets.map((asset) => (
                    <div key={asset.id} className="bg-slate-800/50 border border-white/20 rounded-lg p-3">
                      {asset.type === 'image' && (
                        <div className="w-full h-24 bg-gray-700 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
                          Preview: {asset.title}
                        </div>
                      )}
                      {asset.type === 'video' && (
                        <video src={asset.src} className="w-full h-24 object-cover rounded mb-2" />
                      )}
                      <p className="text-white text-sm font-medium truncate">{asset.title}</p>
                      <p className="text-gray-400 text-xs capitalize">{asset.type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-center">
                  <div>
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload images, videos, or audio files</p>
                    <p className="text-sm mt-2">Enhance your video with custom assets</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 h-full flex flex-col">
            <h4 className="font-semibold text-white mb-4">Generate Video</h4>
            
            {generatedScript && storyboard.length > 0 ? (
              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-slate-800/50 border border-white/20 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3">Project Summary</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white ml-2">{videoSettings.format}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white ml-2">{videoSettings.duration}s</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Scenes:</span>
                      <span className="text-white ml-2">{storyboard.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Assets:</span>
                      <span className="text-white ml-2">{uploadedAssets.length}</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-slate-800/50 border border-white/20 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-1 block">Visual Style</label>
                      <select
                        value={videoSettings.style}
                        onChange={(e) => setVideoSettings(prev => ({ ...prev, style: e.target.value as 'modern' | 'cinematic' | 'minimal' | 'dynamic' }))}
                        className="w-full bg-slate-700 border border-white/20 rounded-lg p-2 text-white"
                      >
                        <option value="modern">Modern Tech</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="minimal">Minimal Clean</option>
                        <option value="dynamic">Dynamic Energy</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={videoSettings.voiceOver}
                          onChange={(e) => setVideoSettings(prev => ({ ...prev, voiceOver: e.target.checked }))}
                          className="rounded"
                        />
                        AI Voice-Over
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={videoSettings.music}
                          onChange={(e) => setVideoSettings(prev => ({ ...prev, music: e.target.checked }))}
                          className="rounded"
                        />
                        Background Music
                      </label>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={startVideoGeneration}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate AI Video
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">Coming Soon</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400 text-center">
                <div>
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete script and storyboard to generate video</p>
                  <p className="text-sm mt-2">Full video generation coming soon!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
