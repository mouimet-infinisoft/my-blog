import { getArticleBySlug } from '@/lib/content';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { updateArticleMetadata } from '@/lib/admin/fileSystem';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata = {
  title: 'Edit Article',
};

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const { article } = await getArticleBySlug(slug);
    
    if (!article) {
      return notFound();
    }
    
    // Server action to save article changes
    async function saveArticle(data: any) {
      'use server';
      
      await updateArticleMetadata(null, slug, data);
    }
    
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Article: {article.title}</h1>
        <ArticleForm article={article} onSave={saveArticle} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
