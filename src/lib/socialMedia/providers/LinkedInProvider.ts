import { Article, SocialMediaProvider } from '../types';

export class LinkedInProvider implements SocialMediaProvider {
  name = 'linkedin';

  constructor(
    private accessToken: string,
    private userId: string
  ) {
    if (!accessToken || !userId) {
      throw new Error('LinkedIn access token and user ID are required');
    }
  }

  async post(article: Article) {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/ugcPosts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:person:${this.userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: `${article.description}\n\nRead more: ${article.url}`,
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: article.url,
                  title: {
                    text: article.title,
                  },
                  description: {
                    text: article.description,
                  },
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        postUrl: `https://www.linkedin.com/feed/update/${data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}