'use client';

import React, { useState, useEffect } from 'react';
import { usePredictive } from '@/lib/predictive-system';
import { useSensory, useAudioFeedback } from '@/lib/sensory-system';
import { Zap, Clock, Target, Sparkles, X } from 'lucide-react';

export default function SpeedLanes() {
  const { predictions, executePrediction, backgroundDrafts, enableAutoDraft, toggleAutoDraft } = usePredictive();
  const { currentTheme } = useSensory();
  const { onClick, onHover } = useAudioFeedback();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackgroundDrafts, setShowBackgroundDrafts] = useState(false);

  // Auto-expand when predictions are available
  useEffect(() => {
    if (predictions.length > 0) {
      setIsExpanded(true);
      // Auto-collapse after 10 seconds if no interaction
      const timer = setTimeout(() => setIsExpanded(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [predictions]);

  // Show notification when background drafts are ready
  useEffect(() => {
    const readyDrafts = backgroundDrafts.filter(draft => 
      draft.readyAt.getTime() <= Date.now()
    );
    if (readyDrafts.length > 0) {
      setShowBackgroundDrafts(true);
    }
  }, [backgroundDrafts]);

  const handleExecutePrediction = async (predictionId: string) => {
    onClick();
    await executePrediction(predictionId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'from-green-500 to-emerald-500';
    if (confidence >= 0.6) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-purple-500';
  };

  const getAnimationClass = () => {
    switch (currentTheme.ui.animation) {
      case 'dramatic': return 'transition-all duration-500 ease-out transform';
      case 'snappy': return 'transition-all duration-200 ease-out transform';
      default: return 'transition-all duration-300 ease-in-out transform';
    }
  };

  if (predictions.length === 0 && backgroundDrafts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Speed Lanes Container */}
      <div 
        className={`fixed top-20 right-6 z-40 ${getAnimationClass()} ${
          isExpanded ? 'translate-x-0' : 'translate-x-80'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onClick();
          }}
          onMouseEnter={onHover}
          className={`absolute -left-12 top-4 bg-gradient-to-r ${getConfidenceColor(0.9)} hover:scale-110 text-white p-3 rounded-l-xl shadow-lg ${getAnimationClass()}`}
        >
          <Zap className="h-5 w-5" />
          {predictions.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {predictions.length}
            </div>
          )}
        </button>

        {/* Speed Lanes Panel */}
        <div 
          className="w-80 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-4"
          style={{ 
            background: currentTheme.ui.glassmorphism 
              ? 'rgba(0,0,0,0.2)' 
              : currentTheme.ui.background 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-white">Speed Lanes</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Predictions */}
          {predictions.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Next 3 Actions
              </h4>
              
              {predictions.slice(0, 3).map((prediction) => (
                <button
                  key={prediction.id}
                  onClick={() => handleExecutePrediction(prediction.id)}
                  onMouseEnter={onHover}
                  className={`w-full p-3 rounded-lg bg-gradient-to-r ${getConfidenceColor(prediction.confidence)}/20 border border-white/10 hover:border-white/30 text-left group ${getAnimationClass()} hover:scale-[1.02]`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{prediction.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">{prediction.description}</p>
                        <span className="text-xs text-gray-400">{prediction.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full bg-gradient-to-r ${getConfidenceColor(prediction.confidence)}`}
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Background Drafts */}
          {backgroundDrafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Auto-Drafts ({backgroundDrafts.length})
                </h4>
                <button
                  onClick={() => {
                    toggleAutoDraft();
                    onClick();
                  }}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    enableAutoDraft 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {enableAutoDraft ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {backgroundDrafts.slice(0, 2).map((draft) => {
                const isReady = draft.readyAt.getTime() <= Date.now();
                return (
                  <div
                    key={draft.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isReady 
                        ? 'bg-green-500/20 border-green-500/30 animate-pulse' 
                        : 'bg-blue-500/20 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium">
                        {draft.type.replace('_', ' ')} Draft
                      </p>
                      <span className="text-xs text-gray-400">
                        {draft.tool}
                      </span>
                    </div>
                    
                    {isReady ? (
                      <button
                        onClick={() => {
                          // Open draft in appropriate tool
                          window.location.href = `/${draft.tool}?draft=${draft.id}`;
                          onClick();
                        }}
                        onMouseEnter={onHover}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg transition-colors"
                      >
                        Open Draft ✨
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Generating... {Math.round((draft.readyAt.getTime() - Date.now()) / 1000)}s
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {predictions.length === 0 && backgroundDrafts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Learning your patterns...</p>
            </div>
          )}
        </div>
      </div>

      {/* Background Draft Notification */}
      {showBackgroundDrafts && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <div className="flex-1">
                <h4 className="font-semibold">Draft Ready!</h4>
                <p className="text-sm opacity-90">Your background content is ready to review</p>
              </div>
              <button
                onClick={() => setShowBackgroundDrafts(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
