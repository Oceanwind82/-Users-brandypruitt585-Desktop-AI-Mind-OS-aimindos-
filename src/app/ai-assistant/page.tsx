import AIAssistantChat from '@/components/AIAssistantChat';
import Link from 'next/link';

export default function AIAssistantPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          color: '#fff',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '36px',
            margin: '0 0 12px',
            fontWeight: '700'
          }}>
            🤖 AI Personal Learning Assistant
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: 0.9,
            margin: '0 0 20px'
          }}>
            Your introvert-friendly AI study buddy • Available 24/7 • No video calls ever!
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            ⭐ Exclusive to Mind Master ($99/month) subscribers
          </div>
        </div>

        {/* Feature highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            {
              icon: '🧠',
              title: 'Personalized Insights',
              desc: 'AI analyzes your amazingness scores and learning patterns'
            },
            {
              icon: '🎯',
              title: 'Smart Recommendations',
              desc: 'Get perfect lesson suggestions based on your progress'
            },
            {
              icon: '📅',
              title: 'Custom Study Plans',
              desc: 'Tailored schedules that fit your learning style'
            },
            {
              icon: '💬',
              title: 'Text-Only Chat',
              desc: 'Comfortable for introverts - no pressure, just help'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>
                {feature.title}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <AIAssistantChat />

        {/* What it knows */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '30px',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 15px', textAlign: 'center' }}>
            🧠 What Your AI Assistant Knows About You
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <strong>📊 Performance Data:</strong><br />
              • Your amazingness scores<br />
              • Lesson completion times<br />
              • Learning streaks
            </div>
            <div>
              <strong>🎯 Learning Patterns:</strong><br />
              • Topics you excel at<br />
              • Areas needing improvement<br />
              • Preferred difficulty levels
            </div>
            <div>
              <strong>⏰ Study Habits:</strong><br />
              • Best learning times<br />
              • Optimal lesson lengths<br />
              • Learning style preferences
            </div>
            <div>
              <strong>💡 AI Insights:</strong><br />
              • Personalized recommendations<br />
              • Custom study plans<br />
              • Motivation & encouragement
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
