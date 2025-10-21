import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div style={{ display:'grid', placeItems:'center', minHeight:'calc(100vh - 60px)' }}>
      <div style={{ width:360, background:'#0b0b0b', border:'1px solid rgba(212,175,55,.25)', borderRadius:12, padding:18 }}>
        <div className="logo" style={{ textAlign:'center', fontSize:22, marginBottom:12 }}>Join the Golden Library</div>
        <form method="post" action="/api/register" style={{ display:'grid', gap:12 }}>
          <div>
            <label className="gold" htmlFor="username">Username</label>
            <input className="input" id="username" name="username" placeholder="golden_reader" />
          </div>
          <div>
            <label className="gold" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="gold" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <button className="btn" type="submit">Create Account</button>
          <Link className="gold" href="/login">Back to Login</Link>
        </form>
      </div>
    </div>
  );
}
