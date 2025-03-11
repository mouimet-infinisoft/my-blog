import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { SocialMediaManager } from '@/lib/socialMedia/SocialMediaManager';
import { extractArticleContent } from '@/lib/socialMedia/utils';

export async function POST(req: Request) {
  try {
    // Check for admin API key
    const headersList = headers();
    const apiKey = headersList.get('x-api-key');
    
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return new NextResponse('Article URL is required', { status: 400 });
    }

    const article = await extractArticleContent(url);
    if (!article) {
      return new NextResponse('Failed to extract article content', { status: 400 });
    }

    const manager = new SocialMediaManager({
      devTo: {
        apiKey: process.env.DEVTO_API_KEY || '',
      },
      linkedin: {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
        userId: process.env.LINKEDIN_USER_ID || '',
      },
    });

    const result = await manager.crossPost(article);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in manual cross-post:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}