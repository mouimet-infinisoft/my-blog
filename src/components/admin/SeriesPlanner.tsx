'use client';

import { useState } from 'react';
import { Series, ArticleWithSlug, ReleaseSchedule } from '@/lib/types';
import { calculateArticlePublishDates } from '@/lib/admin/scheduleCalculator';
import { useRouter } from 'next/navigation';

interface SeriesPlannerProps {
  series: Series;
  onSave: (schedule: ReleaseSchedule, applyToArticles: boolean) => Promise<void>;
}

export function SeriesPlanner({ series, onSave }: SeriesPlannerProps) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ReleaseSchedule>({
    frequency: series.releaseSchedule?.frequency || 'weekly',
    startDate: series.releaseSchedule?.startDate || ''
  });
  const [applyToArticles, setApplyToArticles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewArticles, setPreviewArticles] = useState<ArticleWithSlug[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreview = () => {
    if (!schedule.startDate) {
      setError('Start date is required for preview');
      return;
    }
    
    const updatedArticles = calculateArticlePublishDates(
      { ...series, releaseSchedule: schedule },
      series.articles
    );
    
    setPreviewArticles(updatedArticles);
    setShowPreview(true);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schedule.startDate) {
      setError('Start date is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await onSave(schedule, applyToArticles);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium">Series Release Schedule</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Set up a release schedule for this series and its articles
          </p>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 dark:bg-green-900/20">
              <p className="text-green-700 dark:text-green-400">Release schedule updated successfully!</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Release Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={schedule.frequency}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly (Every 2 weeks)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={schedule.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                The date when the first article will be published
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="applyToArticles"
                checked={applyToArticles}
                onChange={e => setApplyToArticles(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-zinc-300 rounded dark:border-zinc-700"
              />
              <label htmlFor="applyToArticles" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                Apply schedule to all articles in this series
              </label>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-zinc-300 shadow-sm text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Preview Schedule
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {showPreview && (
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium">Preview Release Schedule</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Close
            </button>
          </div>
          
          <div className="border-t border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Publish Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {previewArticles.map((article, index) => (
                  <tr key={article.slug}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {article.order || index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {article.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {article.publishDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
