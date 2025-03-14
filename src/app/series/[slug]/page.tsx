import { getArticlesBySeries } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Card } from '@/components/Card'
import { MotionCard } from '@/components/ui/MotionCard'
import { Calendar, ChevronRight, ArrowLeft } from '@/components/ui/icons'
import { Button } from '@/components/Button'
import { BlogSeries } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

function ArticleCard({ article, index }: { article: any; index: number }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <time dateTime={article.date} className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(article.date)}
          </time>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
            Part {article.series?.order || index + 1}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-teal-500">
          <a href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-zinc-600 dark:text-zinc-400">
          {article.description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" className="p-0 h-auto font-semibold">
            Read article
          </Button>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  )
}

function transformSeriesToBlogSeries(series: any): BlogSeries {
  return {
    slug: series.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: series.name,
    description: series.description,
    coverImage: series.coverImage,
    category: series.category || 'Development',
    articles: series.articles,
    totalArticles: series.articles.length,
    author: series.author || series.articles[0]?.author || 'Unknown',
    date: series.date || series.articles[0]?.date || new Date().toISOString(),
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const allSeries = await getArticlesBySeries()
  const series = allSeries.find(
    s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug
  )
  
  if (!series) {
    return {
      title: 'Series Not Found',
      description: 'The requested series could not be found.',
    }
  }

  const blogSeries = transformSeriesToBlogSeries(series)
  
  return {
    title: blogSeries.title,
    description: blogSeries.description,
    openGraph: {
      title: blogSeries.title,
      description: blogSeries.description,
      type: 'article',
      authors: [blogSeries.author],
    },
  }
}

export default async function Series({ params }: { params: { slug: string } }) {
  const allSeries = await getArticlesBySeries()
  const series = allSeries.find(
    s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug
  )

  if (!series) {
    notFound()
  }

  const blogSeries = transformSeriesToBlogSeries(series)
  const sortedArticles = [...blogSeries.articles].sort((a, b) => 
    (a.series?.order || 0) - (b.series?.order || 0)
  )

  return (
    <SimpleLayout
      title={blogSeries.title}
      intro={blogSeries.description}
    >
      <div className="flex items-center mb-8">
        <Button
          href="/series"
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>
      </div>
      <div className="mt-8 sm:mt-10">
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {sortedArticles.map((article, index) => (
              <MotionCard key={article.slug} index={index}>
                <ArticleCard article={article} index={index} />
              </MotionCard>
            ))}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}