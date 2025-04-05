import fs from 'fs';
import path from 'path';
import { ArticleStatus } from '../lib/types';

// Default values for new fields
const DEFAULT_STATUS: ArticleStatus = 'draft';
const DEFAULT_PUBLISH_DATE = new Date().toISOString().split('T')[0]; // Today's date

// Paths
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(CONTENT_DIR, 'standalone');

/**
 * Updates article MDX files to include status and publishDate fields
 */
async function updateArticleFiles() {
  console.log('Updating article files...');

  // Process series articles
  const seriesDirs = fs.readdirSync(SERIES_DIR);

  for (const seriesDir of seriesDirs) {
    const seriesPath = path.join(SERIES_DIR, seriesDir);

    if (!fs.statSync(seriesPath).isDirectory()) continue;

    const files = fs.readdirSync(seriesPath)
      .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));

    for (const file of files) {
      const filePath = path.join(seriesPath, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Check if the file already has the new fields
      if (content.includes('status:') && content.includes('publishDate:')) {
        console.log(`Skipping ${file} - already has status and publishDate fields`);
        continue;
      }

      // Find the article object
      const articleMatch = content.match(/export const article = {([^}]*)}/s);

      if (articleMatch) {
        // Check if the closing brace is the last character in the match
        const articleObj = articleMatch[0];
        const lastBraceIndex = articleObj.lastIndexOf('}');

        // Check if the last property has a comma
        const lastPropertyIndex = articleObj.substring(0, lastBraceIndex).lastIndexOf('\n');
        const lastProperty = articleObj.substring(lastPropertyIndex, lastBraceIndex).trim();
        const needsComma = !lastProperty.endsWith(',');

        // Insert the new fields before the closing brace
        const updatedArticleObj = articleObj.substring(0, lastBraceIndex) +
          (needsComma ? ',\n' : '') +
          `  status: "${DEFAULT_STATUS}",\n  publishDate: "${DEFAULT_PUBLISH_DATE}",\n` +
          articleObj.substring(lastBraceIndex);

        // Replace the old article object with the updated one
        content = content.replace(articleObj, updatedArticleObj);

        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      } else {
        console.error(`Could not find article object in ${file}`);
      }
    }
  }

  // Process standalone articles
  const standaloneFiles = fs.readdirSync(STANDALONE_DIR)
    .filter(file => file.endsWith('.mdx'));

  for (const file of standaloneFiles) {
    const filePath = path.join(STANDALONE_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if the file already has the new fields
    if (content.includes('status:') && content.includes('publishDate:')) {
      console.log(`Skipping ${file} - already has status and publishDate fields`);
      continue;
    }

    // Find the article object
    const articleMatch = content.match(/export const article = {([^}]*)}/s);

    if (articleMatch) {
      // Check if the closing brace is the last character in the match
      const articleObj = articleMatch[0];
      const lastBraceIndex = articleObj.lastIndexOf('}');

      // Check if the last property has a comma
      const lastPropertyIndex = articleObj.substring(0, lastBraceIndex).lastIndexOf('\n');
      const lastProperty = articleObj.substring(lastPropertyIndex, lastBraceIndex).trim();
      const needsComma = !lastProperty.endsWith(',');

      // Insert the new fields before the closing brace
      const updatedArticleObj = articleObj.substring(0, lastBraceIndex) +
        (needsComma ? ',\n' : '') +
        `  status: "${DEFAULT_STATUS}",\n  publishDate: "${DEFAULT_PUBLISH_DATE}",\n` +
        articleObj.substring(lastBraceIndex);

      // Replace the old article object with the updated one
      content = content.replace(articleObj, updatedArticleObj);

      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.error(`Could not find article object in ${file}`);
    }
  }
}

/**
 * Updates series JSON files to include status, publishDate, and releaseSchedule fields
 */
async function updateSeriesFiles() {
  console.log('Updating series files...');

  const seriesDirs = fs.readdirSync(SERIES_DIR);

  for (const seriesDir of seriesDirs) {
    const seriesPath = path.join(SERIES_DIR, seriesDir);

    if (!fs.statSync(seriesPath).isDirectory()) continue;

    const seriesJsonPath = path.join(seriesPath, '_series.json');

    if (fs.existsSync(seriesJsonPath)) {
      // Read the series JSON file
      const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8'));

      // Check if the file already has the new fields
      if (seriesData.status && seriesData.publishDate) {
        console.log(`Skipping ${seriesDir}/_series.json - already has status and publishDate fields`);
        continue;
      }

      // Add the new fields
      seriesData.status = DEFAULT_STATUS;
      seriesData.publishDate = DEFAULT_PUBLISH_DATE;

      // Add releaseSchedule if it doesn't exist
      if (!seriesData.releaseSchedule) {
        seriesData.releaseSchedule = {
          frequency: 'weekly',
          startDate: DEFAULT_PUBLISH_DATE
        };
      }

      // Write the updated data back to the file
      fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf8');
      console.log(`Updated ${seriesDir}/_series.json`);
    } else {
      console.error(`Could not find _series.json in ${seriesDir}`);
    }
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await updateArticleFiles();
    await updateSeriesFiles();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
