'use client';

import { useState } from 'react';
import { CreditCard, Download, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 'cus_placeholder', // This would come from user auth
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Billing portal error:', error);
        return;
      }

      // Redirect to Stripe billing portal
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Billing & Account</h1>
            <p className="text-gray-300">Manage your subscription and billing information</p>
          </div>

          {/* Current Plan */}
          <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Creator Plan</h2>
                <p className="text-gray-300 mb-4">Perfect for content creators and thought leaders</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>$29/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Next billing: Jan 15, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Manage Billing</h3>
                  <p className="text-gray-400 text-sm">Update payment method, view invoices</p>
                </div>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Loading...' : 'Open Billing Portal'}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Download Invoice</h3>
                  <p className="text-gray-400 text-sm">Get your latest invoice as PDF</p>
                </div>
              </div>
              <button className="w-full border border-white/30 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Download Latest
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8 mb-8">
            <h3 className="text-white font-semibold mb-6">Usage This Month</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-white">2,847</div>
                <div className="text-sm text-gray-400">AI Interactions</div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">60% of 5,000 limit</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-gray-400">Documents Created</div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '31%' }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">31% of 500 limit</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-sm text-gray-400">Workspaces</div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">89% of 100 limit</div>
              </div>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="bg-white/5 backdrop-blur border border-white/20 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold">Want to upgrade or downgrade?</h3>
              <Link
                href="/pricing"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                View all plans
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            
            <p className="text-gray-400 text-sm">
              Changes to your plan will be prorated and take effect immediately. 
              You can always upgrade or downgrade through the billing portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
