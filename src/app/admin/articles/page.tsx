import { getAllArticles } from '@/lib/content';
import Link from 'next/link';

export const metadata = {
  title: 'All Articles',
};

export default async function ArticlesListPage() {
  const articles = await getAllArticles();

  // Group articles by status
  const groupedArticles = {
    draft: articles.filter(a => a.status === 'draft'),
    ready: articles.filter(a => a.status === 'ready'),
    scheduled: articles.filter(a => a.status === 'scheduled'),
    published: articles.filter(a => a.status === 'published'),
    featured: articles.filter(a => a.status === 'featured'),
    undefined: articles.filter(a => !a.status),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Articles</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          New Article
        </Link>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedArticles).map(([status, articles]) => {
          if (articles.length === 0) return null;

          return (
            <div key={status} className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium capitalize">{status === 'undefined' ? 'Unspecified Status' : status} Articles</h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {articles.length} articles
                </span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {articles.map(article => (
                    <li key={article.slug} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium">
                            <Link
                              href={article.seriesSlug
                                ? `/admin/series/${article.seriesSlug}/articles/${article.slug}`
                                : `/admin/articles/${article.slug}`
                              }
                              className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {article.seriesSlug
                              ? <span>Series: <Link href={`/admin/series/${article.seriesSlug}`} className="hover:underline">{article.seriesSlug}</Link> • </span>
                              : <span>Standalone • </span>
                            }
                            Publish Date: {article.publishDate || 'Not set'}
                          </p>
                        </div>
                        <Link
                          href={article.seriesSlug
                            ? `/admin/series/${article.seriesSlug}/articles/${article.slug}/edit`
                            : `/admin/articles/${article.slug}/edit`
                          }
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
