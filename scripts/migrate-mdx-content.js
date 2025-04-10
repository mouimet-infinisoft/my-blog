#!/usr/bin/env node

/**
 * This script migrates MDX content to the new format:
 * - Extracts metadata from MDX files and saves it to JSON files
 * - Removes import/export statements from MDX files
 * - Keeps only the content in MDX files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Content directories
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const STANDALONE_DIR = path.join(CONTENT_DIR, 'standalone');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');

/**
 * Extract metadata from MDX content
 */
function extractMetadata(content) {
  // Extract article metadata
  const articleMatch = content.match(/export const article = {([^}]*)}/s);
  if (!articleMatch) {
    return null;
  }

  // Parse the metadata
  try {
    const metadataStr = `{${articleMatch[1]}}`;
    // Replace line breaks and extra spaces
    const cleanMetadataStr = metadataStr
      .replace(/\n/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*,/g, ',')
      .replace(/:\s*,/g, ': null,')
      .replace(/:\s*}/g, ': null}');
    
    // Use Function constructor to safely evaluate the metadata
    const metadata = new Function(`return ${cleanMetadataStr}`)();
    return metadata;
  } catch (error) {
    log.error(`Failed to parse metadata: ${error.message}`);
    return null;
  }
}

/**
 * Extract content from MDX file
 */
function extractContent(content) {
  // Find the position after the last export statement
  const lastExportIndex = content.lastIndexOf('export default');
  if (lastExportIndex === -1) {
    return content;
  }

  // Find the end of the line containing the last export
  const endOfExportLine = content.indexOf('\n', lastExportIndex);
  if (endOfExportLine === -1) {
    return '';
  }

  // Return everything after the last export statement
  return content.substring(endOfExportLine + 1).trim();
}

/**
 * Process standalone articles
 */
async function processStandaloneArticles() {
  log.info('Processing standalone articles...');
  
  // Get all MDX files in the standalone directory
  const files = glob.sync('*.mdx', { cwd: STANDALONE_DIR });
  
  for (const file of files) {
    const filePath = path.join(STANDALONE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract metadata
    const metadata = extractMetadata(content);
    if (!metadata) {
      log.warning(`Could not extract metadata from ${file}`);
      continue;
    }
    
    // Extract content
    const mdxContent = extractContent(content);
    
    // Create JSON file
    const jsonFile = file.replace('.mdx', '.json');
    const jsonPath = path.join(STANDALONE_DIR, jsonFile);
    
    // Remove socialMedia from standalone articles
    if (metadata.socialMedia) {
      delete metadata.socialMedia;
    }
    
    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');
    
    // Write updated MDX file
    const updatedMdxContent = `# ${metadata.title}\n\n${mdxContent}`;
    fs.writeFileSync(filePath, updatedMdxContent, 'utf8');
    
    log.success(`Processed ${file}`);
  }
}

/**
 * Process series articles
 */
async function processSeriesArticles() {
  log.info('Processing series articles...');
  
  // Get all series directories
  const seriesDirs = fs.readdirSync(SERIES_DIR).filter(dir => 
    fs.statSync(path.join(SERIES_DIR, dir)).isDirectory()
  );
  
  for (const seriesDir of seriesDirs) {
    const seriesPath = path.join(SERIES_DIR, seriesDir);
    
    // Get all MDX files in the series directory
    const files = glob.sync('*.mdx', { cwd: seriesPath })
      .filter(file => !file.startsWith('_'));
    
    for (const file of files) {
      const filePath = path.join(seriesPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract metadata
      const metadata = extractMetadata(content);
      if (!metadata) {
        log.warning(`Could not extract metadata from ${seriesDir}/${file}`);
        continue;
      }
      
      // Extract content
      const mdxContent = extractContent(content);
      
      // Create JSON file
      const jsonFile = file.replace('.mdx', '.json');
      const jsonPath = path.join(seriesPath, jsonFile);
      
      // Remove socialMedia from series articles
      if (metadata.socialMedia) {
        delete metadata.socialMedia;
      }
      
      // Write JSON file
      fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');
      
      // Write updated MDX file
      const updatedMdxContent = `# ${metadata.title}\n\n${mdxContent}`;
      fs.writeFileSync(filePath, updatedMdxContent, 'utf8');
      
      log.success(`Processed ${seriesDir}/${file}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  log.info('Starting MDX content migration...');
  
  try {
    await processStandaloneArticles();
    await processSeriesArticles();
    
    log.success('MDX content migration completed successfully!');
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
