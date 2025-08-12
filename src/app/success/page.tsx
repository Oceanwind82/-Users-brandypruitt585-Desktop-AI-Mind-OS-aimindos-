'use client';

import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
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
