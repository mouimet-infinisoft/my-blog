import { getAllSeries } from '@/lib/content';
import Link from 'next/link';

export const metadata = {
  title: 'All Series',
};

export default async function SeriesListPage() {
  const series = await getAllSeries();

  // Group series by status
  const groupedSeries = {
    draft: series.filter(s => s.status === 'draft'),
    ready: series.filter(s => s.status === 'ready'),
    scheduled: series.filter(s => s.status === 'scheduled'),
    published: series.filter(s => s.status === 'published'),
    featured: series.filter(s => s.status === 'featured'),
    undefined: series.filter(s => !s.status),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Series</h1>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          New Series
        </Link>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedSeries).map(([status, seriesList]) => {
          if (seriesList.length === 0) return null;

          return (
            <div key={status} className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium capitalize">{status === 'undefined' ? 'Unspecified Status' : status} Series</h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {seriesList.length} series
                </span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {seriesList.map(s => (
                    <li key={s.slug} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">
                            <Link
                              href={`/admin/series/${s.slug}`}
                              className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                            >
                              {s.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Articles: {s.articles.length} •
                            Publish Date: {s.publishDate || 'Not set'} •
                            Frequency: {s.releaseSchedule?.frequency || 'Not set'}
                          </p>
                        </div>
                        <Link
                          href={`/admin/series/${s.slug}/edit`}
                          className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
