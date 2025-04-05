import { ArticleStatus } from './types';
import { isProduction } from './environment';

/**
 * Determines if content should be visible based on its status and publish date
 * 
 * @param status The publication status of the content
 * @param publishDate The scheduled publication date (ISO 8601 format)
 * @returns Whether the content should be visible
 */
export function isContentVisible(status?: ArticleStatus, publishDate?: string): boolean {
  // In development, show all content
  if (!isProduction()) return true;
  
  // If no status is provided, default to not visible in production
  if (!status) return false;
  
  // Published and featured content is always visible
  if (status === 'published' || status === 'featured') return true;
  
  // Scheduled content is visible if the publish date has passed
  if (status === 'scheduled' && publishDate) {
    const now = new Date();
    const pubDate = new Date(publishDate);
    return now >= pubDate;
  }
  
  // Draft and ready content is not visible in production
  return false;
}
