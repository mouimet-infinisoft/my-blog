import glob from 'fast-glob'
import * as path from 'path'
import { type Article, type ArticleWithSlug, type Series } from './types'

export type { ArticleWithSlug }

async function importArticle(articleFilename: string): Promise<ArticleWithSlug> {
  const { article } = await import(`../app/articles/${articleFilename}/page.mdx`)
  const slug = articleFilename

  return { ...article, slug }
}

export async function getAllArticles() {
  const articleFilenames = await glob('*/page.mdx', {
    cwd: path.join(process.cwd(), 'src/app/articles'),
  })

  const articles = await Promise.all(articleFilenames.map(async (filename) => {
    const article = await importArticle(filename.replace(/\/page\.mdx$/, ''))
    return article
  }))

  return articles.sort((a, z) => new Date(z.date).getTime() - new Date(a.date).getTime())
}

export async function getArticlesBySlug(slug: string): Promise<{
  article: ArticleWithSlug
  prevArticle?: ArticleWithSlug
  nextArticle?: ArticleWithSlug
}> {
  const articles = await getAllArticles()
  const articleIndex = articles.findIndex(article => article.slug === slug)
  
  if (articleIndex === -1) {
    throw new Error(`Article not found: ${slug}`)
  }

  const article = articles[articleIndex]
  
  // If article is part of a series, find prev/next in series
  if (article.series) {
    const seriesArticles = articles
      .filter(a => a.series?.name === article.series?.name)
      .sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0))
    
    const seriesIndex = seriesArticles.findIndex(a => a.slug === slug)
    
    return {
      article,
      prevArticle: seriesIndex > 0 ? seriesArticles[seriesIndex - 1] : undefined,
      nextArticle: seriesIndex < seriesArticles.length - 1 ? seriesArticles[seriesIndex + 1] : undefined,
    }
  }

  // For non-series articles, use chronological order
  return {
    article,
    prevArticle: articles[articleIndex + 1],
    nextArticle: articles[articleIndex - 1],
  }
}

export async function getArticlesBySeries(): Promise<Series[]> {
  const articles = await getAllArticles()
  const seriesMap = new Map<string, Series>()

  articles.forEach(article => {
    if (article.series) {
      if (!seriesMap.has(article.series.name)) {
        seriesMap.set(article.series.name, {
          name: article.series.name,
          description: article.series.description || '',
          coverImage: article.series.coverImage || '',
          articles: []
        })
      }
      const series = seriesMap.get(article.series.name)!
      series.articles.push(article)
    }
  })

  // Sort articles within each series by their order
  seriesMap.forEach(series => {
    series.articles.sort((a, b) => {
      return (a.series?.order || 0) - (b.series?.order || 0)
    })
  })

  return Array.from(seriesMap.values())
}

export async function getArticlesByTag(tag: string): Promise<ArticleWithSlug[]> {
  const articles = await getAllArticles()
  return articles.filter(article => article.tags?.includes(tag))
}

export async function getArticlesByCategory(category: string): Promise<ArticleWithSlug[]> {
  const articles = await getAllArticles()
  return articles.filter(article => article.category === category)
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getAllArticles()
  const tags = new Set<string>()
  
  articles.forEach(article => {
    article.tags?.forEach(tag => tags.add(tag))
  })
  
  return Array.from(tags).sort()
}

export async function getAllCategories(): Promise<string[]> {
  const articles = await getAllArticles()
  const categories = new Set<string>()
  
  articles.forEach(article => {
    if (article.category) {
      categories.add(article.category)
    }
  })
  
  return Array.from(categories).sort()
}

export async function getArticle(slug: string) {
  const article = await importArticle(slug)
  const series = article.series ? (await getArticlesBySeries())
    .find(s => s.name === article.series?.name) : null

  if (series) {
    const articleIndex = series.articles.findIndex(a => a.slug === slug)
    const prevArticle = articleIndex > 0 ? series.articles[articleIndex - 1] : undefined
    const nextArticle = articleIndex < series.articles.length - 1 ? 
      series.articles[articleIndex + 1] : undefined

    return {
      article,
      prevArticle,
      nextArticle
    }
  }

  return { article }
}
