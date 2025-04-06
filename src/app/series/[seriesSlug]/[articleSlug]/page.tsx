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

    // Get the file path for the MDX file
    const filePath = path.join(
      process.cwd(),
      'src/app/content/series',
      params.seriesSlug,
      `${article.order.toString().padStart(2, '0')}-${params.articleSlug}.mdx`
    )

    // Read the MDX file content
    const fileContent = fs.readFileSync(filePath, 'utf8')

    // Extract the content part (after the default export)
    const contentMatch = fileContent.match(/export default \(props\) => <ArticleLayout[^>]*>([\s\S]*)/)
    let content = ''

    if (contentMatch) {
      content = contentMatch[1].replace(/<\/ArticleLayout>\s*$/, '')
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
