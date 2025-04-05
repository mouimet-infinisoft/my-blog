export interface Article {
  title: string
  description: string
  author: string
  date: string
  tags?: string[]
  category?: string
  order?: number
  seriesSlug?: string
  githubRepo?: string
  isStandalone?: boolean
}

export interface ArticleWithSlug extends Article {
  slug: string
}

export interface Series {
  name: string
  description: string
  slug: string
  articles: ArticleWithSlug[]
  coverImage?: string
  category?: string
  githubRepo?: string
}

export interface ArticleNavigation {
  article: ArticleWithSlug
  nextArticle?: ArticleWithSlug
  prevArticle?: ArticleWithSlug
}