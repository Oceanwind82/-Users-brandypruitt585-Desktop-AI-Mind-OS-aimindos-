import Link from 'next/link';
import { ArrowRight, Brain, Zap, Users, Target } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Skip to main content for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-lg font-semibold z-50"
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-6" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">AI MIND OS</div>
          <div className="hidden md:flex gap-6">
            <Link href="/workbench" className="text-gray-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md px-2 py-1 transition-colors">Workbench</Link>
            <Link href="/intelligence" className="text-gray-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md px-2 py-1 transition-colors">Intelligence</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-md px-2 py-1 transition-colors">Pricing</Link>
            <Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" aria-hidden="true" />
            The Operating System for Dangerous Thinkers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            AI MIND OS
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your thinking with AI-powered tools for creativity, analysis, and breakthrough insights. 
            Built for entrepreneurs, researchers, and visionaries who dare to think differently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/waitlist" 
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all hover:scale-105 focus:scale-105 inline-flex items-center justify-center gap-2"
            >
              Join the Waitlist
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/workbench" 
              className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all hover:scale-105 focus:scale-105 inline-flex items-center justify-center"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Dangerous Thinkers Choose AI Mind OS</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Designed specifically for minds that challenge conventions and push boundaries
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">AI-Powered Workbench</h3>
              <p className="text-gray-400 leading-relaxed">
                Visual whiteboard, AI writing assistant, and node-based workflow builder. 
                Turn complex ideas into actionable insights.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Intelligence Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your cognitive patterns, discover thinking trends, and optimize your 
                mental performance with detailed analytics.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4">Gamified Learning</h3>
              <p className="text-gray-400 leading-relaxed">
                Level up your thinking skills with missions, achievements, and a global 
                leaderboard of fellow dangerous thinkers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Built For Visionaries</h2>
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div className="p-6">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-semibold mb-2">Entrepreneurs</h4>
              <p className="text-gray-400">Validate ideas and build innovative solutions</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">🔬</div>
              <h4 className="font-semibold mb-2">Researchers</h4>
              <p className="text-gray-400">Analyze complex data and discover patterns</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold mb-2">Creators</h4>
              <p className="text-gray-400">Transform concepts into compelling content</p>
            </div>
            <div className="p-6">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-semibold mb-2">Innovators</h4>
              <p className="text-gray-400">Push boundaries and challenge assumptions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Think Dangerously?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of visionaries already transforming their thinking with AI Mind OS
          </p>
          <Link 
            href="/waitlist" 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            Get Early Access
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} AI Mind OS by Brandy Pruitt — Founder & CEO
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
