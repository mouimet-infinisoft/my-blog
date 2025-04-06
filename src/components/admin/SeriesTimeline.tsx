'use client';

import { useMemo } from 'react';
import { Series } from '@/lib/types';
import Link from 'next/link';

interface SeriesTimelineProps {
  series: Series[];
}

export function SeriesTimeline({ series }: SeriesTimelineProps) {
  // Filter series with release schedules
  const scheduledSeries = useMemo(() => {
    return series
      .filter(s => s.releaseSchedule?.startDate && s.articles.length > 0)
      .sort((a, b) => {
        if (!a.releaseSchedule?.startDate) return 1;
        if (!b.releaseSchedule?.startDate) return -1;
        return new Date(a.releaseSchedule.startDate).getTime() - new Date(b.releaseSchedule.startDate).getTime();
      });
  }, [series]);

  if (scheduledSeries.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No series with scheduled releases found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {scheduledSeries.map(s => {
        // Calculate article publish dates based on series schedule
        const startDate = s.releaseSchedule?.startDate ? new Date(s.releaseSchedule.startDate) : null;
        const frequency = s.releaseSchedule?.frequency || 'weekly';
        
        // Sort articles by order
        const sortedArticles = [...s.articles].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        return (
          <div key={s.slug} className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  <Link 
                    href={`/admin/series/${s.slug}`}
                    className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    {s.name}
                  </Link>
                </h3>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {s.status} • {frequency} • Starts: {s.releaseSchedule?.startDate}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700"></div>
                
                {/* Timeline items */}
                <div className="space-y-6">
                  {sortedArticles.map((article, index) => {
                    // Calculate publish date based on series schedule
                    let publishDate = null;
                    if (startDate) {
                      publishDate = new Date(startDate);
                      if (frequency === 'weekly') {
                        publishDate.setDate(startDate.getDate() + (index * 7));
                      } else if (frequency === 'biweekly') {
                        publishDate.setDate(startDate.getDate() + (index * 14));
                      } else if (frequency === 'monthly') {
                        publishDate.setMonth(startDate.getMonth() + index);
                      }
                    }
                    
                    const formattedDate = publishDate 
                      ? publishDate.toISOString().split('T')[0]
                      : article.publishDate || 'Not scheduled';
                    
                    return (
                      <div key={article.slug} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/30 border-2 border-teal-500 dark:border-teal-700 flex items-center justify-center">
                          <span className="text-xs font-medium text-teal-800 dark:text-teal-200">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                <Link 
                                  href={`/admin/series/${s.slug}/articles/${article.slug}`}
                                  className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                                >
                                  {article.title}
                                </Link>
                              </h4>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {article.description}
                              </p>
                            </div>
                            <div className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-4">
                              {formattedDate}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <div className="flex space-x-2">
                              <span className={`px-2 py-0.5 rounded ${
                                article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                article.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                                'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200'
                              }`}>
                                {article.status || 'Not set'}
                              </span>
                              {article.category && (
                                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200">
                                  {article.category}
                                </span>
                              )}
                            </div>
                            <Link 
                              href={`/admin/series/${s.slug}/articles/${article.slug}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
