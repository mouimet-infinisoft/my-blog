import { Article, SocialMediaProvider } from '../types';

export class DevToProvider implements SocialMediaProvider {
  name = 'dev.to';

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('Dev.to API key is required');
    }
  }

  private formatTags(tags: string[] | undefined): string[] {
    const defaultTags = ['programming', 'software'];
    let formattedTags = tags?.map(tag => 
      tag.toLowerCase()
         .split(/[\s_]+/)  // Split on spaces and underscores
         .join('-')        // Join with hyphens
         .replace(/[^a-z0-9-]/g, '') // Remove any non-alphanumeric chars except hyphens
         .replace(/-+/g, '-')  // Replace multiple hyphens with single
         .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    ) || [];
    
    // Ensure we have at least some tags but no more than 4
    formattedTags = [...new Set([...formattedTags, ...defaultTags])];
    return formattedTags.slice(0, 4);
  }

  private preprocessMarkdown(content: string): { content: string; mainImage: string } {
    // Extract cover image if present
    const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
    let mainImage = '';
    if (imgMatch) {
      mainImage = imgMatch[1];
      content = content.replace(imgMatch[0], '');
    }

    // Clean up the content
    content = content
      // Ensure proper spacing for headers
      .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')
      // Remove any references to series
      .replace(/Part \d+ of.*?Series.*?\n/g, '')
      .replace(/View full series.*?\n/g, '')
      // Fix list formatting
      .replace(/^(-|\d+\.)\s*/gm, '$1 ')
      // Normalize spacing
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return { content, mainImage };
  }

  async post(article: Article) {
    try {
      const { content, mainImage } = this.preprocessMarkdown(article.content);
      const formattedTags = this.formatTags(article.tags);

      const response = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          article: {
            title: article.title,
            body_markdown: content,
            published: true,
            main_image: mainImage || null,
            canonical_url: article.url,
            description: article.description,
            tags: formattedTags,
            organization_id: null // Remove series-related content
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Dev.to API error: ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return {
        success: true,
        postUrl: `https://dev.to/${data.username}/${data.slug}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}