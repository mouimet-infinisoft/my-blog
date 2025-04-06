import fs from 'fs';
import path from 'path';
import { Article, Series, ArticleStatus, ArticleWithSlug } from '@/lib/types';
import { isDevelopment } from '@/lib/environment';
import slugify from 'slugify';

/**
 * Updates the metadata in an article MDX file
 *
 * @param seriesSlug The series slug, or null for standalone articles
 * @param articleSlug The article slug
 * @param metadata The metadata to update
 * @returns A promise that resolves when the update is complete
 */
export async function updateArticleMetadata(
  seriesSlug: string | null,
  articleSlug: string,
  metadata: Partial<Article>
): Promise<void> {
  // Only allow updates in development mode
  if (!isDevelopment()) {
    throw new Error('Article updates are only allowed in development mode');
  }

  // Determine the file path
  const contentDir = path.join(process.cwd(), 'src/app/content');
  let jsonPath: string;

  if (seriesSlug) {
    // Find the file in the series directory
    const seriesDir = path.join(contentDir, 'series', seriesSlug);
    const files = fs.readdirSync(seriesDir)
      .filter(file => file.endsWith('.json') && !file.startsWith('_'));

    const articleFile = files.find(file => {
      const slug = file.replace(/^\d+-/, '').replace(/\.json$/, '');
      return slug === articleSlug;
    });

    if (!articleFile) {
      throw new Error(`Article not found: ${articleSlug} in series ${seriesSlug}`);
    }

    jsonPath = path.join(seriesDir, articleFile);
  } else {
    // Find the file in the articles directory
    jsonPath = path.join(contentDir, 'articles', `${articleSlug}.json`);

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Standalone article not found: ${articleSlug}`);
    }
  }

  // Read the JSON file
  const articleData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as Article;

  // Update the metadata
  const updatedArticleData = {
    ...articleData,
    ...metadata,
  };

  // Write the updated data back to the file
  fs.writeFileSync(jsonPath, JSON.stringify(updatedArticleData, null, 2), 'utf8');

  // If this is a series article, also update the series JSON file
  if (seriesSlug) {
    const seriesJsonPath = path.join(contentDir, 'series', seriesSlug, '_series.json');
    if (fs.existsSync(seriesJsonPath)) {
      const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) as Series;

      // Find the article in the series
      const articleIndex = seriesData.articles.findIndex(a => a.slug === articleSlug);
      if (articleIndex !== -1) {
        // Update the article in the series
        seriesData.articles[articleIndex] = {
          ...seriesData.articles[articleIndex],
          title: metadata.title || seriesData.articles[articleIndex].title,
          description: metadata.description || seriesData.articles[articleIndex].description,
          status: metadata.status || seriesData.articles[articleIndex].status,
          publishDate: metadata.publishDate || seriesData.articles[articleIndex].publishDate,
          order: metadata.order || seriesData.articles[articleIndex].order,
        };

        // Sort articles by order
        seriesData.articles.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Write the updated series JSON file
        fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf8');
      }
    }
  }
}

/**
 * Updates the metadata in a series JSON file
 *
 * @param seriesSlug The series slug
 * @param metadata The metadata to update
 * @returns A promise that resolves when the update is complete
 */
export async function updateSeriesMetadata(
  seriesSlug: string,
  metadata: Partial<Series>
): Promise<void> {
  // Only allow updates in development mode
  if (!isDevelopment()) {
    throw new Error('Series updates are only allowed in development mode');
  }

  // Determine the file path
  const seriesJsonPath = path.join(
    process.cwd(),
    'src/app/content/series',
    seriesSlug,
    '_series.json'
  );

  if (!fs.existsSync(seriesJsonPath)) {
    throw new Error(`Series not found: ${seriesSlug}`);
  }

  // Read the series JSON file
  const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) as Series;

  // Update the metadata
  const updatedSeriesData = {
    ...seriesData,
    ...metadata,
  };

  // Write the updated data back to the file
  fs.writeFileSync(seriesJsonPath, JSON.stringify(updatedSeriesData, null, 2), 'utf8');
}

/**
 * Creates a new standalone article
 *
 * @param title The article title
 * @param content The article content
 * @param metadata Additional article metadata
 * @returns The slug of the created article
 */
export async function createStandaloneArticle(
  title: string,
  content: string,
  metadata: Partial<Article> = {}
): Promise<string> {
  // Only allow creation in development mode
  if (!isDevelopment()) {
    throw new Error('Article creation is only allowed in development mode');
  }

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Determine the file paths
  const contentDir = path.join(process.cwd(), 'src/app/content');
  const articlesDir = path.join(contentDir, 'articles');
  const mdxPath = path.join(articlesDir, `${slug}.mdx`);
  const jsonPath = path.join(articlesDir, `${slug}.json`);

  // Check if files already exist
  if (fs.existsSync(mdxPath) || fs.existsSync(jsonPath)) {
    throw new Error(`Article with slug '${slug}' already exists`);
  }

  // Create the article metadata
  const articleMetadata: Partial<ArticleWithSlug> = {
    title,
    description: metadata.description || '',
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate,
    category: metadata.category,
    tags: metadata.tags || [],
    slug, // Add the slug to the metadata
    isStandalone: true,
    author: metadata.author || 'Admin', // Default author
    date: metadata.date || new Date().toISOString().split('T')[0], // Today's date
    ...metadata
  };

  // Ensure the directory exists
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  // Save the metadata to a JSON file
  await saveArticleMetadata(jsonPath, articleMetadata);

  // Create the article MDX file
  const mdxContent = generateArticleMdx(slug, content);
  await fs.promises.writeFile(mdxPath, mdxContent, 'utf-8');

  return slug;
}

/**
 * Creates a new series
 *
 * @param name The series name
 * @param description The series description
 * @param metadata Additional series metadata
 * @returns The slug of the created series
 */
export async function createSeries(
  name: string,
  description: string,
  metadata: Partial<Series> = {}
): Promise<string> {
  // Only allow creation in development mode
  if (!isDevelopment()) {
    throw new Error('Series creation is only allowed in development mode');
  }

  // Generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  // Determine the directory path
  const contentDir = path.join(process.cwd(), 'src/app/content');
  const seriesDir = path.join(contentDir, 'series', slug);
  const seriesJsonPath = path.join(seriesDir, '_series.json');

  // Check if series already exists
  if (fs.existsSync(seriesDir)) {
    throw new Error(`Series with slug '${slug}' already exists`);
  }

  // Create the series metadata
  const seriesMetadata: Series = {
    name,
    description,
    slug,
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate,
    category: metadata.category,
    articles: [],
    releaseSchedule: metadata.releaseSchedule,
    ...metadata
  };

  // Ensure the directory exists
  fs.mkdirSync(seriesDir, { recursive: true });

  // Write the series JSON file
  fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesMetadata, null, 2), 'utf8');

  return slug;
}

/**
 * Creates a new article in a series
 *
 * @param seriesSlug The series slug
 * @param title The article title
 * @param content The article content
 * @param order The article order in the series
 * @param metadata Additional article metadata
 * @returns The slug of the created article
 */
export async function createSeriesArticle(
  seriesSlug: string,
  title: string,
  content: string,
  order: number,
  metadata: Partial<Article> = {}
): Promise<string> {
  // Only allow creation in development mode
  if (!isDevelopment()) {
    throw new Error('Article creation is only allowed in development mode');
  }

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Determine the directory path
  const contentDir = path.join(process.cwd(), 'src/app/content');
  const seriesDir = path.join(contentDir, 'series', seriesSlug);
  const seriesJsonPath = path.join(seriesDir, '_series.json');

  // Check if series exists
  if (!fs.existsSync(seriesDir)) {
    throw new Error(`Series with slug '${seriesSlug}' not found`);
  }

  // Read the series JSON file
  const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8')) as Series;

  // Check if article with this slug already exists in the series
  if (seriesData.articles.some(article => article.slug === slug)) {
    throw new Error(`Article with slug '${slug}' already exists in series '${seriesSlug}'`);
  }

  // Generate the filename with order prefix
  const paddedOrder = String(order).padStart(2, '0');
  const baseFileName = `${paddedOrder}-${slug}`;
  const mdxPath = path.join(seriesDir, `${baseFileName}.mdx`);
  const jsonPath = path.join(seriesDir, `${baseFileName}.json`);

  // Create the article metadata
  const articleMetadata: Partial<ArticleWithSlug> = {
    title,
    description: metadata.description || '',
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate,
    category: metadata.category || seriesData.category,
    tags: metadata.tags || [],
    order,
    seriesSlug,
    slug,
    author: metadata.author || 'Admin', // Default author
    date: metadata.date || new Date().toISOString().split('T')[0], // Today's date
    ...metadata
  };

  // Save the metadata to a JSON file
  await saveArticleMetadata(jsonPath, articleMetadata);

  // Create the article MDX file
  const mdxContent = generateArticleMdx(baseFileName, content);
  await fs.promises.writeFile(mdxPath, mdxContent, 'utf-8');

  // Update the series JSON file with the new article
  seriesData.articles.push({
    title,
    slug,
    description: articleMetadata.description || '',
    status: articleMetadata.status || 'draft',
    publishDate: articleMetadata.publishDate,
    order,
    author: articleMetadata.author || 'Admin',
    date: articleMetadata.date || new Date().toISOString().split('T')[0],
  } as ArticleWithSlug);

  // Sort articles by order
  seriesData.articles.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Write the updated series JSON file
  fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf8');

  return slug;
}

/**
 * Saves article metadata to a JSON file
 * @param filePath The path to save the JSON file
 * @param metadata The article metadata
 */
async function saveArticleMetadata(filePath: string, metadata: Partial<Article>): Promise<void> {
  await fs.promises.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * Generates MDX content for an article
 *
 * @param fileName The base file name (without extension)
 * @param content The article content
 * @returns The generated MDX content
 */
function generateArticleMdx(fileName: string, content: string): string {
  // Create a simple MDX file that imports the metadata from a JSON file
  return `import { ArticleLayout } from '@/components/ArticleLayout'
// Import the article metadata from the JSON file
import article from './${fileName}.json'

export default function MDXPage(props) {
  return <ArticleLayout article={article} {...props} />
}

${content}
`;
}
