import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to disable preview mode
 * 
 * @param request The Next.js request
 * @returns The Next.js response
 */
export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get('redirect') || '/';
  
  // Disable preview mode by clearing cookies
  const response = NextResponse.redirect(new URL(redirect, request.url));
  
  // Clear preview cookies
  response.cookies.delete('__next_preview_data');
  response.cookies.delete('__prerender_bypass');
  
  return response;
}
