/**
 * Migration script to split MDX files into separate JSON metadata and pure Markdown content
 * 
 * This script:
 * 1. Finds all MDX files in the content directory
 * 2. Extracts the metadata and content from each file
 * 3. Saves the metadata to a JSON file
 * 4. Saves the pure Markdown content to a new MDX file
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

// Paths
const contentDir = path.join(process.cwd(), 'src/app/content');
const standaloneDir = path.join(contentDir, 'standalone');
const seriesDir = path.join(contentDir, 'series');
const articlesDir = path.join(contentDir, 'articles');

// Ensure the articles directory exists
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

/**
 * Extract metadata from MDX file content
 * @param {string} content - The MDX file content
 * @returns {Object} The extracted metadata
 */
function extractMetadata(content) {
  // Extract the article metadata object
  const articleMatch = content.match(/export const article = {([^}]*)}/s);
  if (!articleMatch) {
    throw new Error('Could not find article metadata');
  }

  // Parse the article metadata
  const metadataStr = articleMatch[1];
  const metadata = {};

  // Extract key-value pairs
  const keyValueRegex = /(\w+):\s*(?:"([^"]*)"|(true|false)|(\[[^\]]*\])|(\d+))/g;
  let match;
  while ((match = keyValueRegex.exec(metadataStr)) !== null) {
    const key = match[1];
    // Determine the value type and parse accordingly
    if (match[2] !== undefined) {
      // String value
      metadata[key] = match[2];
    } else if (match[3] !== undefined) {
      // Boolean value
      metadata[key] = match[3] === 'true';
    } else if (match[4] !== undefined) {
      // Array value
      try {
        metadata[key] = JSON.parse(match[4].replace(/'/g, '"'));
      } catch (e) {
        metadata[key] = [];
      }
    } else if (match[5] !== undefined) {
      // Number value
      metadata[key] = parseInt(match[5], 10);
    }
  }

  // Handle social media object if present
  const socialMediaMatch = content.match(/socialMedia:\s*{([^}]*)}/s);
  if (socialMediaMatch) {
    const socialMediaStr = socialMediaMatch[1];
    const socialMedia = {};
    
    // Extract social media properties
    const socialMediaRegex = /(\w+):\s*(true|false)/g;
    let socialMatch;
    while ((socialMatch = socialMediaRegex.exec(socialMediaStr)) !== null) {
      socialMedia[socialMatch[1]] = socialMatch[2] === 'true';
    }
    
    metadata.socialMedia = socialMedia;
  }

  return metadata;
}

/**
 * Extract pure Markdown content from MDX file
 * @param {string} content - The MDX file content
 * @returns {string} The extracted Markdown content
 */
function extractMarkdownContent(content) {
  // Find the content after the default export
  const contentMatch = content.match(/export default (?:\(props\) => <ArticleLayout[^>]*>|function MDXPage\(props\)[^}]*})([\\s\\S]*)/);
  if (!contentMatch) {
    // If no match, try to find content after the metadata
    const afterMetadata = content.split(/export const article = {[^}]*};/s)[1];
    if (afterMetadata) {
      // Remove any remaining imports or exports
      return afterMetadata.replace(/import[^;]*;/g, '').replace(/export[^;]*;/g, '').trim();
    }
    return '';
  }
  
  // Clean up the content
  let markdownContent = contentMatch[1];
  
  // Remove the closing ArticleLayout tag if present
  markdownContent = markdownContent.replace(/<\\/ArticleLayout>\\s*$/, '');
  
  return markdownContent.trim();
}

/**
 * Process a standalone article
 * @param {string} filePath - Path to the MDX file
 */
async function processStandaloneArticle(filePath) {
  const fileName = path.basename(filePath);
  const slug = fileName.replace(/\\.mdx$/, '');
  
  console.log(`Processing standalone article: ${slug}`);
  
  // Read the file content
  const content = await readFile(filePath, 'utf8');
  
  try {
    // Extract metadata and content
    const metadata = extractMetadata(content);
    const markdownContent = extractMarkdownContent(content);
    
    // Add slug and isStandalone to metadata
    metadata.slug = slug;
    metadata.isStandalone = true;
    
    // Save metadata to JSON file
    const jsonPath = path.join(articlesDir, `${slug}.json`);
    await writeFile(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');
    
    // Save content to MDX file
    const mdxPath = path.join(articlesDir, `${slug}.mdx`);
    await writeFile(mdxPath, markdownContent, 'utf8');
    
    console.log(`✅ Successfully migrated: ${slug}`);
  } catch (error) {
    console.error(`❌ Error processing ${slug}:`, error);
  }
}

/**
 * Process a series article
 * @param {string} seriesSlug - The series slug
 * @param {string} filePath - Path to the MDX file
 */
async function processSeriesArticle(seriesSlug, filePath) {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.replace(/\\.mdx$/, '');
  
  // Extract the slug from the filename (remove order prefix if present)
  const slug = fileNameWithoutExt.replace(/^\\d+-/, '');
  
  console.log(`Processing series article: ${seriesSlug}/${fileNameWithoutExt}`);
  
  // Read the file content
  const content = await readFile(filePath, 'utf8');
  
  try {
    // Extract metadata and content
    const metadata = extractMetadata(content);
    const markdownContent = extractMarkdownContent(content);
    
    // Add slug and seriesSlug to metadata
    metadata.slug = slug;
    metadata.seriesSlug = seriesSlug;
    
    // Save metadata to JSON file
    const jsonPath = path.join(seriesDir, seriesSlug, `${fileNameWithoutExt}.json`);
    await writeFile(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');
    
    // Save content to MDX file
    const mdxPath = path.join(seriesDir, seriesSlug, `${fileNameWithoutExt}.mdx`);
    await writeFile(mdxPath, markdownContent, 'utf8');
    
    console.log(`✅ Successfully migrated: ${seriesSlug}/${fileNameWithoutExt}`);
  } catch (error) {
    console.error(`❌ Error processing ${seriesSlug}/${fileNameWithoutExt}:`, error);
  }
}

/**
 * Process all series
 */
async function processSeries() {
  // Get all series directories
  const seriesDirs = await readdir(seriesDir);
  
  for (const seriesSlug of seriesDirs) {
    const seriesPath = path.join(seriesDir, seriesSlug);
    
    // Skip if not a directory
    const stats = await stat(seriesPath);
    if (!stats.isDirectory()) continue;
    
    // Get all MDX files in the series directory
    const files = await readdir(seriesPath);
    const mdxFiles = files.filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
    
    for (const mdxFile of mdxFiles) {
      await processSeriesArticle(seriesSlug, path.join(seriesPath, mdxFile));
    }
  }
}

/**
 * Process all standalone articles
 */
async function processStandaloneArticles() {
  // Check if standalone directory exists
  if (!fs.existsSync(standaloneDir)) {
    console.log('No standalone articles directory found');
    return;
  }
  
  // Get all MDX files in the standalone directory
  const files = await readdir(standaloneDir);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));
  
  for (const mdxFile of mdxFiles) {
    await processStandaloneArticle(path.join(standaloneDir, mdxFile));
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting MDX migration...');
  
  try {
    // Process all standalone articles
    await processStandaloneArticles();
    
    // Process all series articles
    await processSeries();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
main();
