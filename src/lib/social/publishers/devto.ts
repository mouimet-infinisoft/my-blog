import { ArticleWithSlug, Series } from '@/lib/types';
import { generateDevToContent } from '../templates';

/**
 * Publish content to DEV.to
 */
export async function publishToDevTo(content: ArticleWithSlug | Series): Promise<boolean> {
  const isArticle = 'seriesSlug' in content || (!('articles' in content));
  const devToContent = generateDevToContent(content, isArticle);
  const canonicalUrl = isArticle 
    ? `${process.env.SITE_URL}/articles/${content.slug}`
    : `${process.env.SITE_URL}/series/${content.slug}`;
  
  const postData = {
    article: {
      title: devToContent.title,
      body_markdown: devToContent.body,
      published: true,
      tags: devToContent.tags,
      canonical_url: canonicalUrl
    }
  };
  
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV.to post data (development mode):', JSON.stringify(postData, null, 2));
      return true;
    }
    
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEVTO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DEV.to API error: ${JSON.stringify(errorData)}`);
    }
    
    return true;
  } catch (error) {
    console.error('DEV.to publishing error:', error);
    throw error;
  }
}
