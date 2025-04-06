import fs from 'fs';
import path from 'path';
import { Article, Series } from '@/lib/types';
import { isDevelopment } from '@/lib/environment';

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
