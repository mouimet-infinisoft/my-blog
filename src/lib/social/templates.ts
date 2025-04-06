import { ArticleWithSlug, Series } from '@/lib/types';

/**
 * Generate content for LinkedIn posts
 */
export function generateLinkedInContent(content: ArticleWithSlug | Series, isArticle: boolean): string {
  const contentType = isArticle ? 'article' : 'series';
  const title = isArticle ? (content as ArticleWithSlug).title : (content as Series).name;
  const description = content.description || '';
  
  return `📝 New ${contentType} on my blog: "${title}"

${description}

#webdevelopment #javascript #programming`;
}

/**
 * Generate content for Twitter posts (limited to 280 characters)
 */
export function generateTwitterContent(content: ArticleWithSlug | Series, isArticle: boolean): string {
  const contentType = isArticle ? 'article' : 'series';
  const title = isArticle ? (content as ArticleWithSlug).title : (content as Series).name;
  const url = isArticle 
    ? `${process.env.SITE_URL}/articles/${content.slug}`
    : `${process.env.SITE_URL}/series/${content.slug}`;
  
  // Ensure tweet is under 280 characters
  const baseText = `New ${contentType}: "${title}" ${url} #webdev #javascript`;
  if (baseText.length <= 250 && content.description) {
    return `${baseText}

${content.description.substring(0, 280 - baseText.length - 2)}`;
  }
  return baseText;
}

/**
 * Generate content for Facebook posts
 */
export function generateFacebookContent(content: ArticleWithSlug | Series, isArticle: boolean): string {
  const contentType = isArticle ? 'article' : 'series';
  const title = isArticle ? (content as ArticleWithSlug).title : (content as Series).name;
  const description = content.description || '';
  
  return `📝 New ${contentType} on my blog: "${title}"

${description}

Check it out and let me know what you think in the comments!

#webdevelopment #javascript #programming`;
}

/**
 * Generate content for DEV.to posts
 */
export function generateDevToContent(content: ArticleWithSlug | Series, isArticle: boolean): {
  title: string;
  body: string;
  tags: string[];
} {
  const contentType = isArticle ? 'article' : 'series';
  const title = isArticle ? (content as ArticleWithSlug).title : (content as Series).name;
  const description = content.description || '';
  const canonicalUrl = isArticle 
    ? `${process.env.SITE_URL}/articles/${content.slug}`
    : `${process.env.SITE_URL}/series/${content.slug}`;
  
  // Extract tags from the content or use default tags
  const contentTags = isArticle ? (content as ArticleWithSlug).tags || [] : [];
  const defaultTags = ['webdev', 'javascript', 'programming'];
  const tags = contentTags.length > 0 ? contentTags.slice(0, 4) : defaultTags;
  
  // Create the body content
  const body = `
# ${title}

${description}

${isArticle ? (content as ArticleWithSlug).content || '' : ''}

---

*This article was originally published on [my blog](${canonicalUrl}). Follow me there for more content!*
`;

  return {
    title,
    body,
    tags
  };
}
