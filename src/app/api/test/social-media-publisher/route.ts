import { NextResponse } from 'next/server';
import { GET as cronSocialMediaPublisher } from '@/app/api/cron/social-media-publisher/route';

// This is a test endpoint to manually trigger the social media publisher
// It should only be accessible in development mode
export async function GET(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }

  // Create a mock request with the secret parameter
  const url = new URL(request.url);
  url.searchParams.set('secret', process.env.CRON_SECRET || 'your-cron-secret-here');
  
  const mockRequest = new Request(url.toString(), {
    method: 'GET',
    headers: request.headers
  });

  // Call the actual cron job handler
  return cronSocialMediaPublisher(mockRequest);
}
