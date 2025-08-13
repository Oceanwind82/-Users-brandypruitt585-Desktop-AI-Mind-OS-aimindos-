'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Brain, 
  Users, 
  Target,
  Paintbrush,
  PenTool,
  Video,
  Network
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function OnboardingPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'quiz',
      title: 'Take Your Path Quiz',
      description: 'Discover your learning path: Builder, Automator, or Deal-Maker',
      href: '/onboarding/quiz',
      icon: <Brain className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Set up your dangerous thinker profile and preferences',
      href: '/profile',
      icon: <Users className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'workbench',
      title: 'Try the AI Workbench',
      description: 'Create your first project using our visual thinking tools',
      href: '/workbench',
      icon: <Paintbrush className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'writing',
      title: 'Generate AI Content',
      description: 'Use our AI writing assistant to create compelling content',
      href: '/workbench?tool=writing',
      icon: <PenTool className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'analytics',
      title: 'View Your Analytics',
      description: 'Explore insights about your thinking patterns and progress',
      href: '/analytics',
      icon: <Target className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Connect with other dangerous thinkers on the leaderboard',
      href: '/leaderboard',
      icon: <Users className="w-5 h-5" />,
      completed: false
    }
  ]);

  const completedCount = checklist.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  const toggleComplete = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Welcome to AI Mind OS
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Let&apos;s Get You Started
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Complete these essential steps to unlock the full power of dangerous thinking
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedCount}/{checklist.length} completed</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4 mb-12">
          {checklist.map((item) => (
            <div 
              key={item.id}
              className={`bg-white/5 rounded-xl border transition-all hover:scale-[1.02] ${
                item.completed ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'
              }`}
            >
              <div className="p-6 flex items-center gap-4">
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.completed 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-400 hover:border-white'
                  }`}
                >
                  {item.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.completed ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {item.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${item.completed ? 'text-green-400' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
                
                <Link 
                  href={item.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    item.completed 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                  }`}
                >
                  {item.completed ? 'Revisit' : 'Start'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Tools */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Start: Choose Your First Tool</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/workbench?tool=whiteboard"
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 hover:scale-105 transition-all text-center"
            >
              <Paintbrush className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Whiteboard</h3>
              <p className="text-gray-400 text-sm">Visual brainstorming canvas</p>
            </Link>
            
            <Link 
              href="/workbench?tool=writing"
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 hover:scale-105 transition-all text-center"
            >
              <PenTool className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Writing AI</h3>
              <p className="text-gray-400 text-sm">AI-powered content creation</p>
            </Link>
            
            <Link 
              href="/workbench?tool=video"
              className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:scale-105 transition-all text-center"
            >
              <Video className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Video AI</h3>
              <p className="text-gray-400 text-sm">Script & storyboard generator</p>
            </Link>
            
            <Link 
              href="/workbench?tool=nodes"
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 hover:scale-105 transition-all text-center"
            >
              <Network className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Node AI</h3>
              <p className="text-gray-400 text-sm">Workflow system builder</p>
            </Link>
          </div>
        </div>

        {/* Support & Resources */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">Need Help?</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Join our community or contact support for personalized assistance.
            </p>
            <div className="flex gap-3">
              <Link 
                href="/support" 
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-400 transition-colors"
              >
                Get Support
              </Link>
              <Link 
                href="/docs" 
                className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-500/10 transition-colors"
              >
                View Docs
              </Link>
            </div>
          </div>
          
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Video Tutorials</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Watch our step-by-step guides to master each tool quickly.
            </p>
            <Link 
              href="/tutorials" 
              className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
            >
              Watch Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Complete Onboarding */}
        {completedCount === checklist.length ? (
          <div className="text-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="text-gray-300 mb-6">
              You&apos;ve completed the onboarding. You&apos;re ready to think dangerously!
            </p>
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip onboarding for now →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
