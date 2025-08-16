import Link from 'next/link';

export default function Dashboard() {
  return (
    <main style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',padding:'40px 20px'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'48px'}}>
          <h1 style={{fontSize:32,margin:0}}>AI Mind OS Dashboard</h1>
          <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
            <span style={{opacity:.7}}>Welcome back, Dangerous Thinker</span>
            <button style={{background:'transparent',border:'1px solid #333',color:'#fff',padding:'8px 16px',borderRadius:'6px',cursor:'pointer'}}>
              Logout
            </button>
          </div>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'24px',marginBottom:'48px'}}>
          {/* Today's Lesson */}
          <div style={{background:'#111',border:'1px solid #333',borderRadius:'12px',padding:'24px'}}>
            <h2 style={{fontSize:20,margin:'0 0 16px'}}>Today&apos;s Lesson</h2>
            <div style={{background:'#222',borderRadius:'8px',padding:'20px',marginBottom:'16px'}}>
              <h3 style={{fontSize:16,margin:'0 0 8px'}}>Critical Thinking Fundamentals</h3>
              <p style={{opacity:.8,margin:'0 0 16px',fontSize:14}}>Challenge assumptions and question everything around you.</p>
              <button style={{background:'#fff',color:'#000',border:'none',padding:'8px 16px',borderRadius:'6px',fontWeight:600,cursor:'pointer'}}>
                Start Lesson
              </button>
            </div>
          </div>

          {/* Streak Counter */}
          <div style={{background:'#111',border:'1px solid #333',borderRadius:'12px',padding:'24px'}}>
            <h2 style={{fontSize:20,margin:'0 0 16px'}}>Thinking Streak</h2>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:48,fontWeight:700,margin:'16px 0'}}>7</div>
              <p style={{opacity:.8,margin:0}}>Days of dangerous thinking</p>
              <div style={{background:'#333',height:'8px',borderRadius:'4px',margin:'16px 0',overflow:'hidden'}}>
                <div style={{background:'#fff',height:'100%',width:'70%',borderRadius:'4px'}}></div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div style={{background:'#111',border:'1px solid #333',borderRadius:'12px',padding:'24px'}}>
            <h2 style={{fontSize:20,margin:'0 0 16px'}}>Share & Earn</h2>
            <p style={{opacity:.8,margin:'0 0 16px',fontSize:14}}>Invite other dangerous thinkers and earn rewards.</p>
            <div style={{display:'flex',gap:'8px'}}>
              <input 
                type="text" 
                value="aimindos.com/ref/user123"
                readOnly
                style={{
                  flex:1,
                  padding:'8px 12px',
                  background:'#222',
                  border:'1px solid #333',
                  borderRadius:'6px',
                  color:'#fff',
                  fontSize:14
                }}
              />
              <button style={{background:'#fff',color:'#000',border:'none',padding:'8px 16px',borderRadius:'6px',fontWeight:600,cursor:'pointer'}}>
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{background:'#111',border:'1px solid #333',borderRadius:'12px',padding:'24px'}}>
          <h2 style={{fontSize:20,margin:'0 0 24px'}}>Quick Actions</h2>
          <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
            <Link href="/pricing" style={{background:'#222',color:'#fff',textDecoration:'none',padding:'12px 20px',borderRadius:'8px',fontSize:14}}>
              Upgrade Plan
            </Link>
            <Link href="/profile" style={{background:'#222',color:'#fff',textDecoration:'none',padding:'12px 20px',borderRadius:'8px',fontSize:14}}>
              Edit Profile
            </Link>
            <Link href="/community" style={{background:'#222',color:'#fff',textDecoration:'none',padding:'12px 20px',borderRadius:'8px',fontSize:14}}>
              Join Community
            </Link>
            <Link href="/support" style={{background:'#222',color:'#fff',textDecoration:'none',padding:'12px 20px',borderRadius:'8px',fontSize:14}}>
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
