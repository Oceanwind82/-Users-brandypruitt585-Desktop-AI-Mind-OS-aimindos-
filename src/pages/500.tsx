import Link from 'next/link';
import { ServerCrash, Home, RefreshCw, MessageSquare } from 'lucide-react';

export default function Custom500() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        {/* Error Icon */}
        <div className="mb-8">
          <ServerCrash className="w-24 h-24 text-red-400 mx-auto animate-pulse" />
        </div>
        
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <h2 className="text-2xl font-bold text-red-300 mb-4">Internal Server Error</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
          Something went wrong on our end. Our dangerous thinkers are working to fix it.
        </p>
        
        {/* Error Details */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-red-300 font-semibold mb-3">What happened?</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• A server error occurred while processing your request</li>
            <li>• This incident has been automatically logged</li>
            <li>• Our team has been notified and is investigating</li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="border border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          
          <Link 
            href="mailto:support@aimindos.com?subject=500 Error Report"
            className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Report Issue
          </Link>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            Error code: 500 | AI Mind OS | Dangerous thinking, reliable infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
