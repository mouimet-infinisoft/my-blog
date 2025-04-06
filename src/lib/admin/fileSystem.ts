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
  let filePath: string;

  if (seriesSlug) {
    // Find the file in the series directory
    const seriesDir = path.join(contentDir, 'series', seriesSlug);
    const files = fs.readdirSync(seriesDir)
      .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));

    const articleFile = files.find(file => {
      const slug = file.replace(/^\d+-/, '').replace(/\.mdx$/, '');
      return slug === articleSlug;
    });

    if (!articleFile) {
      throw new Error(`Article not found: ${articleSlug} in series ${seriesSlug}`);
    }

    filePath = path.join(seriesDir, articleFile);
  } else {
    // Find the file in the standalone directory
    filePath = path.join(contentDir, 'standalone', `${articleSlug}.mdx`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Standalone article not found: ${articleSlug}`);
    }
  }

  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the article metadata object
  const articleMatch = content.match(/export const article = {([^}]*)}/s);

  if (!articleMatch) {
    throw new Error(`Could not find article metadata in ${filePath}`);
  }

  // Update the metadata
  let updatedContent = content;

  // Update each field in the metadata
  Object.entries(metadata).forEach(([key, value]) => {
    // Create a regex to find the field in the metadata
    const fieldRegex = new RegExp(`(\\s+${key}:\\s*)([^,\\n}]*)(,?\\n)`, 'g');

    if (fieldRegex.test(content)) {
      // Field exists, update it
      updatedContent = updatedContent.replace(
        fieldRegex,
        (match, prefix, oldValue, suffix) => {
          // Format the value based on its type
          let formattedValue;
          if (typeof value === 'string') {
            formattedValue = `"${value}"`;
          } else if (Array.isArray(value)) {
            formattedValue = JSON.stringify(value);
          } else {
            formattedValue = String(value);
          }

          return `${prefix}${formattedValue}${suffix}`;
        }
      );
    } else {
      // Field doesn't exist, add it
      const lastBraceIndex = articleMatch[0].lastIndexOf('}');
      const insertPosition = (articleMatch.index || 0) + lastBraceIndex;

      // Format the value based on its type
      let formattedValue;
      if (typeof value === 'string') {
        formattedValue = `"${value}"`;
      } else if (Array.isArray(value)) {
        formattedValue = JSON.stringify(value);
      } else {
        formattedValue = String(value);
      }

      // Add the field before the closing brace
      updatedContent =
        updatedContent.substring(0, insertPosition) +
        `\n  ${key}: ${formattedValue},` +
        updatedContent.substring(insertPosition);
    }
  });

  // Write the updated content back to the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
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

  // Determine the file path
  const contentDir = path.join(process.cwd(), 'src/app/content');
  const standaloneDir = path.join(contentDir, 'standalone');
  const filePath = path.join(standaloneDir, `${slug}.mdx`);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    throw new Error(`Article with slug '${slug}' already exists`);
  }

  // Create the article metadata
  const articleMetadata: Partial<Article> = {
    title,
    description: metadata.description || '',
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate,
    category: metadata.category,
    tags: metadata.tags || [],
    ...metadata
  };

  // Create the article content
  const articleContent = generateArticleMdx(articleMetadata, content);

  // Ensure the directory exists
  if (!fs.existsSync(standaloneDir)) {
    fs.mkdirSync(standaloneDir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(filePath, articleContent, 'utf8');

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

  // Create the article metadata
  const articleMetadata: Partial<Article> = {
    title,
    description: metadata.description || '',
    status: metadata.status || 'draft',
    publishDate: metadata.publishDate,
    category: metadata.category || seriesData.category,
    tags: metadata.tags || [],
    order,
    seriesSlug,
    ...metadata
  };

  // Create the article content
  const articleContent = generateArticleMdx(articleMetadata, content);

  // Generate the filename with order prefix
  const paddedOrder = String(order).padStart(2, '0');
  const fileName = `${paddedOrder}-${slug}.mdx`;
  const filePath = path.join(seriesDir, fileName);

  // Write the file
  fs.writeFileSync(filePath, articleContent, 'utf8');

  // Update the series JSON file with the new article
  seriesData.articles.push({
    title,
    slug,
    description: articleMetadata.description || '',
    status: articleMetadata.status || 'draft',
    publishDate: articleMetadata.publishDate,
    order,
    author: 'Admin', // Default author
    date: new Date().toISOString().split('T')[0], // Today's date
  } as ArticleWithSlug);

  // Sort articles by order
  seriesData.articles.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Write the updated series JSON file
  fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf8');

  return slug;
}

/**
 * Generates MDX content for an article
 *
 * @param metadata The article metadata
 * @param content The article content
 * @returns The generated MDX content
 */
function generateArticleMdx(metadata: Partial<Article>, content: string): string {
  // Build the article object properties one by one
  const articleProps = [];

  // Required properties
  articleProps.push(`  title: "${metadata.title}"`);
  articleProps.push(`  description: "${metadata.description || ''}"`);
  articleProps.push(`  status: "${metadata.status || 'draft'}"`);

  // Optional properties
  if (metadata.publishDate) {
    articleProps.push(`  publishDate: "${metadata.publishDate}"`);
  } else {
    articleProps.push(`  publishDate: undefined`);
  }

  if (metadata.category) {
    articleProps.push(`  category: "${metadata.category}"`);
  } else {
    articleProps.push(`  category: undefined`);
  }

  articleProps.push(`  tags: ${JSON.stringify(metadata.tags || [])}`);

  if (metadata.order !== undefined) {
    articleProps.push(`  order: ${metadata.order}`);
  }

  if (metadata.seriesSlug) {
    articleProps.push(`  seriesSlug: "${metadata.seriesSlug}"`);
  }

  // Handle social media object properly
  if (metadata.socialMedia) {
    articleProps.push(`  socialMedia: {
    linkedin: ${metadata.socialMedia.linkedin},
    twitter: ${metadata.socialMedia.twitter},
    facebook: ${metadata.socialMedia.facebook},
    devto: ${metadata.socialMedia.devto}
  }`);
  }

  // Join all properties with commas
  const articleObject = articleProps.join(',\n');

  // Construct the final MDX content
  return `---
title: "${metadata.title}"
---

export const article = {
${articleObject}
};

${content}
`;
}
