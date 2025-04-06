import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { getArticleBySlug, getStandaloneArticles } from '@/lib/content'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import fs from 'fs'
import path from 'path'

interface ArticlePageProps {
  params: {
    articleSlug: string
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
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

  return articles.map((article) => ({
    articleSlug: article.slug,
  }))
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const { article } = await getArticleBySlug(params.articleSlug)

    // Get the file path for the MDX file
    const filePath = path.join(
      process.cwd(),
      'src/app/content/articles',
      `${params.articleSlug}.mdx`,
    )

    // Read the MDX file content
    const fileContent = fs.readFileSync(filePath, 'utf8')

    // The MDX file now contains only the Markdown content
    const content = fileContent

    return (
      <ArticleLayout article={article}>
         <div className="article-content">
           <MarkdownRenderer content={content} />
         </div>
      </ArticleLayout>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}
