'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { ArrowRight, CheckCircle, Target, Zap, Trophy } from 'lucide-react';

const pathInfo = {
  builder: {
    title: 'The Builder',
    description: 'You\'re driven to create and innovate. Your path focuses on product development, design thinking, and bringing ideas to life.',
    color: 'from-blue-500 to-cyan-500',
    icon: '🏗️',
    lessons: [
      'Design Thinking Fundamentals',
      'Product Development 101', 
      'MVP Creation Strategies',
      'User Research Methods',
      'Prototyping Techniques'
    ],
    challenges: [
      'Build your first MVP in 7 days',
      'Design a user journey map',
      'Create 3 different prototypes'
    ],
    automations: [
      'User feedback collection workflow',
      'Design asset organization system',
      'Product roadmap tracker'
    ]
  },
  automator: {
    title: 'The Automator',
    description: 'You see systems everywhere and love making them efficient. Your path focuses on automation, optimization, and scaling processes.',
    color: 'from-purple-500 to-pink-500',
    icon: '⚡',
    lessons: [
      'Automation Fundamentals',
      'Workflow Optimization',
      'API Integration Basics',
      'Process Mapping',
      'Efficiency Metrics'
    ],
    challenges: [
      'Automate your daily routine',
      'Build 3 custom workflows',
      'Optimize an existing process by 50%'
    ],
    automations: [
      'Email to task automation',
      'Social media scheduler',
      'Data backup workflow'
    ]
  },
  dealmaker: {
    title: 'The Deal-Maker',
    description: 'You thrive on connections and negotiations. Your path focuses on sales, networking, and building business relationships.',
    color: 'from-yellow-500 to-orange-500',
    icon: '🤝',
    lessons: [
      'Sales Psychology',
      'Negotiation Mastery',
      'Relationship Building',
      'Deal Structuring',
      'Network Growth Strategies'
    ],
    challenges: [
      'Close 5 new connections this week',
      'Practice 3 negotiation scenarios',
      'Build a referral system'
    ],
    automations: [
      'CRM contact management',
      'Follow-up email sequences',
      'Lead qualification workflow'
    ]
  }
};

function PathResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  
  const pathParam = searchParams?.get('path') as keyof typeof pathInfo;
  const path = pathInfo[pathParam];

  if (!path) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Path not found</h1>
          <button
            onClick={() => router.push('/onboarding/quiz')}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const handleStartJourney = async () => {
    setIsStarting(true);
    
    // Simulate setting up the user's personalized experience
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to dashboard with new path
    router.push('/dashboard?new_path=true');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${path.color} text-5xl mb-6`}>
            {path.icon}
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Welcome,</h1>
          <h2 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            {path.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {path.description}
          </p>
        </div>

        {/* Your Personalized Path */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Lessons */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Target className="w-6 h-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Your Lesson Queue</h3>
            </div>
            <div className="space-y-3">
              {path.lessons.map((lesson, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-sm flex items-center justify-center mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm">{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Starting Challenges</h3>
            </div>
            <div className="space-y-3">
              {path.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{challenge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automations */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-xl font-bold text-white">Starter Automations</h3>
            </div>
            <div className="space-y-3">
              {path.automations.map((automation, index) => (
                <div key={index} className="flex items-start text-gray-300">
                  <Zap className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{automation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* XP Earned */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              +100 XP
            </div>
            <p className="text-gray-300">
              Congratulations! You&apos;ve earned your first 100 XP for completing the onboarding quiz.
            </p>
          </div>
        </div>

        {/* Start Journey Button */}
        <div className="text-center">
          <button
            onClick={handleStartJourney}
            disabled={isStarting}
            className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${path.color} text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:scale-100`}
          >
            {isStarting ? (
              'Setting up your journey...'
            ) : (
              <>
                Start Your {path.title} Journey
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Next Steps Preview */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <div className="text-2xl mb-2">📚</div>
              <p>Access your personalized lesson queue</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <p>Start your daily micro-missions</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🚀</div>
              <p>Begin building your automation toolkit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PathResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading your results...</div>
      </div>
    }>
      <PathResultContent />
    </Suspense>
  );
}
