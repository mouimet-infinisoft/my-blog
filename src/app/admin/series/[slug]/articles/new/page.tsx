import { getAllSeries } from '@/lib/content';
import { NewSeriesArticleForm } from '@/components/admin/NewSeriesArticleForm';
import { createSeriesArticle } from '@/lib/admin/fileSystem';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata = {
  title: 'Create New Series Article',
};

export default async function NewSeriesArticlePage({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const allSeries = await getAllSeries();
    const series = allSeries.find(s => s.slug === slug);
    
    if (!series) {
      return notFound();
    }
    
    // Server action to create a new article in the series
    async function saveArticle(data: any) {
      'use server';
      
      const { title, content, order, ...metadata } = data;
      await createSeriesArticle(slug, title, content, order, metadata);
    }
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Article in Series</h1>
          <Link
            href={`/admin/series/${slug}`}
            className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Back to Series
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg mb-6 p-4">
          <h2 className="text-lg font-medium">Series: {series.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {series.description}
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg p-6">
          <NewSeriesArticleForm series={series} onSave={saveArticle} />
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
