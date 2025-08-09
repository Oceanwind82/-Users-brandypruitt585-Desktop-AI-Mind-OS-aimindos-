import Link from 'next/link';

export default function Home() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',textAlign:'center',padding:'40px'}}>
      <div>
        <nav style={{position:'absolute',top:'20px',right:'20px',display:'flex',gap:'20px'}}>
          <Link href="/pricing" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Pricing</Link>
          <Link href="/login" style={{color:'#fff',opacity:.8,textDecoration:'none'}}>Login</Link>
        </nav>
        
        <h1 style={{fontSize:48,margin:0}}>AI MIND OS</h1>
        <p style={{opacity:.85,margin:'12px 0 28px'}}>The Operating System for Dangerous Thinkers.</p>
        <Link href="/waitlist" style={{background:'#fff',color:'#000',padding:'12px 18px',borderRadius:8,fontWeight:700,textDecoration:'none'}}>Join the Waitlist</Link>
        <p style={{opacity:.6,marginTop:18,fontSize:14}}>© {new Date().getFullYear()} Brandy Pruitt — Founder & CEO</p>
      </div>
    </main>
  );
}
