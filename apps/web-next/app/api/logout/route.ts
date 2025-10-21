import { NextResponse } from 'next/server';

export async function POST(request: Request){
  const resp = NextResponse.redirect(new URL('/login', request.url));
  resp.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' });
  return resp;
}
