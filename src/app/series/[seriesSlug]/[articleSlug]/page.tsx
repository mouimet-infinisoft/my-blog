import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { getArticleBySlug, getAllSeries } from '@/lib/content'
import fs from 'fs'
import path from 'path'

interface ArticlePageProps {
  params: {
    seriesSlug: string
    articleSlug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { article } = await getArticleBySlug(params.articleSlug, params.seriesSlug)

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
  const series = await getAllSeries()
  const params = []

  for (const s of series) {
    for (const article of s.articles) {
      params.push({
        seriesSlug: s.slug,
        articleSlug: article.slug,
      })
    }
  }

  return params
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const { article, prevArticle, nextArticle } = await getArticleBySlug(
      params.articleSlug,
      params.seriesSlug
    )

    // Get the file path for the MDX file
    const filePath = path.join(
      process.cwd(),
      'src/app/content/series',
      params.seriesSlug,
      `${article.order.toString().padStart(2, '0')}-${params.articleSlug}.mdx`
    )

    // Read the MDX file content
    const fileContent = fs.readFileSync(filePath, 'utf8')

    // The MDX file now contains only the Markdown content
    const content = fileContent

    return (
      <ArticleLayout
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      >
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
