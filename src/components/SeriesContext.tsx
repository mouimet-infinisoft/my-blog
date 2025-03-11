import Link from 'next/link'
import { Card } from '@/components/Card'
import { Series } from '@/lib/types'

export function SeriesContext({ series, currentSlug }: { series: Series; currentSlug: string }) {
  const seriesSlug = series.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  return (
    <div className="my-8 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <span className="ml-3">Part of {series.name}</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {series.description}
      </p>
      <div className="mt-4 space-y-2">
        {series.articles.map((article, index) => (
          <div 
            key={article.slug}
            className={`flex items-center ${article.slug === currentSlug ? 'text-teal-500' : 'text-zinc-600 dark:text-zinc-400'}`}
          >
            <span className="mr-2 text-sm">{index + 1}.</span>
            <Link 
              href={`/articles/${article.slug}`}
              className={`text-sm hover:text-teal-500 ${article.slug === currentSlug ? 'font-semibold' : ''}`}
            >
              {article.title}
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href={`/articles/${series.articles[0]?.slug || ''}`}
          className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
        >
          View series overview →
        </Link>
      </div>
    </div>
  )
}