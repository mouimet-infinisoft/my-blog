import fs from 'fs';
import path from 'path';
import { type Article, type ArticleWithSlug, type Series } from './types';

export async function getAllSeries() {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series');
  const seriesDirs = fs.readdirSync(seriesPath);
  
  return Promise.all(seriesDirs.map(async (dir) => {
    const seriesJsonPath = path.join(seriesPath, dir, '_series.json');
    const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) as Series;
    
    // Get articles in this series
    const articles = await getArticlesBySeries(dir);
    
    return {
      ...seriesData,
      articles
    };
  }));
}

export async function getArticlesBySeries(seriesSlug: string) {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series', seriesSlug);
  const files = fs.readdirSync(seriesPath)
    .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
  
  const articles = await Promise.all(files.map(async (file) => {
    const filePath = path.join(seriesPath, file);
    const { article } = await import(`../app/content/series/${seriesSlug}/${file}`);
    
    return {
      ...article,
      slug: file.replace(/^\d+-/, '').replace(/\.mdx$/, ''),
      seriesSlug
    };
  }));
  
  return articles.sort((a, b) => a.order - b.order);
}

export async function getStandaloneArticles() {
  const standalonePath = path.join(process.cwd(), 'src/app/content/standalone');
  const files = fs.readdirSync(standalonePath).filter(file => file.endsWith('.mdx'));
  
  return Promise.all(files.map(async (file) => {
    const { article } = await import(`../app/content/standalone/${file}`);
    
    return {
      ...article,
      isStandalone: true
    };
  }));
}

export async function getAllArticles() {
  const series = await getAllSeries();
  const seriesArticles = series.flatMap(s => s.articles);
  const standaloneArticles = await getStandaloneArticles();
  
  return [...seriesArticles, ...standaloneArticles].sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getArticleBySlug(slug: string, seriesSlug?: string) {
  if (seriesSlug) {
    const articles = await getArticlesBySeries(seriesSlug);
    const article = articles.find(a => a.slug === slug);
    
    if (!article) {
      throw new Error(`Article not found: ${slug} in series ${seriesSlug}`);
    }
    
    const articleIndex = articles.findIndex(a => a.slug === slug);
    
    return {
      article,
      prevArticle: articleIndex > 0 ? articles[articleIndex - 1] : undefined,
      nextArticle: articleIndex < articles.length - 1 ? articles[articleIndex + 1] : undefined,
    };
  }
  
  // Try to find in standalone articles
  const standaloneArticles = await getStandaloneArticles();
  const article = standaloneArticles.find(a => a.slug === slug);
  
  if (article) {
    return { article };
  }
  
  // If not found, try to find in all series
  const series = await getAllSeries();
  
  for (const s of series) {
    const article = s.articles.find((a: ArticleWithSlug) => a.slug === slug);
    if (article) {
      const articleIndex = s.articles.findIndex(a => a.slug === slug);
      
      return {
        article,
        prevArticle: articleIndex > 0 ? s.articles[articleIndex - 1] : undefined,
        nextArticle: articleIndex < s.articles.length - 1 ? s.articles[articleIndex + 1] : undefined,
      };
    }
  }
  
  throw new Error(`Article not found: ${slug}`);
}

export async function getArticlesByTag(tag: string) {
  const articles = await getAllArticles();
  return articles.filter(article => article.tags?.includes(tag));
}

export async function getArticlesByCategory(category: string) {
  const articles = await getAllArticles();
  return articles.filter(article => article.category === category);
}

export async function getAllTags() {
  const articles = await getAllArticles();
  const tags = new Set<string>();
  
  articles.forEach(article => {
    article.tags?.forEach((tag:string) => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export async function getAllCategories() {
  const articles = await getAllArticles();
  const categories = new Set<string>();
  
  articles.forEach(article => {
    if (article.category) {
      categories.add(article.category);
    }
  });
  
  return Array.from(categories).sort();
}
