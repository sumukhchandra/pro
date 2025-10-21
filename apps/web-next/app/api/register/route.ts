import { NextResponse } from 'next/server';

export async function POST(request: Request){
  const form = await request.formData();
  const email = String(form.get('email')||'');
  const password = String(form.get('password')||'');
  const username = String(form.get('username')||'');
  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  const res = await fetch(`${api}/auth/register`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password, username }) });
  if (!res.ok) return NextResponse.redirect(new URL('/register', request.url));
  const login = await fetch(`${api}/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await login.json();
  const html = `<!doctype html><html><body style="background:#111;color:#FFD700;font-family:sans-serif;display:grid;place-items:center;height:100vh;">Creating your account…<script>localStorage.setItem('token', ${JSON.stringify(data.token)});location.href='/'</script></body></html>`;
  const resp = new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  resp.cookies.set('token', data.token, { httpOnly: true, sameSite: 'lax', path: '/' });
  return resp;
}
