import Link from 'next/link';

// Updated: Removed 1-on-1 sessions, replaced with AI Personal Learning Assistant
export default function Pricing() {
  const plans = [
    {
      name: "Thinker",
      price: "$9",
      period: "/month",
      features: [
        "Daily mind exercises",
        "Basic analytics",
        "Community access",
        "Mobile app"
      ]
    },
    {
      name: "Dangerous Thinker",
      price: "$29",
      period: "/month",
      popular: true,
      features: [
        "Everything in Thinker",
        "Advanced AI coaching",
        "Custom workflows",
        "Priority support",
        "Referral rewards"
      ]
    },
    {
      name: "Mind Master",
      price: "$99",
      period: "/month",
      features: [
        "Everything in Dangerous Thinker",
        "AI Personal Learning Assistant",
        "White-label access",
        "API access",
        "Custom integrations"
      ]
    }
  ];

  return (
    <main style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',padding:'40px 20px'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto',textAlign:'center'}}>
        <h1 style={{fontSize:48,margin:'0 0 12px'}}>Choose Your Path</h1>
        <p style={{opacity:.85,margin:'12px 0 48px',fontSize:18}}>Unlock the full potential of your dangerous thinking.</p>
        
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'24px',maxWidth:'900px',margin:'0 auto'}}>
          {plans.map((plan, index) => (
            <div 
              key={index}
              style={{
                background: plan.popular ? '#222' : '#111',
                border: plan.popular ? '2px solid #fff' : '1px solid #333',
                borderRadius:'12px',
                padding:'32px 24px',
                position:'relative'
              }}
            >
              {plan.popular && (
                <div style={{
                  position:'absolute',
                  top:'-12px',
                  left:'50%',
                  transform:'translateX(-50%)',
                  background:'#fff',
                  color:'#000',
                  padding:'4px 16px',
                  borderRadius:'20px',
                  fontSize:'12px',
                  fontWeight:700
                }}>
                  MOST POPULAR
                </div>
              )}
              
              <h3 style={{fontSize:24,margin:'0 0 8px'}}>{plan.name}</h3>
              <div style={{fontSize:36,fontWeight:700,margin:'16px 0'}}>
                {plan.price}<span style={{fontSize:16,opacity:.7}}>{plan.period}</span>
              </div>
              
              <ul style={{listStyle:'none',padding:0,margin:'24px 0',textAlign:'left'}}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{padding:'8px 0',opacity:.9}}>✓ {feature}</li>
                ))}
              </ul>
              
              <button 
                style={{
                  background: plan.popular ? '#fff' : 'transparent',
                  color: plan.popular ? '#000' : '#fff',
                  border: plan.popular ? 'none' : '1px solid #fff',
                  padding:'12px 24px',
                  borderRadius:'8px',
                  fontWeight:700,
                  fontSize:'16px',
                  cursor:'pointer',
                  width:'100%',
                  marginTop:'16px'
                }}
              >
                Continue with {plan.name}
              </button>
            </div>
          ))}
        </div>
        
        <p style={{opacity:.6,marginTop:48,fontSize:14}}>
          <Link href="/" style={{color:'#fff',opacity:.8}}>← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
