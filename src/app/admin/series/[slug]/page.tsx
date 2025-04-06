import { getAllSeries } from '@/lib/content';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata = {
  title: 'Series Details',
};

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const allSeries = await getAllSeries();
    const series = allSeries.find(s => s.slug === slug);
    
    if (!series) {
      return notFound();
    }
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{series.name}</h1>
          <Link
            href={`/admin/series/${slug}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Edit Series
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Series Information</h2>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{series.status || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Publish Date</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{series.publishDate || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Category</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{series.category || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Release Frequency</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                  {series.releaseSchedule?.frequency || 'Not set'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Description</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{series.description}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium">Articles in this Series</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {series.articles.length} articles
            </span>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {series.articles.map(article => (
                <li key={article.slug} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">
                        <Link
                          href={`/admin/series/${slug}/articles/${article.slug}`}
                          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Status: {article.status || 'Not set'} • 
                        Publish Date: {article.publishDate || 'Not set'}
                      </p>
                    </div>
                    <Link
                      href={`/admin/series/${slug}/articles/${article.slug}/edit`}
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
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
