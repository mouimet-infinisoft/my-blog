import { ArticleWithSlug, Series } from '@/lib/types';
import { generateLinkedInContent } from '../templates';

/**
 * Publish content to LinkedIn
 */
export async function publishToLinkedIn(content: ArticleWithSlug | Series): Promise<boolean> {
  const isArticle = 'seriesSlug' in content || (!('articles' in content));
  const postText = generateLinkedInContent(content, isArticle);
  const contentUrl = isArticle 
    ? `${process.env.SITE_URL}/articles/${content.slug}`
    : `${process.env.SITE_URL}/series/${content.slug}`;
  
  const postData = {
    author: `urn:li:person:${process.env.LINKEDIN_AUTHOR_URN}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text: postText
        },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: {
              text: content.description || ""
            },
            originalUrl: contentUrl,
            title: {
              text: isArticle ? (content as ArticleWithSlug).title : (content as Series).name
            }
          }
        ]
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };
  
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('LinkedIn post data (development mode):', JSON.stringify(postData, null, 2));
      return true;
    }
    
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }
    
    return true;
  } catch (error) {
    console.error('LinkedIn publishing error:', error);
    throw error;
  }
}
