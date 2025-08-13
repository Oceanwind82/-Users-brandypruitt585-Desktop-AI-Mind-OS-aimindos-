'use client';

import React from 'react';
import { 
  TrendingUp, 
  Zap, 
  Globe, 
  Clock, 
  Sparkles, 
  Video, 
  FileText, 
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Brain,
  Target,
  Rocket,
  RefreshCw
} from 'lucide-react';
import { useAIContext } from '@/lib/ai-context';

interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'social' | 'business' | 'creative' | 'ai';
  platform: 'tiktok' | 'youtube' | 'twitter' | 'instagram' | 'linkedin';
  engagement: number;
  relevanceScore: number;
  suggestedActions: Array<{
    tool: 'video' | 'writing' | 'whiteboard';
    action: string;
    prompt: string;
  }>;
  timeframe: '1h' | '6h' | '24h' | '7d';
  source: string;
  timestamp: string;
}

interface IntelligenceData {
  trends: TrendingTopic[];
  suggestions: Array<{
    id: string;
    type: 'opportunity' | 'optimization' | 'learning';
    title: string;
    description: string;
    confidence: number;
    estimatedImpact: 'low' | 'medium' | 'high';
    tool?: string;
  }>;
  marketInsights: {
    hotKeywords: string[];
    emergingFormats: string[];
    contentGaps: string[];
  };
}

