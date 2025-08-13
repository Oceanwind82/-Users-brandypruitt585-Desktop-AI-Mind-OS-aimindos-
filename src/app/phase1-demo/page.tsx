import Link from 'next/link';

export default function Phase1Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🚀 Phase 1: Core &ldquo;Wow&rdquo; Features
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Experience the future of creative AI interaction
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 3D Spatial Interface */}
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
            <div className="text-4xl mb-4">🌌</div>
            <h3 className="text-2xl font-bold mb-3">3D Spatial Interface</h3>
            <p className="text-gray-300 mb-4">
              Tools float in a 3D workspace like holographic panels. Drag, arrange, and interact in three dimensions.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>✨ Floating holographic panels</div>
              <div>🎮 Physics-based interactions</div>
              <div>📐 Grid and circle arrangements</div>
              <div>🎨 Multiple camera modes</div>
            </div>
          </div>

          {/* Dynamic Scene Backdrops */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold mb-3">Dynamic Scene Backdrops</h3>
            <p className="text-gray-300 mb-4">
              Background changes based on your activity and mood. AI-powered scene suggestions.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>🌃 Cyberpunk cityscapes</div>
              <div>🌿 Serene nature scenes</div>
              <div>🚀 Deep space environments</div>
              <div>📄 Paper & minimal themes</div>
            </div>
          </div>

          {/* Multi-AI Personalities */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-3">AI Crew Members</h3>
            <p className="text-gray-300 mb-4">
              5 distinct AI personalities with unique voices, expertise, and collaboration styles.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>🎨 Maya Creative - Artistic visionary</div>
              <div>📊 Alex Analyst - Data-driven strategist</div>
              <div>🤝 Sam Social - Collaboration expert</div>
              <div>🔮 Quinn Quantum - Future-focused innovator</div>
              <div>🧠 Dr. Wisdom - Patient mentor</div>
            </div>
          </div>

          {/* Predictive Speed Lanes */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 border border-pink-500/30">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3">Speed Lanes</h3>
            <p className="text-gray-300 mb-4">
              AI predicts your next 3 actions and auto-generates content in the background.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>🎯 Predictive next actions</div>
              <div>📝 Auto-draft generation</div>
              <div>🔄 Cross-tool learning</div>
              <div>⏱️ Background processing</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/workbench"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🚀 Launch Workbench
          </Link>
          
          <Link 
            href="/dashboard"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            📊 View Dashboard
          </Link>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-black/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-bold mb-4">🎮 How to Experience Phase 1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h5 className="font-semibold text-purple-400 mb-2">3D Controls (Bottom Left)</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• Toggle 3D/2D mode</li>
                <li>• Switch camera modes</li>
                <li>• Arrange panels in grid/circle</li>
                <li>• Enable physics effects</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-green-400 mb-2">Scene Controls (Top Center)</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• Change activity type</li>
                <li>• Browse scene categories</li>
                <li>• Enable auto-adaptation</li>
                <li>• AI scene suggestions</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-400 mb-2">AI Personalities (Top Right)</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• Switch between 5 AI experts</li>
                <li>• Activate Hivemind mode</li>
                <li>• Import/export personalities</li>
                <li>• View usage statistics</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-yellow-400 mb-2">Speed Lanes (Top Right)</h5>
              <ul className="space-y-1 text-gray-300">
                <li>• View predicted next actions</li>
                <li>• Enable auto-draft mode</li>
                <li>• Quick execute predictions</li>
                <li>• Background content ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 text-center">
          <h4 className="text-lg font-semibold mb-4 text-gray-400">Built with Future Tech</h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-800 px-3 py-1 rounded-full">Three.js 3D</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">React Three Fiber</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">WebGL Shaders</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">AI Prediction</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">Multi-Agent AI</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">Adaptive UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
