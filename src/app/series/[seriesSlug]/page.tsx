import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SimpleLayout } from '@/components/SimpleLayout'
import { Card } from '@/components/Card'
import { SocialShareButtons } from '@/components/SocialShareButtons'
import { Comments } from '@/components/Comments'
import { formatDate } from '@/lib/formatDate'
import { getAllSeries } from '@/lib/content'
import { Calendar, ArrowLeft } from '@/components/ui/icons'

interface SeriesPageProps {
  params: {
    seriesSlug: string
  }
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const series = await getAllSeries()
  const currentSeries = series.find(s => s.slug === params.seriesSlug)

  if (!currentSeries) {
    return {
      title: 'Series Not Found',
    }
  }

  return {
    title: `${currentSeries.name} - Martin Ouimet`,
    description: currentSeries.description,
    openGraph: {
      title: `${currentSeries.name} - Martin Ouimet`,
      description: currentSeries.description,
      type: 'website',
      url: `https://blog.infinisoft.world/series/${params.seriesSlug}`,
      images: [
        {
          url: currentSeries.coverImage || 'https://blog.infinisoft.world/og-image.jpg',
          width: 1200,
          height: 630,
          alt: currentSeries.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${currentSeries.name} - Martin Ouimet`,
      description: currentSeries.description,
      images: [currentSeries.coverImage || 'https://blog.infinisoft.world/og-image.jpg'],
    },
  }
}

export async function generateStaticParams() {
  const series = await getAllSeries()

  return series.map(s => ({
    seriesSlug: s.slug,
  }))
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const series = await getAllSeries()
  const currentSeries = series.find(s => s.slug === params.seriesSlug)

  if (!currentSeries) {
    notFound()
  }

  // Sort articles by order and filter out any with invalid order
  const articles = [...currentSeries.articles]
    .filter(article => article.order !== undefined)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <SimpleLayout
      title={currentSeries.name}
      intro={currentSeries.description}
      coverImage={currentSeries.coverImage}
    >
      <div className="mb-8">
        <Link
          href="/series"
          className="inline-flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all series
        </Link>
      </div>

      <div className="mb-8">
        <SocialShareButtons title={currentSeries.name} description={currentSeries.description} />
      </div>

      <div className="space-y-6">
        {articles.map((article, index) => (
          <Card key={article.slug} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-teal-500">Part {index + 1}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <time dateTime={article.date}>
                {article.date ? formatDate(article.date) : 'Coming soon'}
              </time>
            </div>

            <h3 className="mt-3 text-xl font-semibold">
              <Link
                href={`/series/${params.seriesSlug}/${article.slug}`}
                className="hover:text-teal-500"
              >
                {article.title}
              </Link>
            </h3>

            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {article.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href={`/series/${params.seriesSlug}/${article.slug}`}
                className="text-sm font-medium text-teal-500 hover:text-teal-600"
              >
                Read article →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-700">

        <Comments category="Blog Comments" path={`/series/${params.seriesSlug}`} />

      </div>
    </SimpleLayout>
  )
}
