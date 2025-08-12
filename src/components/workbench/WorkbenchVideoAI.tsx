'use client';

import React from 'react';
import { Upload, Download, Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles, Film } from 'lucide-react';

export default function WorkbenchVideoAI() {
  const [selectedVideo, setSelectedVideo] = React.useState<File | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string>('');
  const [analysisType, setAnalysisType] = React.useState('summary');
  const [prompt, setPrompt] = React.useState('');
  const [analysis, setAnalysis] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const analysisTypes = [
    { id: 'summary', label: 'Video Summary', description: 'Generate a comprehensive summary of the video content' },
    { id: 'transcript', label: 'Transcription', description: 'Extract and transcribe all spoken content' },
    { id: 'sentiment', label: 'Sentiment Analysis', description: 'Analyze emotional tone and sentiment' },
    { id: 'objects', label: 'Object Detection', description: 'Identify and describe objects and scenes' },
    { id: 'custom', label: 'Custom Analysis', description: 'Use your own prompt for specific analysis' }
  ];

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setAnalysis('');
    }
  };

  const analyzeVideo = async () => {
    if (!selectedVideo) return;
    
    setLoading(true);
    setAnalysis('');
    
    try {
      const formData = new FormData();
      formData.append('video', selectedVideo);
      formData.append('analysisType', analysisType);
      formData.append('prompt', prompt);
      
      const response = await fetch('/api/ai/video-analysis', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setAnalysis(data.analysis || 'No analysis generated');
      
    } catch (error) {
      setAnalysis('Error: ' + (error as Error).message + '\n\nPlease check your API configuration and ensure video analysis is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const downloadAnalysis = () => {
    const content = `Video Analysis Report
File: ${selectedVideo?.name || 'Unknown'}
Analysis Type: ${analysisTypes.find(t => t.id === analysisType)?.label || analysisType}
Generated: ${new Date().toLocaleString()}

${prompt ? `Custom Prompt: ${prompt}\n\n` : ''}---

${analysis}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_analysis_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full grid grid-rows-[auto_1fr] gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Film className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI Video Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Video Panel */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
          <h4 className="font-semibold text-white mb-4">Video Upload & Preview</h4>
          
          {!selectedVideo ? (
            <div className="flex-1 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Upload a video file</p>
                <p className="text-sm text-gray-400 mb-4">Supports MP4, MOV, AVI, and more</p>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                  Choose Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative bg-black rounded-lg overflow-hidden mb-4 flex-1">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      >
                        {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                      </button>
                      <button
                        onClick={resetVideo}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      >
                        <RotateCcw className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="text-sm text-white">
                      {selectedVideo.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoPreview('');
                  setAnalysis('');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Remove Video
              </button>
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
          <h4 className="font-semibold text-white mb-4">AI Analysis</h4>
          
          {/* Analysis Type Selection */}
          <div className="space-y-3 mb-4">
            <label className="text-sm font-medium text-white">Analysis Type</label>
            <div className="grid grid-cols-1 gap-2">
              {analysisTypes.map((type) => (
                <label
                  key={type.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    analysisType === type.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-white/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisType"
                    value={type.id}
                    checked={analysisType === type.id}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-white text-sm">{type.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          {analysisType === 'custom' && (
            <div className="mb-4">
              <label className="text-sm font-medium text-white mb-2 block">Custom Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 outline-none focus:border-blue-500/50 resize-none"
                placeholder="Describe what you want to analyze in the video..."
                rows={3}
              />
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeVideo}
            disabled={!selectedVideo || loading || (analysisType === 'custom' && !prompt.trim())}
            className="mb-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Analyzing Video...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Video
              </>
            )}
          </button>

          {/* Analysis Results */}
          <div className="flex-1 bg-slate-800/50 border border-white/20 rounded-lg p-3 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-400">Analyzing your video...</p>
                </div>
              </div>
            ) : analysis ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-white">Analysis Results</h5>
                  <button
                    onClick={downloadAnalysis}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                  {analysis}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-center">
                <div>
                  <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a video and click Analyze to get started</p>
                  <p className="text-sm mt-2">AI will analyze your video content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
