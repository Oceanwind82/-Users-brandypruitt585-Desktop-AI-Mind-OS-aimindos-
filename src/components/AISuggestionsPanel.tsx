'use client';

import React from 'react';
import { ArrowRight, X, Lightbulb, Zap, ArrowUpRight, Sparkles } from 'lucide-react';
import { useSmartSuggestions } from '@/lib/ai-context';

export default function AISuggestionsPanel() {
  const { suggestions, generateSuggestions, dismissSuggestion } = useSmartSuggestions();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateSuggestions = React.useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateSuggestions();
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateSuggestions]);

  React.useEffect(() => {
    // Auto-generate suggestions on mount and when context changes
    const timer = setTimeout(() => {
      handleGenerateSuggestions();
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleGenerateSuggestions]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'medium':
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'medium':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  if (suggestions.length === 0 && !isGenerating) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleGenerateSuggestions}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          title="Get AI Suggestions"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Collapsed state */}
      {!isExpanded && suggestions.length > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">{suggestions.length} AI Suggestions</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="font-semibold text-white">AI Suggestions</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isGenerating && (
            <div className="flex items-center gap-2 text-gray-400 mb-3">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating suggestions...</span>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border transition-all duration-200 hover:bg-white/5 ${getPriorityColor(suggestion.priority)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityIcon(suggestion.priority)}
                      <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                    <p className="text-xs text-gray-400">{suggestion.context}</p>
                  </div>
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      suggestion.action();
                      dismissSuggestion(suggestion.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {suggestion.targetTool ? `Go to ${suggestion.targetTool}` : 'Take Action'}
                  </button>
                  
                  {suggestion.type === 'cross_tool' && (
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg">
                      Cross-tool
                    </div>
                  )}
                  
                  {suggestion.type === 'next_step' && (
                    <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg">
                      Next step
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className={isGenerating ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {isGenerating ? 'Generating...' : 'Refresh Suggestions'}
          </button>
        </div>
      )}
    </div>
  );
}
