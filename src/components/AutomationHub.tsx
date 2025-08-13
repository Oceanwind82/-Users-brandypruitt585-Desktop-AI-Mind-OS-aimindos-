'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Zap, Clock, Target, BarChart3, Plus, Edit, Trash2, Copy } from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'schedule' | 'trend' | 'performance' | 'manual';
    config: Record<string, unknown>;
  };
  actions: Array<{
    type: 'generate_content' | 'post_social' | 'analyze_performance' | 'send_notification';
    tool: 'video' | 'writing' | 'whiteboard' | 'intelligence';
    config: Record<string, unknown>;
  }>;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  successRate: number;
  totalRuns: number;
  createdAt: Date;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content_creation' | 'social_media' | 'analytics' | 'collaboration';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  workflow: Partial<AutomationWorkflow>;
}

export default function AutomationHub() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'analytics'>('workflows');

  useEffect(() => {
    // Mock automation data
    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: 'workflow_1',
        name: 'Daily Content Pipeline',
        description: 'Automatically generates content ideas based on trending topics and creates draft scripts for video content.',
        trigger: {
          type: 'schedule',
          config: { time: '09:00', frequency: 'daily' }
        },
        actions: [
          {
            type: 'generate_content',
            tool: 'intelligence',
            config: { contentType: 'video_script', platform: 'tiktok' }
          },
          {
            type: 'generate_content',
            tool: 'writing',
            config: { format: 'social_post', platforms: ['linkedin', 'twitter'] }
          }
        ],
        isActive: true,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 22), // 22 hours from now
        successRate: 94,
        totalRuns: 47,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
      },
      {
        id: 'workflow_2',
        name: 'Trend Opportunity Alert',
        description: 'Monitors trending topics and sends notifications when viral opportunities match your content style.',
        trigger: {
          type: 'trend',
          config: { threshold: 85, categories: ['ai', 'creative', 'business'] }
        },
        actions: [
          {
            type: 'send_notification',
            tool: 'intelligence',
            config: { priority: 'high', include_suggestions: true }
          },
          {
            type: 'generate_content',
            tool: 'whiteboard',
            config: { template: 'trend_analysis' }
          }
        ],
        isActive: true,
        lastRun: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        nextRun: undefined, // Trigger-based
        successRate: 87,
        totalRuns: 23,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        id: 'workflow_3',
        name: 'Cross-Platform Amplification',
        description: 'Takes successful content and automatically adapts it for different platforms with platform-specific optimization.',
        trigger: {
          type: 'performance',
          config: { metric: 'engagement', threshold: 100, timeframe: '24h' }
        },
        actions: [
          {
            type: 'analyze_performance',
            tool: 'intelligence',
            config: { deep_analysis: true }
          },
          {
            type: 'generate_content',
            tool: 'video',
            config: { adapt_for_platforms: ['youtube', 'instagram', 'tiktok'] }
          }
        ],
        isActive: false,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        successRate: 76,
        totalRuns: 12,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      }
    ];

    const mockTemplates: AutomationTemplate[] = [
      {
        id: 'template_1',
        name: 'Content Creator Starter Pack',
        description: 'A complete automation setup for new creators including daily content generation, trend monitoring, and performance tracking.',
        category: 'content_creation',
        difficulty: 'beginner',
        estimatedTime: '10 minutes',
        workflow: {
          name: 'Creator Starter Automation',
          description: 'Daily content pipeline with trend monitoring',
        }
      },
      {
        id: 'template_2',
        name: 'Viral Content Hunter',
        description: 'Advanced trend detection and rapid content creation system for catching viral opportunities.',
        category: 'social_media',
        difficulty: 'advanced',
        estimatedTime: '25 minutes',
        workflow: {
          name: 'Viral Opportunity Automation',
          description: 'Real-time trend monitoring with instant content generation',
        }
      },
      {
        id: 'template_3',
        name: 'Team Collaboration Flow',
        description: 'Automated workflow for team content creation with approval processes and collaborative editing.',
        category: 'collaboration',
        difficulty: 'intermediate',
        estimatedTime: '15 minutes',
        workflow: {
          name: 'Team Content Pipeline',
          description: 'Collaborative content creation with automated reviews',
        }
      }
    ];

    setWorkflows(mockWorkflows);
    setTemplates(mockTemplates);
  }, []);

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'trend': return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'performance': return <Target className="h-4 w-4 text-green-400" />;
      case 'manual': return <Play className="h-4 w-4 text-gray-400" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚡ Automation Hub
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Build powerful workflows to automate your creative process
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-6">
            {[
              { key: 'workflows', label: 'My Workflows', icon: Settings },
              { key: 'templates', label: 'Templates', icon: Copy },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'workflows' | 'templates' | 'analytics')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  activeTab === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div>
            {/* Create Workflow Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Active Workflows</h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Workflow
              </button>
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="bg-white/5 rounded-xl border border-white/10 p-6">
                  
                  {/* Workflow Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{workflow.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <p className="text-gray-300 text-sm">{workflow.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleWorkflow(workflow.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          workflow.isActive
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Trigger Info */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg">
                    {getTriggerIcon(workflow.trigger.type)}
                    <span className="text-sm text-gray-300 capitalize">
                      {workflow.trigger.type} trigger
                    </span>
                    {workflow.nextRun && (
                      <span className="text-xs text-gray-400 ml-auto">
                        Next: {workflow.nextRun.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Actions ({workflow.actions.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.actions.map((action, index) => (
                        <div key={index} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <span>{action.tool}</span>
                          <span>•</span>
                          <span>{action.type.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{workflow.successRate}%</p>
                      <p className="text-xs text-gray-400">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{workflow.totalRuns}</p>
                      <p className="text-xs text-gray-400">Total Runs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {workflow.lastRun ? Math.floor((Date.now() - workflow.lastRun.getTime()) / (1000 * 60 * 60)) + 'h' : 'Never'}
                      </p>
                      <p className="text-xs text-gray-400">Last Run</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Automation Templates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                  
                  {/* Template Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{template.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Category: {template.category.replace('_', ' ')}</span>
                      <span>⏱️ {template.estimatedTime}</span>
                    </div>
                  </div>

                  {/* Use Template Button */}
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Automation Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Active Workflows', value: workflows.filter(w => w.isActive).length, color: 'green' },
                { label: 'Total Executions', value: workflows.reduce((sum, w) => sum + w.totalRuns, 0), color: 'blue' },
                { label: 'Average Success Rate', value: Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length) + '%', color: 'purple' },
                { label: 'Time Saved', value: '47h', color: 'yellow' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-gray-300 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Automation Activity</h3>
              <div className="space-y-3">
                {workflows.filter(w => w.lastRun).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">{workflow.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">
                        Last run: {workflow.lastRun?.toLocaleString()}
                      </p>
                      <p className="text-green-400 text-xs">✅ Success</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
