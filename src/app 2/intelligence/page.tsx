'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Briefing {
  id: number;
  title: string;
  content: string;
  insights: string[];
  created_at: string;
}

interface Article {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface IntelligenceData {
  briefing: Briefing | null;
  liveIntel: Article[];
  lastUpdate: string;
  status: string;
}

export default function Intelligence() {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntelligence();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchIntelligence, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchIntelligence = async () => {
    try {
      const response = await fetch('/api/intelligence');
      if (!response.ok) throw new Error('Failed to fetch intelligence');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Intelligence system unavailable');
      console.error('Intelligence fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-400">Initializing AI Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Mind OS
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold">Intelligence Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${data?.status === 'operational' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className={`text-sm ${getStatusColor(data?.status || 'unknown')}`}>
              {data?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">⚠️ {error}</p>
            <button 
              onClick={fetchIntelligence}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Daily Briefing */}
            {data?.briefing && (
              <section className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-blue-400">🧠 Daily Briefing</h2>
                  <span className="text-sm text-gray-400">
                    {formatTime(data.briefing.created_at)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{data.briefing.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{data.briefing.content}</p>
                {data.briefing.insights && data.briefing.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insights:</h4>
                    <ul className="space-y-1">
                      {data.briefing.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-400 flex items-center">
                          <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Live Intelligence */}
            <section className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-400">📡 Live Intelligence</h2>
                <span className="text-sm text-gray-400">
                  Last update: {data ? formatTime(data.lastUpdate) : 'Never'}
                </span>
              </div>
              
              {data?.liveIntel && data.liveIntel.length > 0 ? (
                <div className="space-y-4">
                  {data.liveIntel.map((article, index) => (
                    <article key={index} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white hover:text-blue-400">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {article.title}
                          </a>
                        </h3>
                        <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                          {article.source.name}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2 leading-relaxed">{article.description}</p>
                      <div className="text-xs text-gray-500">
                        {formatTime(article.publishedAt)}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No intelligence data available</p>
                </div>
              )}
            </section>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Back to Dashboard
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/submit-intel"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🧠 Submit Intel
                </Link>
                
                <button 
                  onClick={fetchIntelligence}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  🔄 Refresh Intelligence
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
