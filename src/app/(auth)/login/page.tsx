import Link from 'next/link';

export default function Login() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',textAlign:'center',padding:'40px'}}>
      <div style={{maxWidth:'400px',width:'100%'}}>
        <h1 style={{fontSize:36,margin:'0 0 12px'}}>Welcome Back</h1>
        <p style={{opacity:.85,margin:'12px 0 28px'}}>Enter your email to receive a magic link.</p>
        
        <form style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            required
            style={{
              padding:'16px',
              borderRadius:'8px',
              border:'1px solid #333',
              fontSize:'16px',
              background:'#111',
              color:'#fff'
            }}
          />
          <button 
            type="submit"
            style={{
              background:'#fff',
              color:'#000',
              padding:'16px',
              borderRadius:'8px',
              fontWeight:700,
              border:'none',
              fontSize:'16px',
              cursor:'pointer'
            }}
          >
            Send Magic Link
          </button>
        </form>
        
        <p style={{opacity:.6,marginTop:24,fontSize:14}}>
          Don&apos;t have an account? <Link href="/waitlist" style={{color:'#fff',opacity:.8}}>Join the waitlist</Link>
        </p>
        
        <p style={{opacity:.6,marginTop:16,fontSize:14}}>
          <Link href="/" style={{color:'#fff',opacity:.8}}>← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
