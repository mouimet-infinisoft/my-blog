import { NextResponse } from 'next/server';
import { SocialMediaManager } from '@/lib/socialMedia/SocialMediaManager';
import { extractArticleContent } from '@/lib/socialMedia/utils';

export async function POST(req: Request) {
  try {
    // Verify deployment webhook secret
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;
    const authHeader = req.headers.get('authorization');
    
    if (!webhookSecret || `Bearer ${webhookSecret}` !== authHeader) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new NextResponse('Article URL is required', { status: 400 });
    }

    // Extract article content
    const article = await extractArticleContent(url);
    if (!article) {
      return new NextResponse('Failed to extract article content', { status: 400 });
    }

    // Initialize social media manager with config from environment variables
    const manager = new SocialMediaManager({
      devTo: {
        apiKey: process.env.DEVTO_API_KEY || '',
      },
      linkedin: {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
        userId: process.env.LINKEDIN_USER_ID || '',
      },
    });

    // Cross-post to configured platforms
    const result = await manager.crossPost(article);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cross-post webhook:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}