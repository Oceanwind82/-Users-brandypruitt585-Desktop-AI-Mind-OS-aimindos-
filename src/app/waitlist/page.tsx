import Link from 'next/link';

export default function Waitlist() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',textAlign:'center',padding:'40px'}}>
      <div style={{maxWidth:'500px',width:'100%'}}>
        <h1 style={{fontSize:36,margin:'0 0 12px'}}>Join the Waitlist</h1>
        <p style={{opacity:.85,margin:'12px 0 28px'}}>Be among the first to experience the Operating System for Dangerous Thinkers.</p>
        
        {/* Replace this with your actual form embed */}
        <form style={{display:'flex',flexDirection:'column',gap:'16px',maxWidth:'400px',margin:'0 auto'}}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            required
            style={{
              padding:'12px 16px',
              borderRadius:'8px',
              border:'none',
              fontSize:'16px',
              background:'#222',
              color:'#fff'
            }}
          />
          <button 
            type="submit"
            style={{
              background:'#fff',
              color:'#000',
              padding:'12px 18px',
              borderRadius:'8px',
              fontWeight:700,
              border:'none',
              fontSize:'16px',
              cursor:'pointer'
            }}
          >
            Join Waitlist
          </button>
        </form>
        
        <p style={{opacity:.6,marginTop:24,fontSize:14}}>
          <Link href="/" style={{color:'#fff',opacity:.8}}>← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