export default function RealTimeIntelligenceLayer() {
  const [intelligenceData, setIntelligenceData] = React.useState<IntelligenceData | null>(null);
  const [selectedTrend, setSelectedTrend] = React.useState<TrendingTopic | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [autoRefresh] = React.useState(true);

  const { addActivity, addAsset } = useAIContext();

  // Fetch real-time intelligence data
  const fetchIntelligence = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/intelligence-layer', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntelligenceData(data);
        setLastUpdate(new Date());
      } else {
        // Fallback to mock data for demo
        setIntelligenceData(generateMockIntelligence());
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Intelligence fetch failed:', error);
      setIntelligenceData(generateMockIntelligence());
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every hour
  React.useEffect(() => {
    fetchIntelligence();
    
    if (autoRefresh) {
      const interval = setInterval(fetchIntelligence, 60 * 60 * 1000); // 1 hour
      return () => clearInterval(interval);
    }
  }, [fetchIntelligence, autoRefresh]);

  const generateMockIntelligence = (): IntelligenceData => ({
    trends: [
      {
        id: '1',
        title: 'AI Video Generation Explodes on TikTok',
        description: 'Short-form AI-generated videos are getting 10M+ views. Users are creating sci-fi scenarios in under 60 seconds.',
        category: 'ai',
        platform: 'tiktok',
        engagement: 95,
        relevanceScore: 92,
        timeframe: '6h',
        source: 'TikTok Trending API',
        timestamp: new Date().toISOString(),
        suggestedActions: [
          {
            tool: 'video',
            action: 'Create AI Sci-Fi Video',
            prompt: 'Generate a 60-second sci-fi video script about AI taking over daily life, optimized for TikTok vertical format'
          },
          {
            tool: 'writing',
            action: 'Write TikTok Caption',
            prompt: 'Write a viral TikTok caption for an AI-generated sci-fi video that will get maximum engagement'
          }
        ]
      },
      {
        id: '2',
        title: 'Personal Brand Building Through Storytelling',
        description: 'LinkedIn professionals sharing personal failure stories are seeing 300% higher engagement rates.',
        category: 'business',
        platform: 'linkedin',
        engagement: 87,
        relevanceScore: 85,
        timeframe: '24h',
        source: 'LinkedIn Analytics',
        timestamp: new Date().toISOString(),
        suggestedActions: [
          {
            tool: 'writing',
            action: 'Personal Story Post',
            prompt: 'Write a LinkedIn post about a professional failure and the lessons learned, formatted for maximum engagement'
          },
          {
            tool: 'whiteboard',
            action: 'Story Structure Map',
            prompt: 'Create a visual story structure for personal brand content showing: Problem → Journey → Lesson → Call to Action'
          }
        ]
      },
      {
        id: '3',
        title: 'Micro-Learning Content Surge',
        description: 'Educational content under 2 minutes is dominating. Quick tutorials and "did you know" facts are viral.',
        category: 'creative',
        platform: 'youtube',
        engagement: 78,
        relevanceScore: 88,
        timeframe: '1h',
        source: 'YouTube Shorts Analytics',
        timestamp: new Date().toISOString(),
        suggestedActions: [
          {
            tool: 'video',
            action: 'Quick Tutorial Script',
            prompt: 'Create a 90-second educational video script explaining a complex AI concept in simple terms'
          }
        ]
      }
    ],
    suggestions: [
      {
        id: 's1',
        type: 'opportunity',
        title: 'High-Impact Content Gap Detected',
        description: 'AI automation tutorials for small businesses have low competition but high demand',
        confidence: 89,
        estimatedImpact: 'high',
        tool: 'video'
      },
      {
        id: 's2',
        type: 'optimization',
        title: 'Cross-Platform Strategy Recommendation',
        description: 'Your video content could be repurposed into 3 LinkedIn carousel posts for 200% more reach',
        confidence: 76,
        estimatedImpact: 'medium'
      }
    ],
    marketInsights: {
      hotKeywords: ['AI automation', 'personal brand', 'micro-learning', 'remote work', 'digital detox'],
      emergingFormats: ['vertical long-form', 'interactive polls', 'behind-the-scenes', 'split-screen tutorials'],
      contentGaps: ['AI for non-techies', 'sustainable productivity', 'authentic leadership']
    }
  });

  const handleTrendAction = async (trend: TrendingTopic, action: TrendingTopic['suggestedActions'][0]) => {
    // Add this trend intelligence to user's assets
    addAsset({
      type: 'text',
      content: `Trend: ${trend.title}\nAction: ${action.action}\nPrompt: ${action.prompt}`,
      sourceTool: 'intelligence',
      title: `Trend Opportunity: ${trend.title}`,
      tags: ['trend', action.tool, trend.platform, trend.category]
    });

    // Track activity
    addActivity({
      tool: 'intelligence',
      action: 'use_trend',
      content: `Applied trend insight: ${trend.title} → ${action.action}`
    });

    // This would typically navigate to the specified tool with the prompt pre-filled
    alert(`Opening ${action.tool} tool with trend-optimized prompt! 🚀`);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return '📱';
      case 'youtube': return '🎬';
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'instagram': return '📸';
      default: return '🌐';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
      case 'tech': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'social': return 'from-pink-500/20 to-rose-500/20 border-pink-500/30';
      case 'business': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'creative': return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[80vh] bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">Live Intelligence</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchIntelligence}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(lastUpdate.toISOString())}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          Real-time trends & AI-powered opportunities
        </p>
      </div>

      <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
        {/* Trending Now */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <h4 className="font-medium text-white">Trending Now</h4>
          </div>
          
          <div className="space-y-3">
            {intelligenceData?.trends.map((trend) => (
              <div
                key={trend.id}
                className={`bg-gradient-to-r ${getCategoryColor(trend.category)} rounded-lg p-3 cursor-pointer hover:bg-opacity-80 transition-all`}
                onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getPlatformIcon(trend.platform)}</span>
                      <h5 className="font-medium text-white text-sm">{trend.title}</h5>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">{trend.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-yellow-300">{trend.engagement}% engagement</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {trend.timeframe} • {trend.relevanceScore}% match
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                    selectedTrend?.id === trend.id ? 'rotate-90' : ''
                  }`} />
                </div>

                {/* Expanded Actions */}
                {selectedTrend?.id === trend.id && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <h6 className="text-xs font-medium text-white mb-2">Suggested Actions:</h6>
                    <div className="space-y-2">
                      {trend.suggestedActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrendAction(trend, action);
                          }}
                          className="w-full flex items-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors"
                        >
                          {action.tool === 'video' && <Video className="h-4 w-4 text-blue-400" />}
                          {action.tool === 'writing' && <FileText className="h-4 w-4 text-green-400" />}
                          {action.tool === 'whiteboard' && <ImageIcon className="h-4 w-4 text-purple-400" />}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{action.action}</div>
                            <div className="text-xs text-gray-400 truncate">{action.prompt}</div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-blue-400" />
            <h4 className="font-medium text-white">AI Recommendations</h4>
          </div>
          
          <div className="space-y-2">
            {intelligenceData?.suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {suggestion.type === 'opportunity' && <Rocket className="h-4 w-4 text-green-400" />}
                  {suggestion.type === 'optimization' && <Sparkles className="h-4 w-4 text-blue-400" />}
                  {suggestion.type === 'learning' && <Brain className="h-4 w-4 text-purple-400" />}
                  <span className="text-sm font-medium text-white">{suggestion.title}</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{suggestion.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                      {suggestion.confidence}% confidence
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      suggestion.estimatedImpact === 'high' ? 'bg-green-500/20 text-green-300' :
                      suggestion.estimatedImpact === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {suggestion.estimatedImpact} impact
                    </div>
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    Apply →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-cyan-400" />
            <h4 className="font-medium text-white">Market Pulse</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-1">Hot Keywords</h5>
              <div className="flex flex-wrap gap-1">
                {intelligenceData?.marketInsights.hotKeywords.map((keyword) => (
                  <span key={keyword} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-1">Emerging Formats</h5>
              <div className="flex flex-wrap gap-1">
                {intelligenceData?.marketInsights.emergingFormats.map((format) => (
                  <span key={format} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {format}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-medium text-gray-300 mb-1">Content Opportunities</h5>
              <div className="flex flex-wrap gap-1">
                {intelligenceData?.marketInsights.contentGaps.map((gap) => (
                  <span key={gap} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-white/10 p-2 bg-slate-800/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live feed active
          </div>
          <div>
            Next update: {Math.ceil((60 - new Date().getMinutes()) / 10) * 10}min
          </div>
        </div>
      </div>
    </div>
  );
}
