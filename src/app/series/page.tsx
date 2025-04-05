import { type Metadata } from 'next'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getAllSeries } from '@/lib/content'
import { Series } from '@/lib/types'
import { Card } from '@/components/Card'
import { MotionCard } from '@/components/ui/MotionCard'
import { formatDate } from '@/lib/formatDate'
import { Calendar, ChevronRight } from '@/components/ui/icons'
import { Button } from '@/components/Button'

function SeriesCard({ series }: { series: Series }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg border border-zinc-200 dark:border-zinc-600 rounded-[10px]">
      {series.coverImage && (
        <img
          src={series.coverImage}
          alt={series.name}
          className="object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <time dateTime={series.articles[0]?.date} className="text-sm text-zinc-500 dark:text-zinc-400">
            {series.articles[0]?.date ? formatDate(series.articles[0].date) : 'Unknown date'}
          </time>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-teal-500">
          <a href={`/series/${series.slug}`} className="after:absolute after:inset-0">
            {series.name}
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
            {series.articles.length} articles
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

export default async function SeriesIndex() {
  // In App Router, we can use the preview mode directly
  const series = await getAllSeries()

  return (
    <SimpleLayout
      title="Blog Series"
      intro="Dive deep into various topics with our carefully curated series of articles."
      coverImage="/images/blog_series.png"
    >
      <div className="grid gap-8 sm:grid-cols-2">
        {series.map((s, i) => (
          <MotionCard key={s.slug} index={i}>
            <SeriesCard series={s} />
          </MotionCard>
        ))}
      </div>
    </SimpleLayout>
  )
}