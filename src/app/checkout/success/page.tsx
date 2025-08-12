'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, ArrowLeft, Zap, Trophy, Users } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Get email from URL params or local storage
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('checkoutEmail') || '';
    setUserEmail(email);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-8">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-cyan-200 bg-clip-text text-transparent">
            Welcome to AI Mind OS!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your payment was successful. A confirmation email has been sent to{' '}
            <span className="text-cyan-400 font-semibold">{userEmail || 'your email address'}</span>.
          </p>

          {/* What's Next */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-12 text-left">
            <h2 className="text-2xl font-bold mb-6 text-center">What&apos;s Next?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complete Setup</h3>
                  <p className="text-gray-400 text-sm">
                    Check your email for account setup instructions and login credentials.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Explore the Workbench</h3>
                  <p className="text-gray-400 text-sm">
                    Start with our interactive tutorial to master the AI-powered tools.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Join the Community</h3>
                  <p className="text-gray-400 text-sm">
                    Connect with fellow dangerous thinkers and share your insights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link 
              href="/workbench"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <Zap className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-bold">Start Creating</h3>
                <p className="text-sm opacity-90">Open the AI Workbench</p>
              </div>
            </Link>
            
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <Trophy className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-bold">View Dashboard</h3>
                <p className="text-sm opacity-90">Track your progress</p>
              </div>
            </Link>
            
            <Link 
              href="/leaderboard"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <Users className="w-6 h-6" />
              <div className="text-left">
                <h3 className="font-bold">Join Community</h3>
                <p className="text-sm opacity-90">See the leaderboard</p>
              </div>
            </Link>
          </div>

          {/* Support */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Need Help Getting Started?</h3>
            <p className="text-gray-300 mb-4">
              Our team is here to help you make the most of your AI Mind OS experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/support" 
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                href="/docs" 
                className="border border-yellow-500 text-yellow-400 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500/10 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>

          {/* Continue */}
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
