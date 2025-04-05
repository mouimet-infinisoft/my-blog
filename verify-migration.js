const fs = require('fs');
const path = require('path');

// Configuration
const NEW_CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(NEW_CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(NEW_CONTENT_DIR, 'standalone');

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Verify directory structure
function verifyDirectoryStructure() {
  log.info('Verifying directory structure...');
  
  if (!fs.existsSync(NEW_CONTENT_DIR)) {
    log.error(`Content directory not found: ${NEW_CONTENT_DIR}`);
    return false;
  }
  
  if (!fs.existsSync(SERIES_DIR)) {
    log.error(`Series directory not found: ${SERIES_DIR}`);
    return false;
  }
  
  if (!fs.existsSync(STANDALONE_DIR)) {
    log.error(`Standalone directory not found: ${STANDALONE_DIR}`);
    return false;
  }
  
  log.success('Directory structure verified');
  return true;
}

// Verify series metadata
function verifySeriesMetadata() {
  log.info('Verifying series metadata...');
  
  const seriesDirs = fs.readdirSync(SERIES_DIR);
  
  if (seriesDirs.length === 0) {
    log.error('No series directories found');
    return false;
  }
  
  let allValid = true;
  
  for (const seriesDir of seriesDirs) {
    const seriesJsonPath = path.join(SERIES_DIR, seriesDir, '_series.json');
    
    if (!fs.existsSync(seriesJsonPath)) {
      log.error(`Series metadata file not found: ${seriesJsonPath}`);
      allValid = false;
      continue;
    }
    
    try {
      const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8'));
      
      if (!seriesData.name) {
        log.error(`Series name missing in ${seriesJsonPath}`);
        allValid = false;
      }
      
      if (!seriesData.description) {
        log.warning(`Series description missing in ${seriesJsonPath}`);
      }
      
      if (!seriesData.slug) {
        log.error(`Series slug missing in ${seriesJsonPath}`);
        allValid = false;
      }
    } catch (err) {
      log.error(`Failed to parse series metadata: ${seriesJsonPath}`);
      allValid = false;
    }
  }
  
  if (allValid) {
    log.success(`Verified metadata for ${seriesDirs.length} series`);
  }
  
  return allValid;
}

// Verify articles
function verifyArticles() {
  log.info('Verifying articles...');
  
  const seriesDirs = fs.readdirSync(SERIES_DIR);
  let seriesArticlesCount = 0;
  let allValid = true;
  
  // Verify series articles
  for (const seriesDir of seriesDirs) {
    const articleFiles = fs.readdirSync(path.join(SERIES_DIR, seriesDir))
      .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
    
    seriesArticlesCount += articleFiles.length;
    
    for (const articleFile of articleFiles) {
      const articlePath = path.join(SERIES_DIR, seriesDir, articleFile);
      
      try {
        const content = fs.readFileSync(articlePath, 'utf8');
        
        // Check for required metadata
        if (!content.includes('export const article =')) {
          log.error(`Article metadata missing in ${articlePath}`);
          allValid = false;
        }
        
        if (!content.includes('export default (props) => <ArticleLayout')) {
          log.error(`ArticleLayout component missing in ${articlePath}`);
          allValid = false;
        }
      } catch (err) {
        log.error(`Failed to read article: ${articlePath}`);
        allValid = false;
      }
    }
  }
  
  // Verify standalone articles
  const standaloneFiles = fs.readdirSync(STANDALONE_DIR)
    .filter(file => file.endsWith('.mdx'));
  
  for (const articleFile of standaloneFiles) {
    const articlePath = path.join(STANDALONE_DIR, articleFile);
    
    try {
      const content = fs.readFileSync(articlePath, 'utf8');
      
      // Check for required metadata
      if (!content.includes('export const article =')) {
        log.error(`Article metadata missing in ${articlePath}`);
        allValid = false;
      }
      
      if (!content.includes('export default (props) => <ArticleLayout')) {
        log.error(`ArticleLayout component missing in ${articlePath}`);
        allValid = false;
      }
    } catch (err) {
      log.error(`Failed to read article: ${articlePath}`);
      allValid = false;
    }
  }
  
  if (allValid) {
    log.success(`Verified ${seriesArticlesCount} series articles and ${standaloneFiles.length} standalone articles`);
  }
  
  return allValid;
}

// Verify content loader
function verifyContentLoader() {
  log.info('Verifying content loader...');
  
  const contentLoaderPath = path.join(process.cwd(), 'src/lib/content.ts');
  
  if (!fs.existsSync(contentLoaderPath)) {
    log.error(`Content loader not found: ${contentLoaderPath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(contentLoaderPath, 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'getAllSeries',
      'getArticlesBySeries',
      'getStandaloneArticles',
      'getAllArticles',
      'getArticleBySlug',
    ];
    
    for (const func of requiredFunctions) {
      if (!content.includes(`async function ${func}`)) {
        log.error(`Required function missing in content loader: ${func}`);
        return false;
      }
    }
    
    log.success('Content loader verified');
    return true;
  } catch (err) {
    log.error(`Failed to read content loader: ${err.message}`);
    return false;
  }
}

// Run all verification checks
function runVerification() {
  const structureValid = verifyDirectoryStructure();
  const metadataValid = verifySeriesMetadata();
  const articlesValid = verifyArticles();
  const contentLoaderValid = verifyContentLoader();
  
  if (structureValid && metadataValid && articlesValid && contentLoaderValid) {
    log.success('All verification checks passed!');
    log.info('The migration was successful. You can now update your routes and components to use the new content structure.');
    return true;
  } else {
    log.error('Some verification checks failed. Please fix the issues before proceeding.');
    return false;
  }
}

runVerification();
