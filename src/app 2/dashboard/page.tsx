import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - AI Mind OS',
  description: 'Your AI learning dashboard with amazing lessons and progress tracking',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 AI Mind OS Dashboard
          </h1>
          <p className="text-purple-200 text-lg">
            Welcome to your AI learning journey - where amazing lessons meet cutting-edge technology
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">1,250</div>
              <div className="text-purple-200">Total XP</div>
              <div className="text-sm text-purple-300">Level 3</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">7</div>
              <div className="text-purple-200">Current Streak</div>
              <div className="text-sm text-purple-300">🔥 Keep it up!</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">12</div>
              <div className="text-purple-200">Lessons Completed</div>
              <div className="text-sm text-purple-300">158 remaining</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">9.2</div>
              <div className="text-purple-200">Amazingness Score</div>
              <div className="text-sm text-purple-300">⭐ Amazing tier!</div>
            </div>
          </div>
        </div>

        {/* AI Assistant Banner for Mind Master Users */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-indigo-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    AI Personal Learning Assistant
                  </h3>
                  <p className="text-indigo-200 text-sm">
                    Your introvert-friendly AI study buddy • Available 24/7 • No video calls ever!
                  </p>
                  <div className="mt-2">
                    <span className="inline-block bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full border border-purple-400/30">
                      ⭐ Mind Master Exclusive
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <a
                  href="/ai-assistant"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Chat Now
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.828L3 21l1.828-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="md:hidden mt-4">
              <a
                href="/ai-assistant"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Chat with AI Assistant
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.828L3 21l1.828-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            🛠️ AI Learning Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Mind Whiteboard */}
            <a
              href="/whiteboard"
              className="group bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    AI Mind Whiteboard
                  </h3>
                  <span className="text-xs bg-gradient-to-r from-purple-400 to-blue-400 text-white px-2 py-1 rounded-full">
                    NEW ✨
                  </span>
                </div>
              </div>
              <p className="text-purple-200 text-sm mb-3">
                Visual mind mapping with AI assistance. Transform any content into interactive sticky notes and diagrams.
              </p>
              <div className="flex items-center text-purple-400 text-sm">
                <span>Launch Whiteboard</span>
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>

            {/* AI Assistant */}
            <a
              href="/ai-assistant"
              className="group bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.828L3 21l1.828-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    AI Learning Assistant
                  </h3>
                  <span className="text-xs bg-gradient-to-r from-indigo-400 to-purple-400 text-white px-2 py-1 rounded-full">
                    INTROVERT-FRIENDLY
                  </span>
                </div>
              </div>
              <p className="text-indigo-200 text-sm mb-3">
                Get personalized AI help with lessons, concepts, and learning paths. No human interaction required.
              </p>
              <div className="flex items-center text-indigo-400 text-sm">
                <span>Chat with AI</span>
                <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>

            {/* Coming Soon - More Tools */}
            <div className="group bg-gradient-to-br from-gray-600/20 to-slate-600/20 backdrop-blur-lg rounded-xl p-6 border border-gray-500/30">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-500/20 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    More AI Tools
                  </h3>
                  <span className="text-xs bg-gradient-to-r from-gray-400 to-slate-400 text-white px-2 py-1 rounded-full">
                    COMING SOON
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                AI code playground, research assistant, presentation builder, and more amazing tools.
              </p>
              <div className="flex items-center text-gray-400 text-sm">
                <span>Stay tuned...</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Lessons */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                📚 Available Lessons
                <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  Auto-Updated
                </span>
              </h2>
              
              <div className="space-y-4">
                <LessonCard
                  title="Neural Networks Fundamentals"
                  category="Core AI Foundations"
                  difficulty="Beginner"
                  duration="45 min"
                  amazingnessScore={9.5}
                  description="Learn the building blocks of artificial intelligence"
                  badge="🔥 ESSENTIAL"
                  lessonId="neural_networks_101"
                />
                
                <LessonCard
                  title="Transformer Architecture"
                  category="Deep Learning"
                  difficulty="Intermediate"
                  duration="60 min"
                  amazingnessScore={10.0}
                  description="Master the revolutionary architecture behind GPT and BERT"
                  badge="🌟 REVOLUTIONARY"
                  lessonId="transformer_architecture"
                />
                
                <LessonCard
                  title="Computer Vision with CNNs"
                  category="Computer Vision"
                  difficulty="Intermediate"
                  duration="55 min"
                  amazingnessScore={9.2}
                  description="Apply deep learning to visual understanding"
                  badge="👁️ HIGH-IMPACT"
                  lessonId="computer_vision_cnns"
                />
              </div>
              
              <button className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                View All 170+ AI Topics →
              </button>
            </div>
          </div>

          {/* Learning Progress & Features */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📈 Learning Progress</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Core AI Foundations</span>
                    <span>3/12</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Machine Learning</span>
                    <span>2/12</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-1/6"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Deep Learning</span>
                    <span>1/14</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-1/12"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">🤖 AI Features</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Research AI Active</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Auto-Updater Running</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Quality Tracking</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-200 text-sm">Personalized Paths</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="text-green-400 text-sm font-semibold">Latest Update</div>
                <div className="text-green-200 text-xs">
                  Research AI integrated 3 new developments into Transformer lesson
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  🎯 Generate Custom Lesson
                </button>
                
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  📊 View Progress Analytics
                </button>
                
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  🏆 Check Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LessonCardProps {
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  amazingnessScore: number;
  description: string;
  badge: string;
  lessonId: string;
}

function LessonCard({ title, category, difficulty, duration, amazingnessScore, description, badge, lessonId }: LessonCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 9.5) return 'text-green-400';
    if (score >= 9.0) return 'text-blue-400';
    if (score >= 8.0) return 'text-yellow-400';
    return 'text-purple-400';
  };

  const getScoreTier = (score: number) => {
    if (score >= 9.5) return '🌟 ABSOLUTELY AMAZING';
    if (score >= 9.0) return '⭐ AMAZING';
    if (score >= 8.0) return '✨ EXCELLENT';
    return '👍 GREAT';
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/10">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">
          {badge}
        </span>
      </div>
      
      <p className="text-purple-200 text-sm mb-3">{description}</p>
      
      <div className="flex items-center justify-between text-xs text-purple-300 mb-3">
        <span>{category}</span>
        <span>{difficulty}</span>
        <span>{duration}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${getScoreColor(amazingnessScore)}`}>
            {amazingnessScore}/10
          </span>
          <span className="text-xs text-purple-300">
            {getScoreTier(amazingnessScore)}
          </span>
        </div>
        
        <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-1 px-3 rounded text-sm transition-all duration-300">
          <a href={`/lessons/${lessonId}`}>
            Start Lesson
          </a>
        </button>
      </div>
    </div>
  );
}
