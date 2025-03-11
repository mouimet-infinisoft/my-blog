import * as cheerio from 'cheerio';
import { Article } from './types';
import fs from 'fs/promises';
import path from 'path';

function cleanMarkdown(content: string): string {
  // Remove series-related content using a compatible regex pattern
  content = content.replace(/Part \d+ of the @brainstack\/inject Series[\s\S]*?View full series →/g, '');
  
  // Clean up the content
  content = content
    // Remove HTML and MDX specific elements
    .replace(/<[^>]+>/g, '')
    .replace(/<!--.*?-->/g, '')
    // Remove duplicate title if it appears in the content
    .replace(/^#+\s*([^\n]+)(\n+\1)/g, '# $1')
    // Fix headers to ensure proper spacing and formatting
    .replace(/#{1,6}\s*([^\n]+)/g, (match, title) => `\n\n${match.trim()}\n`)
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return content;
}

export async function extractArticleContent(url: string): Promise<Article | null> {
  try {
    // Extract the article slug from the URL
    const urlObj = new URL(url);
    const slug = urlObj.pathname.split('/articles/')[1];
    
    if (!slug) {
      throw new Error('Invalid article URL');
    }

    // Construct the path to the article's index.mdx file
    const articlePath = path.join(process.cwd(), 'src/app/articles', slug, 'page.mdx');
    
    // Read the MDX file
    const content = await fs.readFile(articlePath, 'utf-8');
    
    // Extract metadata from frontmatter
    const metadataMatch = content.match(/export const metadata = ({[\s\S]*?});/);
    const metadata = metadataMatch ? eval(`(${metadataMatch[1]})`) : {};
    
    // Extract the main content (everything after the metadata)
    let mainContent = content.replace(/export const metadata[\s\S]*?;/, '').trim();
    
    // Extract title from metadata or first heading
    const title = metadata.title || mainContent.match(/^#\s+(.+)$/m)?.[1] || slug;
    
    // Extract description from metadata or first paragraph
    const description = metadata.description || mainContent.match(/\n\n([^#\n].+?)\n/)?.[1] || '';
    
    // Extract tags
    const tags = new Set<string>();
    
    // Add tags from metadata if available
    if (metadata.tags) {
      metadata.tags.forEach((tag: string) => tags.add(tag.toLowerCase()));
    }
    
    // Look for technical terms in content to use as tags
    const techTags = ['typescript', 'javascript', 'nodejs', 'react', 'nextjs', 'dependency-injection'];
    techTags.forEach(tag => {
      if (mainContent.toLowerCase().includes(tag.toLowerCase())) {
        tags.add(tag);
      }
    });

    // Clean and format the content
    const cleanedContent = cleanMarkdown(mainContent);

    if (!title || !cleanedContent) {
      throw new Error('Could not extract article content');
    }

    return {
      title,
      description: description || '',
      content: cleanedContent,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || urlObj.origin}/articles/${slug}`,
      tags: Array.from(tags),
      publishedDate: new Date(),
    };
  } catch (error) {
    console.error('Failed to extract article:', error);
    return null;
  }
}