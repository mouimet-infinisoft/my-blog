import { Series, ArticleWithSlug, ReleaseSchedule } from '@/lib/types';
import { updateSeriesMetadata, updateArticleMetadata } from './fileSystem';
import { calculateArticlePublishDates } from './scheduleCalculator';
import { getAllSeries, getArticlesBySeries } from '@/lib/content';

/**
 * Updates a series schedule and optionally applies the schedule to its articles
 * 
 * @param seriesSlug The slug of the series to update
 * @param schedule The new release schedule
 * @param applyToArticles Whether to update article publish dates based on the schedule
 * @returns A promise that resolves when the update is complete
 */
export async function updateSeriesSchedule(
  seriesSlug: string,
  schedule: ReleaseSchedule,
  applyToArticles: boolean
): Promise<void> {
  // Update series schedule
  await updateSeriesMetadata(seriesSlug, {
    releaseSchedule: schedule,
    status: 'scheduled'
  });
  
  if (applyToArticles) {
    // Get the updated series
    const allSeries = await getAllSeries();
    const series = allSeries.find(s => s.slug === seriesSlug);
    
    if (!series) {
      throw new Error(`Series not found: ${seriesSlug}`);
    }
    
    // Get all articles in the series
    const articles = await getArticlesBySeries(seriesSlug);
    
    // Calculate new publish dates
    const updatedArticles = calculateArticlePublishDates(series, articles);
    
    // Update each article
    for (const article of updatedArticles) {
      await updateArticleMetadata(seriesSlug, article.slug, {
        status: article.status,
        publishDate: article.publishDate
      });
    }
  }
}
