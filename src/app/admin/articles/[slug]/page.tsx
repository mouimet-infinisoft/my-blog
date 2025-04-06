import { getArticleBySlug } from '@/lib/content';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata = {
  title: 'Article Details',
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const { article } = await getArticleBySlug(slug);
    
    if (!article) {
      return notFound();
    }
    
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <Link
            href={`/admin/articles/${slug}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Edit Article
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Article Information</h2>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">Standalone</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{article.status || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Publish Date</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{article.publishDate || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Category</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{article.category || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tags</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                  {article.tags?.join(', ') || 'None'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Description</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{article.description}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Article Preview</h2>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-5 sm:p-6">
            <Link
              href={`/articles/${slug}`}
              className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              View article on site
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
