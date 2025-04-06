import { Series, ArticleWithSlug, ArticleStatus } from '@/lib/types';

/**
 * Calculates publish dates for articles in a series based on the series release schedule
 * 
 * @param series The series containing the release schedule
 * @param articles The articles to calculate publish dates for
 * @returns The articles with updated publish dates and status
 */
export function calculateArticlePublishDates(
  series: Series,
  articles: ArticleWithSlug[]
): ArticleWithSlug[] {
  if (!series.releaseSchedule?.startDate || !series.releaseSchedule?.frequency) {
    return articles;
  }

  const { frequency, startDate } = series.releaseSchedule;
  const start = new Date(startDate);
  
  // Sort articles by order
  const sortedArticles = [...articles].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return sortedArticles.map((article, index) => {
    const publishDate = new Date(start);
    
    switch (frequency) {
      case 'weekly':
        publishDate.setDate(start.getDate() + (index * 7));
        break;
      case 'biweekly':
        publishDate.setDate(start.getDate() + (index * 14));
        break;
      case 'monthly':
        publishDate.setMonth(start.getMonth() + index);
        break;
    }
    
    return {
      ...article,
      status: 'scheduled' as ArticleStatus,
      publishDate: publishDate.toISOString().split('T')[0]
    };
  });
}
