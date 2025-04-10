import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { getArticleBySlug, getStandaloneArticles } from '@/lib/content'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Comments } from '@/components/Comments'
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
        url: `https://blog.infinisoft.world/articles/${article.slug}`,
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
      'src/app/content/standalone',
      `${params.articleSlug}.mdx`,
    )

    // Read the MDX file content directly
    let content = ''
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8')
    } else {
      console.warn(`MDX file not found: ${filePath}`)
    }

    return (
      <ArticleLayout article={article}>
        <div className="mt-6 mb-8">
          <SocialShareButtons title={article.title} description={article.description} />
        </div>
        <div className="article-content">
          <MarkdownRenderer content={content} />
        </div>
        <Comments category="Blog Comments" path={`/articles/${article.slug}`} />
      </ArticleLayout>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}
