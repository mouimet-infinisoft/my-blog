import { NewArticleForm } from '@/components/admin/NewArticleForm';
import { createStandaloneArticle } from '@/lib/admin/fileSystem';
import Link from 'next/link';

export const metadata = {
  title: 'Create New Article',
};

export default function NewArticlePage() {
  // Server action to create a new article
  async function saveArticle(data: any) {
    'use server';
    
    const { title, content, ...metadata } = data;
    await createStandaloneArticle(title, content, metadata);
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Article</h1>
        <Link
          href="/admin/articles"
          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Back to Articles
        </Link>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg p-6">
        <NewArticleForm onSave={saveArticle} />
      </div>
    </div>
  );
}
