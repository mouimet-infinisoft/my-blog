import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to enable preview mode
 * 
 * @param request The Next.js request
 * @returns The Next.js response
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const redirect = searchParams.get('redirect') || '/';
  
  // Check the secret (use a secure environment variable in production)
  // For development, we'll use a simple secret
  const previewSecret = process.env.PREVIEW_SECRET || 'development-preview-secret';
  
  if (secret !== previewSecret) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // Enable preview mode by setting a cookie
  const response = NextResponse.redirect(new URL(redirect, request.url));
  
  // Set preview data cookie
  response.cookies.set('__next_preview_data', JSON.stringify({ preview: true }), {
    maxAge: 60 * 60, // 1 hour
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  // Set preview mode cookie
  response.cookies.set('__prerender_bypass', process.env.PREVIEW_SECRET || 'development-preview-secret', {
    maxAge: 60 * 60, // 1 hour
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}
