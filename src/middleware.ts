import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const hostname = request.headers.get('host') || '';
    
    // Only allow localhost or 127.0.0.1
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}

export const config = {
  matcher: '/admin/:path*',
};
