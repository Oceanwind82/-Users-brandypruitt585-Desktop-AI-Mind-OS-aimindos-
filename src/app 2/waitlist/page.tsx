'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('🎉 Welcome to the revolution! Check your email for updates.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',textAlign:'center',padding:'40px'}}>
      <div style={{maxWidth:'500px',width:'100%'}}>
        <h1 style={{fontSize:36,margin:'0 0 12px'}}>Join the Waitlist</h1>
        <p style={{opacity:.85,margin:'12px 0 28px'}}>Be among the first to experience the Operating System for Dangerous Thinkers.</p>
        
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px',maxWidth:'400px',margin:'0 auto'}}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email" 
            required
            disabled={status === 'loading'}
            style={{
              padding:'12px 16px',
              borderRadius:'8px',
              border:'none',
              fontSize:'16px',
              background:'#222',
              color:'#fff',
              opacity: status === 'loading' ? 0.7 : 1
            }}
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: status === 'loading' ? '#666' : '#fff',
              color:'#000',
              padding:'12px 18px',
              borderRadius:'8px',
              fontWeight:700,
              border:'none',
              fontSize:'16px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '20px',
            color: status === 'success' ? '#4ade80' : '#ef4444',
            fontSize: '14px'
          }}>
            {message}
          </p>
        )}
        
        <p style={{opacity:.6,marginTop:24,fontSize:14}}>
          <Link href="/" style={{color:'#fff',opacity:.8}}>← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
