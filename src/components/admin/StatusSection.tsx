import { ArticleWithSlug, Series } from '@/lib/types';
import { SocialMediaIndicator } from './SocialMediaIndicator';
import Link from 'next/link';

interface StatusSectionProps {
  title: string;
  articles: ArticleWithSlug[];
  series: Series[];
}

export function StatusSection({ title, articles, series }: StatusSectionProps) {
  if (articles.length === 0 && series.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {series.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Series</h3>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Publish Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Social</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {series.map(s => (
                  <tr key={s.slug}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/series/${s.slug}`} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.publishDate || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.articles.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SocialMediaIndicator
                        shareOnLinkedin={s.shareOnLinkedin}
                        shareOnTwitter={s.shareOnTwitter}
                        shareOnFacebook={s.shareOnFacebook}
                        shareOnDevto={s.shareOnDevto}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/admin/series/${s.slug}/edit`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {articles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Articles</h3>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Series</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Publish Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Social</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {articles.map(article => (
                  <tr key={article.slug}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={article.seriesSlug
                          ? `/admin/series/${article.seriesSlug}/articles/${article.slug}`
                          : `/admin/articles/${article.slug}`
                        }
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.seriesSlug ? (
                        <Link href={`/admin/series/${article.seriesSlug}`} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300">
                          {article.seriesSlug}
                        </Link>
                      ) : (
                        'Standalone'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.publishDate || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SocialMediaIndicator
                        shareOnLinkedin={article.shareOnLinkedin}
                        shareOnTwitter={article.shareOnTwitter}
                        shareOnFacebook={article.shareOnFacebook}
                        shareOnDevto={article.shareOnDevto}
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={article.seriesSlug
                          ? `/admin/series/${article.seriesSlug}/articles/${article.slug}/edit`
                          : `/admin/articles/${article.slug}/edit`
                        }
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
