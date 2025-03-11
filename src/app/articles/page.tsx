import Image from 'next/image'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { ArticleWithSlug, getAllArticles, getArticlesBySeries } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'
import { Series } from '@/lib/types'
import { Button } from '@/components/Button'
import { MotionCard } from '@/components/ui/MotionCard'
import { Calendar, ChevronRight, BookOpen, Layers } from '@/components/ui/icons'

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

function ArticleCard({ article }: { article: ArticleWithSlug }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <time dateTime={article.date} className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(article.date)}
          </time>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-teal-500">
          <a href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 text-zinc-600 dark:text-zinc-400">
          {article.description}
        </p>
        {article.category && (
          <div className="mt-4">
            <Badge className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              {article.category}
            </Badge>
          </div>
        )}
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

function SeriesCard({ series }: { series: Series }) {
  const seriesSlug = series.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-500" />
          <span className="text-sm font-medium text-teal-500">Series</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-teal-500">
          <a href={`/articles/${series.articles[0]?.slug || seriesSlug}`} className="after:absolute after:inset-0">
            {series.name}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-zinc-600 dark:text-zinc-400">
          {series.description}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {series.articles.length} articles in series
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" className="p-0 h-auto font-semibold">
            View series
          </Button>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  )
}

export const metadata = {
  title: 'Articles',
  description:
    'Technical articles on building modern applications with the Brainstack framework, focusing on dependency injection and event-driven architectures.',
}

export default async function ArticlesIndex() {
  const [articles, series] = await Promise.all([
    getAllArticles(),
    getArticlesBySeries(),
  ])

  const seriesArticleSlugs = series
    .flatMap(s => s.articles)
    .map(a => a.slug)
  const standaloneArticles = articles
    .filter(article => !seriesArticleSlugs.includes(article.slug))

  return (
    <SimpleLayout
      title="Articles & Series"
      intro="Learn about building modern applications with dependency injection, event-driven architecture, and more using the Brainstack framework."
    >
      <div className="space-y-20">
        {/* Article Series */}
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            Series
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {series.map((s, i) => (
              <MotionCard key={s.name} index={i}>
                <SeriesCard series={s} />
              </MotionCard>
            ))}
          </div>
        </div>

        {/* Standalone Articles */}
        {standaloneArticles.length > 0 && (
          <div>
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
              Latest Articles
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {standaloneArticles.map((article, i) => (
                <MotionCard key={article.slug} index={i}>
                  <ArticleCard article={article} />
                </MotionCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimpleLayout>
  )
}
