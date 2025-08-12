import Link from 'next/link';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* 404 Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-8">
          <Search className="w-10 h-10 text-purple-400" />
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-400 text-lg">
            This page doesn&apos;t exist or has been moved. Even dangerous thinkers sometimes take wrong turns.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <Link 
            href="/"
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all inline-flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/workbench"
              className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2 justify-center"
            >
              <Zap className="w-5 h-5" />
              Try Workbench
            </Link>
            
            <Link 
              href="/dashboard"
              className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center gap-2 justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">Looking for something specific?</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              → Pricing Plans
            </Link>
            <Link href="/support" className="text-gray-300 hover:text-white transition-colors">
              → Get Support
            </Link>
            <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
              → Documentation
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              → Community
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm mt-8">
          Error code: 404 | AI Mind OS | Dangerous thinking, safe navigation
        </p>
      </div>
    </main>
  );
}
