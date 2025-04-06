import { getArticleBySlug, getAllSeries } from '@/lib/content';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { updateArticleMetadata } from '@/lib/admin/fileSystem';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
    articleSlug: string;
  };
}

export const metadata = {
  title: 'Edit Series Article',
};

export default async function EditSeriesArticlePage({ params }: PageProps) {
  const { slug: seriesSlug, articleSlug } = params;

  try {
    const { article } = await getArticleBySlug(articleSlug, seriesSlug);
    const allSeries = await getAllSeries();
    const series = allSeries.find(s => s.slug === seriesSlug);

    if (!article) {
      return notFound();
    }

    if (!series) {
      return notFound();
    }

    // Server action to save article changes
    async function saveArticle(data: any) {
      'use server';

      await updateArticleMetadata(seriesSlug, articleSlug, data);
    }

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Article: {article.title}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Series: <a href={`/admin/series/${seriesSlug}`} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300">{seriesSlug}</a>
        </p>
        <ArticleForm article={article} series={series} onSave={saveArticle} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
