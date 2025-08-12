import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Zap, Bug, Plus, ArrowUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | AI Mind OS',
  description: 'Stay updated with the latest features, improvements, and fixes to AI Mind OS.',
};

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2025-08-12',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Added AI Workbench with visual whiteboard, writing AI, and node workflows' },
      { type: 'feature', description: 'Introduced PNG export functionality for whiteboard creations' },
      { type: 'feature', description: 'Implemented zoom, pan, and grid snap features in whiteboard' },
      { type: 'feature', description: 'Added AI writing templates for faster content creation' },
      { type: 'improvement', description: 'Enhanced user interface with modern design system' },
      { type: 'improvement', description: 'Improved performance and reduced loading times' },
    ]
  },
  {
    version: '0.1.5',
    date: '2025-08-10',
    type: 'patch',
    changes: [
      { type: 'fix', description: 'Fixed TypeScript compilation errors in API routes' },
      { type: 'fix', description: 'Resolved missing component imports' },
      { type: 'improvement', description: 'Updated database schema for better performance' },
      { type: 'improvement', description: 'Enhanced error handling and user feedback' },
    ]
  },
  {
    version: '0.1.0',
    date: '2025-08-01',
    type: 'major',
    changes: [
      { type: 'feature', description: 'Initial release of AI Mind OS platform' },
      { type: 'feature', description: 'User authentication and profile management' },
      { type: 'feature', description: 'Gamified learning system with XP and achievements' },
      { type: 'feature', description: 'Community leaderboard and social features' },
      { type: 'feature', description: 'Analytics dashboard for tracking progress' },
      { type: 'feature', description: 'Mission system for guided learning' },
    ]
  }
];

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Plus className="w-4 h-4 text-green-400" />;
    case 'improvement':
      return <ArrowUp className="w-4 h-4 text-blue-400" />;
    case 'fix':
      return <Bug className="w-4 h-4 text-red-400" />;
    default:
      return <Zap className="w-4 h-4 text-gray-400" />;
  }
};

const getVersionBadge = (type: string) => {
  switch (type) {
    case 'major':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'minor':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'patch':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AI MIND OS</Link>
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            Product Updates
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Changelog
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest features, improvements, and fixes to AI Mind OS. 
            We&apos;re constantly evolving to serve dangerous thinkers better.
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-12">
          {changelog.map((entry) => (
            <div key={entry.version} className="relative">
              {/* Version Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">v{entry.version}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVersionBadge(entry.type)}`}>
                    {entry.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 h-px bg-white/20"></div>
                <time className="text-gray-400 text-sm">{entry.date}</time>
              </div>

              {/* Changes */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="space-y-4">
                  {entry.changes.map((change, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            change.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                            change.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {change.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300">{change.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Want to influence our roadmap?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our community of dangerous thinkers and help shape the future of AI Mind OS. 
            Your feedback drives our development priorities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/feedback"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              Share Feedback
            </Link>
            <Link 
              href="/leaderboard"
              className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Join Community
            </Link>
          </div>
        </div>

        {/* Subscription */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Get notified about new releases and updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
