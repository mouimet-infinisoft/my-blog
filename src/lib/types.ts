export type ArticleStatus = 'draft' | 'ready' | 'scheduled' | 'published' | 'featured';

export interface ReleaseSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
}

export interface SocialMediaPlatforms {
  linkedin?: boolean
  twitter?: boolean
  facebook?: boolean
  devto?: boolean
}

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
  status?: ArticleStatus
  publishDate?: string
  socialMedia?: SocialMediaPlatforms
  content?: string
  coverImage?: string
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
  status?: ArticleStatus
  publishDate?: string
  releaseSchedule?: ReleaseSchedule
  socialMedia?: SocialMediaPlatforms
}

export interface ArticleNavigation {
  article: ArticleWithSlug
  nextArticle?: ArticleWithSlug
  prevArticle?: ArticleWithSlug
}