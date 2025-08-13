'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SubmitIntel() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    submittedBy: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [xpEarned, setXpEarned] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setStatus('error');
      setMessage('Title and content are required');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/submit-intel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Intelligence submitted successfully!');
        setXpEarned(data.xpEarned || 0);
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: '',
          submittedBy: ''
        });
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit intelligence');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      console.error('Submit intel error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Mind OS
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-semibold">Submit Intelligence</h1>
          </div>
          <Link 
            href="/intelligence" 
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">🧠 Community Intelligence</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Share your insights, discoveries, and dangerous ideas with the AI Mind OS community. 
            Your submissions will be AI-polished and added to our intelligence database.
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-green-400">{message}</span>
            </div>
            {xpEarned > 0 && (
              <div className="mt-2 text-sm text-green-300">
                🎯 +{xpEarned} XP earned for your contribution!
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❌</span>
              <span className="text-red-400">{message}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="AI Agent Breakthrough: New Reasoning Capabilities"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                <option value="ai-research">AI Research</option>
                <option value="automation">Automation</option>
                <option value="productivity">Productivity</option>
                <option value="tools">Tools & Tech</option>
                <option value="strategy">Strategy</option>
                <option value="insights">Market Insights</option>
                <option value="predictions">Predictions</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                placeholder="Share your insights, discoveries, or dangerous ideas. Be specific and actionable. Our AI will polish your content while preserving your core message..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                Minimum 50 characters. Your content will be AI-enhanced before publication.
              </div>
            </div>

            {/* Submitted By */}
            <div>
              <label htmlFor="submittedBy" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name/Handle
              </label>
              <input
                type="text"
                id="submittedBy"
                name="submittedBy"
                value={formData.submittedBy}
                onChange={handleInputChange}
                placeholder="Anonymous"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                Optional. Leave blank to submit anonymously.
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                * Required fields
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>🧠</span>
                    <span>Submit Intelligence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Guidelines */}
        <div className="mt-8 bg-gray-900/30 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">📋 Submission Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Focus on actionable insights and practical applications</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Share original discoveries, tools, or strategic thinking</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>AI will enhance your content while preserving your core message</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Quality submissions earn XP and recognition in the community</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Published content becomes part of the AI Mind OS knowledge base</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between text-sm">
          <Link 
            href="/intelligence" 
            className="text-blue-400 hover:text-blue-300"
          >
            ← View Intelligence Dashboard
          </Link>
          
          <Link 
            href="/" 
            className="text-gray-400 hover:text-gray-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
