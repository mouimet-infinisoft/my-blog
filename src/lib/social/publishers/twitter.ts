import { ArticleWithSlug, Series } from '@/lib/types';
import { generateTwitterContent } from '../templates';

/**
 * Publish content to Twitter
 */
export async function publishToTwitter(content: ArticleWithSlug | Series): Promise<boolean> {
  const isArticle = 'seriesSlug' in content || (!('articles' in content));
  const tweetText = generateTwitterContent(content, isArticle);
  
  const postData = {
    text: tweetText
  };
  
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Twitter post data (development mode):', JSON.stringify(postData, null, 2));
      return true;
    }
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Twitter publishing error:', error);
    throw error;
  }
}
