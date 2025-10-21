import { NextResponse } from 'next/server';

const AUTH_WHITELIST = new Set(['/login', '/register', '/_next', '/favicon.ico', '/api']);

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if ([...AUTH_WHITELIST].some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const token = request.cookies.get('token')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
