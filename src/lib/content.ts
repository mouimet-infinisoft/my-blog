import fs from 'fs';
import path from 'path';
import { type Article, type ArticleWithSlug, type Series } from './types';
import { isContentVisible } from './visibility';
import { isPreviewMode } from './preview';
import { GetStaticPropsContext } from 'next';

export async function getAllSeries(context?: GetStaticPropsContext) {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series');
  const seriesDirs = fs.readdirSync(seriesPath);

  const allSeries = await Promise.all(seriesDirs.map(async (dir) => {
    const seriesJsonPath = path.join(seriesPath, dir, '_series.json');
    const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) as Series;

    // Get articles in this series
    const articles = await getArticlesBySeries(dir, context);

    return {
      ...seriesData,
      articles
    };
  }));

  // Filter series based on visibility and preview mode
  return allSeries.filter(series =>
    isContentVisible(series.status, series.publishDate) ||
    (context && isPreviewMode(context))
  );
}

export async function getArticlesBySeries(seriesSlug: string, context?: GetStaticPropsContext) {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series', seriesSlug);
  const files = fs.readdirSync(seriesPath)
    .filter(file => file.endsWith('.json') && !file.startsWith('_'));

  const articles = await Promise.all(files.map(async (file) => {
    const jsonPath = path.join(seriesPath, file);
    const articleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as Article;

    // Get the MDX content file path
    const mdxFile = file.replace('.json', '.mdx');
    const mdxPath = path.join(seriesPath, mdxFile);

    // Check if MDX file exists
    if (!fs.existsSync(mdxPath)) {
      console.warn(`MDX file not found for ${file}`);
    }

    return {
      ...articleData,
      slug: file.replace(/^\d+-/, '').replace(/\.json$/, ''),
      seriesSlug
    };
  }));

  // Filter articles based on visibility and preview mode
  const visibleArticles = articles.filter(article =>
    isContentVisible(article.status, article.publishDate) ||
    (context && isPreviewMode(context))
  );

  return visibleArticles.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getStandaloneArticles(context?: GetStaticPropsContext) {
  const standalonePath = path.join(process.cwd(), 'src/app/content/standalone');
  const files = fs.readdirSync(standalonePath).filter(file => file.endsWith('.json'));

  const articles = await Promise.all(files.map(async (file) => {
    const jsonPath = path.join(standalonePath, file);
    const articleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as Article;

    // Get the MDX content file path
    const mdxFile = file.replace('.json', '.mdx');
    const mdxPath = path.join(standalonePath, mdxFile);

    // Check if MDX file exists
    if (!fs.existsSync(mdxPath)) {
      console.warn(`MDX file not found for ${file}`);
    }

    return {
      ...articleData,
      slug: file.replace(/\.json$/, ''),
      isStandalone: true
    };
  }));

  // Filter articles based on visibility and preview mode
  return articles.filter(article =>
    isContentVisible(article.status, article.publishDate) ||
    (context && isPreviewMode(context))
  );
}

export async function getAllArticles(context?: GetStaticPropsContext) {
  const series = await getAllSeries(context);
  const seriesArticles = series.flatMap(s => s.articles);
  const standaloneArticles = await getStandaloneArticles(context);

  return [...seriesArticles, ...standaloneArticles].sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getArticleBySlug(slug: string, seriesSlug?: string, context?: GetStaticPropsContext) {
  if (seriesSlug) {
    const articles = await getArticlesBySeries(seriesSlug, context);
    const article = articles.find(a => a.slug === slug);

    if (!article) {
      throw new Error(`Article not found: ${slug} in series ${seriesSlug}`);
    }

    // Load MDX content
    const seriesPath = path.join(process.cwd(), 'src/app/content/series', seriesSlug);
    const files = fs.readdirSync(seriesPath)
      .filter(file => file.endsWith('.mdx') && file.includes(slug));

    if (files.length > 0) {
      const mdxPath = path.join(seriesPath, files[0]);
      const mdxContent = fs.readFileSync(mdxPath, 'utf8');
      article.content = mdxContent;
    }

    const articleIndex = articles.findIndex(a => a.slug === slug);

    return {
      article,
      prevArticle: articleIndex > 0 ? articles[articleIndex - 1] : undefined,
      nextArticle: articleIndex < articles.length - 1 ? articles[articleIndex + 1] : undefined,
    };
  }

  // Try to find in standalone articles
  const standaloneArticles = await getStandaloneArticles(context);
  const article = standaloneArticles.find(a => a.slug === slug);

  if (article) {
    // Load MDX content
    const standalonePath = path.join(process.cwd(), 'src/app/content/standalone');
    const mdxPath = path.join(standalonePath, `${slug}.mdx`);

    if (fs.existsSync(mdxPath)) {
      const mdxContent = fs.readFileSync(mdxPath, 'utf8');
      article.content = mdxContent;
    }

    return { article };
  }

  // If not found, try to find in all series
  const series = await getAllSeries(context);

  for (const s of series) {
    const article = s.articles.find((a: ArticleWithSlug) => a.slug === slug);
    if (article) {
      // Load MDX content
      const seriesPath = path.join(process.cwd(), 'src/app/content/series', s.slug);
      const files = fs.readdirSync(seriesPath)
        .filter(file => file.endsWith('.mdx') && file.includes(slug));

      if (files.length > 0) {
        const mdxPath = path.join(seriesPath, files[0]);
        const mdxContent = fs.readFileSync(mdxPath, 'utf8');
        article.content = mdxContent;
      }

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

export async function getArticlesByTag(tag: string, context?: GetStaticPropsContext) {
  const articles = await getAllArticles(context);
  return articles.filter(article => article.tags?.includes(tag));
}

export async function getArticlesByCategory(category: string, context?: GetStaticPropsContext) {
  const articles = await getAllArticles(context);
  return articles.filter(article => article.category === category);
}

export async function getAllTags(context?: GetStaticPropsContext) {
  const articles = await getAllArticles(context);
  const tags = new Set<string>();

  articles.forEach(article => {
    article.tags?.forEach((tag:string) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

export async function getAllCategories(context?: GetStaticPropsContext) {
  const articles = await getAllArticles(context);
  const categories = new Set<string>();

  articles.forEach(article => {
    if (article.category) {
      categories.add(article.category);
    }
  });

  return Array.from(categories).sort();
}
