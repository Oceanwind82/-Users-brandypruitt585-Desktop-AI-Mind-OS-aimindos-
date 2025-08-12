'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams?.get('session_id') || null;
    setSessionId(session);
  }, [searchParams]);

  return (
    <>
      {/* Success Icon */}
      <div className="mb-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
      </div>

      {/* Success Message */}
      <h1 className="text-4xl font-bold text-white mb-4">
        Welcome to AI Mind OS!
      </h1>
      
      <p className="text-xl text-gray-300 mb-8">
        Your subscription is now active. You&apos;re ready to transform your thinking with AI.
      </p>

      {/* Session Info */}
      {sessionId && (
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-400">Order ID: {sessionId.substring(0, 20)}...</p>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">What&apos;s Next?</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            <div>
              <h3 className="text-white font-semibold">Complete Your Onboarding</h3>
              <p className="text-gray-400 text-sm">Set up your workspace and preferences</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <div>
              <h3 className="text-white font-semibold">Explore AI Tools</h3>
              <p className="text-gray-400 text-sm">Try writing, visual thinking, and node-based AI</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <div>
              <h3 className="text-white font-semibold">Join the Community</h3>
              <p className="text-gray-400 text-sm">Connect with other AI-powered thinkers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/onboarding"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Complete Onboarding
          <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Link 
          href="/workbench"
          className="border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          Open Workbench
          <Download className="w-4 h-4" />
        </Link>
      </div>

      {/* Support Info */}
      <div className="mt-12 pt-8 border-t border-white/20">
        <p className="text-gray-400 text-sm">
          Need help? Email us at{' '}
          <a href="mailto:support@aimindos.com" className="text-purple-400 hover:text-purple-300">
            support@aimindos.com
          </a>
        </p>
      </div>
    </>
  );
}
