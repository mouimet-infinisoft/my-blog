import { ArticleWithSlug, Series, ArticleStatus } from '@/lib/types';
import { StatusSection } from '@/components/admin/StatusSection';

interface DashboardProps {
  articles: ArticleWithSlug[];
  series: Series[];
}

function groupByStatus<T extends { status?: ArticleStatus }>(items: T[]) {
  return {
    draft: items.filter(item => item.status === 'draft'),
    ready: items.filter(item => item.status === 'ready'),
    scheduled: items.filter(item => item.status === 'scheduled'),
    published: items.filter(item => item.status === 'published'),
    featured: items.filter(item => item.status === 'featured'),
    undefined: items.filter(item => !item.status),
  };
}

export function Dashboard({ articles, series }: DashboardProps) {
  const groupedArticles = groupByStatus(articles);
  const groupedSeries = groupByStatus(series);
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Content Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Content Status Overview</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="space-y-2">
              <StatusCount label="Draft" count={groupedArticles.draft.length + groupedSeries.draft.length} />
              <StatusCount label="Ready" count={groupedArticles.ready.length + groupedSeries.ready.length} />
              <StatusCount label="Scheduled" count={groupedArticles.scheduled.length + groupedSeries.scheduled.length} />
              <StatusCount label="Published" count={groupedArticles.published.length + groupedSeries.published.length} />
              <StatusCount label="Featured" count={groupedArticles.featured.length + groupedSeries.featured.length} />
              <StatusCount label="Unspecified" count={groupedArticles.undefined.length + groupedSeries.undefined.length} />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <RecentContent articles={articles.slice(0, 5)} />
          </div>
        </div>
      </div>
      
      <StatusSection title="Draft" articles={groupedArticles.draft} series={groupedSeries.draft} />
      <StatusSection title="Ready" articles={groupedArticles.ready} series={groupedSeries.ready} />
      <StatusSection title="Scheduled" articles={groupedArticles.scheduled} series={groupedSeries.scheduled} />
      <StatusSection title="Published" articles={groupedArticles.published} series={groupedSeries.published} />
      <StatusSection title="Featured" articles={groupedArticles.featured} series={groupedSeries.featured} />
      {(groupedArticles.undefined.length > 0 || groupedSeries.undefined.length > 0) && (
        <StatusSection title="Unspecified Status" articles={groupedArticles.undefined} series={groupedSeries.undefined} />
      )}
    </div>
  );
}

function StatusCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

function RecentContent({ articles }: { articles: ArticleWithSlug[] }) {
  if (articles.length === 0) {
    return <p>No recent content</p>;
  }
  
  return (
    <ul className="space-y-2">
      {articles.map(article => (
        <li key={article.slug} className="flex justify-between">
          <span className="truncate">{article.title}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {article.status || 'Unspecified'}
          </span>
        </li>
      ))}
    </ul>
  );
}
