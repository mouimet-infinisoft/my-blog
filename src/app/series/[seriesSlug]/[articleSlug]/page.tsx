import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Comments } from '@/components/Comments'
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
        url: `https://blog.infinisoft.world/series/${params.seriesSlug}/${article.slug}`,
        images: [
          {
            url: article.coverImage || 'https://blog.infinisoft.world/og-image.jpg',
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.description,
        images: [article.coverImage || 'https://blog.infinisoft.world/og-image.jpg'],
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

    // Find the MDX file for this article
    const seriesPath = path.join(
      process.cwd(),
      'src/app/content/series',
      params.seriesSlug
    )

    // Find the MDX file with the article slug
    const files = fs.readdirSync(seriesPath)
      .filter(file => file.endsWith('.mdx') && file.includes(params.articleSlug))

    let content = ''
    if (files.length > 0) {
      const filePath = path.join(seriesPath, files[0])
      content = fs.readFileSync(filePath, 'utf8')
    } else {
      console.warn(`MDX file not found for article: ${params.articleSlug} in series: ${params.seriesSlug}`)
    }

    return (
      <ArticleLayout
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      >
        <div className="mt-6 mb-8">
          <SocialShareButtons title={article.title} description={article.description} />
        </div>
        <div className="article-content">
          <MarkdownRenderer content={content} />
        </div>
        <Comments category="Blog Comments" path={`/series/${params.seriesSlug}/${article.slug}`} />
      </ArticleLayout>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}
