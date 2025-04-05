'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { AppContext } from '@/app/providers'
import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'
import { type ArticleWithSlug } from '@/lib/types'
import { formatDate } from '@/lib/formatDate'

function ArrowLeftIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRightIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.75 11.25 12.25 8m0 0-3.5-3.25M12.25 8h-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface SeriesNavProps {
  prevArticle?: ArticleWithSlug
  nextArticle?: ArticleWithSlug
}

function SeriesNav({ prevArticle, nextArticle }: SeriesNavProps) {
  if (!prevArticle && !nextArticle) return null;

  return (
    <div className="mt-8 flex justify-between border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
      {prevArticle ? (
        <Link
          href={prevArticle.seriesSlug
            ? `/series/${prevArticle.seriesSlug}/${prevArticle.slug}`
            : `/articles/${prevArticle.slug}`}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {prevArticle.title}
        </Link>
      ) : (
        <div /> // Empty div for spacing
      )}
      {nextArticle && (
        <Link
          href={nextArticle.seriesSlug
            ? `/series/${nextArticle.seriesSlug}/${nextArticle.slug}`
            : `/articles/${nextArticle.slug}`}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
        >
          {nextArticle.title}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function SeriesInfo({ article }: { article: ArticleWithSlug }) {
  if (!article.seriesSlug) return null

  return (
    <div className="mt-4 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-800/90">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        <Link href={`/series/${article.seriesSlug}`} className="hover:text-teal-500">
          Part {article.order} of the {article.seriesSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} series
        </Link>
      </p>
    </div>
  )
}

function ArticleMeta({ article }: { article: ArticleWithSlug }) {
  return (
    <div className="flex items-center gap-x-4 text-xs">
      <time dateTime={article.date} className="text-zinc-500 dark:text-zinc-400">
        {formatDate(article.date)}
      </time>
      {article.tags && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/articles?tag=${tag}`}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      {article.category && (
        <Link
          href={`/articles?category=${article.category}`}
          className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {article.category}
        </Link>
      )}
    </div>
  )
}

export function ArticleLayout({
  article,
  children,
  prevArticle,
  nextArticle,
}: {
  article: ArticleWithSlug
  children: React.ReactNode
  prevArticle?: ArticleWithSlug
  nextArticle?: ArticleWithSlug
}) {
  let router = useRouter()
  let { previousPathname } = useContext(AppContext)

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-3xl">
          {previousPathname && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to articles"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          )}
          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                {article.title}
              </h1>
              <ArticleMeta article={article} />
              <SeriesInfo article={article} />
            </header>
            <Prose className="mt-8 article-layout-content" data-mdx-content>
              {children}
            </Prose>
          </article>
          <SeriesNav prevArticle={prevArticle} nextArticle={nextArticle} />
        </div>
      </div>
    </Container>
  )
}
