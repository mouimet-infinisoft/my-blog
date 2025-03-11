export interface Article {
  title: string
  description: string
  author: string
  date: string
  tags?: string[]
  category?: string
  series?: {
    name: string
    order: number
    description?: string
  }
}

export interface ArticleWithSlug extends Article {
  slug: string
}

export interface Series {
  name: string
  description: string
  articles: ArticleWithSlug[]
  coverImage?: string
}

export interface ArticleNavigation {
  article: ArticleType
  nextArticle?: ArticleType
  prevArticle?: ArticleType
}

export interface ArticleType {
  title: string
  description: string
  author: string
  date: string
  tags?: string[]
  category?: string
  series?: {
    name: string
    order: number
    description?: string
  }
  slug: string
}

export interface SeriesType {
  name: string
  description: string
  articles: ArticleType[]
  coverImage?: string
}