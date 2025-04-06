import { ArticleWithSlug, Series } from '@/lib/types';
import { generateFacebookContent } from '../templates';

/**
 * Publish content to Facebook
 */
export async function publishToFacebook(content: ArticleWithSlug | Series): Promise<boolean> {
  const isArticle = 'seriesSlug' in content || (!('articles' in content));
  const postText = generateFacebookContent(content, isArticle);
  const contentUrl = isArticle 
    ? `${process.env.SITE_URL}/articles/${content.slug}`
    : `${process.env.SITE_URL}/series/${content.slug}`;
  
  const postData = {
    message: postText,
    link: contentUrl
  };
  
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Facebook post data (development mode):', JSON.stringify(postData, null, 2));
      return true;
    }
    
    const response = await fetch(`https://graph.facebook.com/${process.env.FACEBOOK_PAGE_ID}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...postData,
        access_token: process.env.FACEBOOK_PAGE_TOKEN
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API error: ${JSON.stringify(errorData)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Facebook publishing error:', error);
    throw error;
  }
}
