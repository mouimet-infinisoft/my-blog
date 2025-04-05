import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { getArticleBySlug, getStandaloneArticles } from '@/lib/content'

interface ArticlePageProps {
  params: {
    articleSlug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { article } = await getArticleBySlug(params.articleSlug)

    return {
      title: article.title,
      description: article.description,
      openGraph: {
        title: article.title,
        description: article.description,
        type: 'article',
        publishedTime: article.date,
        authors: [article.author],
        tags: article.tags,
      },
    }
  } catch (error) {
    return {
      title: 'Article Not Found',
    }
  }
}

export async function generateStaticParams() {
  const articles = await getStandaloneArticles()

  return articles.map(article => ({
    articleSlug: article.slug,
  }))
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const { article } = await getArticleBySlug(params.articleSlug)

    // Import the MDX content directly
    const MDXModule = await import(
      `@/app/content/standalone/${params.articleSlug}.mdx`
    )

    // Get the MDX component
    const MDXContent = MDXModule.default

    return (
      <ArticleLayout article={article}>
        <div className="article-content">
          <MDXContent />
        </div>
      </ArticleLayout>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}
