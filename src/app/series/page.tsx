import { type Metadata } from 'next'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getArticlesBySeries } from '@/lib/articles'
import { Series, BlogSeries } from '@/lib/types'
import { Card } from '@/components/Card'
import { MotionCard } from '@/components/ui/MotionCard'
import { formatDate } from '@/lib/formatDate'
import { Calendar, ChevronRight } from '@/components/ui/icons'
import { Button } from '@/components/Button'

function SeriesCard({ series }: { series: BlogSeries }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <time dateTime={series.date} className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(series.date)}
          </time>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-teal-500">
          <a href={`/series/${series.slug}`} className="after:absolute after:inset-0">
            {series.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-zinc-600 dark:text-zinc-400">
          {series.description}
        </p>
        {series.category && (
          <div className="mt-4">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              {series.category}
            </span>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {series.totalArticles} articles
          </span>
          <Button variant="secondary" className="p-0 h-auto font-semibold">
            Read series
          </Button>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'Article Series',
  description: 'Deep dive into various topics with curated series of articles on dependency injection, event-driven architecture, and more.',
  openGraph: {
    title: 'Article Series - Martin Ouimet',
    description: 'Deep dive into various topics with curated series of articles on dependency injection, event-driven architecture, and more.',
    type: 'website',
  },
}

function transformSeriesToBlogSeries(series: Series): BlogSeries {
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

export default async function SeriesIndex() {
  const series = await getArticlesBySeries()
  const blogSeries = series.map(transformSeriesToBlogSeries)

  return (
    <SimpleLayout
      title="Blog Series"
      intro="Dive deep into various topics with our carefully curated series of articles."
    >
      <div className="grid gap-8 sm:grid-cols-2">
        {blogSeries.map((s, i) => (
          <MotionCard key={s.slug} index={i}>
            <SeriesCard series={s} />
          </MotionCard>
        ))}
      </div>
    </SimpleLayout>
  )
}