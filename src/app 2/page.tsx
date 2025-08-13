import Link from 'next/link';

export default function Home() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',textAlign:'center',padding:'40px'}}>
      <div>
        <nav style={{position:'absolute',top:'20px',right:'20px',display:'flex',gap:'20px'}}>
          <Link href="/intelligence" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Intelligence</Link>
          <Link href="/leaderboard" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Leaderboard</Link>
          <Link href="/analytics" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Analytics</Link>
          <Link href="/submit-intel" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Submit</Link>
          <Link href="/pricing" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Pricing</Link>
          <Link href="/login" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Login</Link>
        </nav>
        
        <h1 style={{fontSize:48,margin:0}}>AI MIND OS</h1>
        <p style={{opacity:.85,margin:'12px 0 28px'}}>The Operating System for Dangerous Thinkers.</p>
        <Link href="/waitlist" style={{background:'#fff',color:'#000',padding:'12px 18px',borderRadius:8,fontWeight:700,textDecoration:'none'}}>Join the Waitlist</Link>
        
        <div style={{marginTop: 40, opacity: 0.6, fontSize: 14}}>
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: 12}}>
            <Link href="/privacy" style={{color:'#fff',opacity:.6,textDecoration:'none'}}>Privacy</Link>
            <Link href="/terms" style={{color:'#fff',opacity:.6,textDecoration:'none'}}>Terms</Link>
          </div>
          <p style={{margin: 0}}>© {new Date().getFullYear()} Brandy Pruitt — Founder & CEO</p>
        </div>
      </div>
    </main>
  );
}
