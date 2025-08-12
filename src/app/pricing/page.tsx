'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Zap, Crown, Rocket, Star, Loader2 } from 'lucide-react';

interface PlanData {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  limits: string[];
  popular?: boolean;
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState<string | null>(null);

  const plans: PlanData[] = [
    {
      id: 'explorer',
      name: "Explorer",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with dangerous thinking",
      icon: <Zap className="w-6 h-6" />,
      color: "from-gray-500 to-gray-600",
      features: [
        "3 AI workbench sessions/month",
        "Basic analytics dashboard",
        "Community access",
        "Mobile app access",
        "Email support"
      ],
      limits: [
        "Limited to 10 whiteboard exports",
        "Basic AI writing templates",
        "Standard response time"
      ]
    },
    {
      id: 'thinker',
      name: "Thinker",
      price: "$9",
      period: "/month",
      description: "For serious thinkers ready to level up",
      icon: <Star className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Unlimited AI workbench access",
        "Advanced analytics & insights",
        "All AI writing templates",
        "PNG/PDF exports",
        "Priority community access",
        "Mobile + desktop apps",
        "Email + chat support"
      ],
      limits: [
        "Up to 100 projects",
        "Standard AI model access",
        "Community-level features"
      ]
    },
    {
      id: 'dangerous',
      name: "Dangerous Thinker",
      price: "$29",
      period: "/month",
      popular: true,
      description: "The complete toolkit for breakthrough thinking",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      features: [
        "Everything in Thinker",
        "Advanced AI coaching & insights",
        "Custom workflow automation",
        "Team collaboration (up to 5)",
        "Advanced export options",
        "Priority support",
        "Referral rewards program",
        "Early access to new features"
      ],
      limits: [
        "Unlimited projects",
        "Advanced AI models",
        "Enhanced processing speed"
      ]
    },
    {
      id: 'master',
      name: "Mind Master",
      price: "$99",
      period: "/month",
      description: "Enterprise-grade platform for organizations",
      icon: <Crown className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500",
      features: [
        "Everything in Dangerous Thinker",
        "White-label platform access",
        "Custom AI model training",
        "Unlimited team members",
        "API access & integrations",
        "Custom branding & domains",
        "Dedicated account manager",
        "24/7 priority support",
        "Advanced security features"
      ],
      limits: [
        "Unlimited everything",
        "Custom AI models",
        "Enterprise SLA"
      ]
    }
  ];

    const handleCheckout = async (planId: string) => {
    // Handle free plan differently
    if (planId === 'explorer') {
      // For free plan, redirect to onboarding
      window.location.href = '/onboarding';
      return;
    }

    // For paid plans, collect email first if not already shown
    if (!showEmailInput) {
      setShowEmailInput(planId);
      return;
    }

    if (!email) return;
    
    setLoading(planId);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          email,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error('Checkout error:', error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">AI MIND OS</Link>
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Choose Your Path
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Unlock the full potential of your dangerous thinking with the right plan for your journey
          </p>
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-4 h-4" />
            All sales are final - No refunds policy
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl p-8 border transition-all hover:scale-105 ${
                plan.popular 
                  ? 'border-purple-500 bg-white/10 shadow-2xl shadow-purple-500/20' 
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}
                  <span className="text-lg text-gray-400 font-normal">{plan.period}</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-green-400 mb-3">✓ What&apos;s Included</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-400 mb-3">Limits & Details</h4>
                  <ul className="space-y-2">
                    {plan.limits.map((limit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="text-gray-600">•</span>
                        <span>{limit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {showEmailInput === plan.id ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={!email || loading === plan.id}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Continue'}
                    </button>
                    <button
                      onClick={() => setShowEmailInput(null)}
                      className="px-4 py-2 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                      : plan.id === 'explorer'
                      ? 'border border-white/30 text-white hover:bg-white/10'
                      : 'bg-white text-black hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {plan.id === 'explorer' ? 'Start Free' : `Choose ${plan.name}`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-6">Features</th>
                  <th className="text-center py-4 px-6">Explorer</th>
                  <th className="text-center py-4 px-6">Thinker</th>
                  <th className="text-center py-4 px-6 bg-purple-500/10 rounded-t-lg">Dangerous Thinker</th>
                  <th className="text-center py-4 px-6">Mind Master</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['AI Workbench Access', '3/month', 'Unlimited', 'Unlimited', 'Unlimited'],
                  ['Analytics Dashboard', 'Basic', 'Advanced', 'Advanced', 'Enterprise'],
                  ['Export Formats', 'PNG only', 'PNG, PDF', 'All formats', 'All + Custom'],
                  ['Team Members', '1', '1', '5', 'Unlimited'],
                  ['AI Models', 'Standard', 'Standard', 'Advanced', 'Custom'],
                  ['API Access', '✗', '✗', 'Limited', 'Full'],
                  ['Priority Support', '✗', 'Email', 'Email + Chat', '24/7 Dedicated'],
                  ['White Label', '✗', '✗', '✗', '✓'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="py-4 px-6 font-medium">{row[0]}</td>
                    <td className="py-4 px-6 text-center text-gray-400">{row[1]}</td>
                    <td className="py-4 px-6 text-center">{row[2]}</td>
                    <td className="py-4 px-6 text-center bg-purple-500/5">{row[3]}</td>
                    <td className="py-4 px-6 text-center">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-400 text-sm">Yes! You can change your plan at any time. Upgrades take effect immediately, downgrades at your next billing cycle.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-gray-400 text-sm">Start with Explorer free to test all features. Please note: All paid subscriptions are final with no refunds.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Do you offer discounts for students?</h3>
              <p className="text-gray-400 text-sm">Yes! Students get 50% off all plans. Contact support with your student ID for verification.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400 text-sm">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
