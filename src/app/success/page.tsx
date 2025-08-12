'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Suspense fallback={
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
