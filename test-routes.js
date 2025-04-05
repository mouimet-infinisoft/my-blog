const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const http = require('http');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(CONTENT_DIR, 'standalone');
const BASE_URL = 'http://localhost:3000';

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Test a URL
function testUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      // Consider 200-299 status codes as success
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ url, success: true, status: res.statusCode });
      } else {
        resolve({ url, success: false, status: res.statusCode });
      }

      // Consume the response data to free up memory
      res.resume();
    });

    // Set a timeout
    req.setTimeout(5000, () => {
      req.abort();
      resolve({ url, success: false, error: 'Request timed out' });
    });

    req.on('error', (err) => {
      resolve({ url, success: false, error: err.message });
    });
  });
}

// Get all series slugs
async function getSeriesSlugs() {
  try {
    const seriesDirs = await readdir(SERIES_DIR);
    return seriesDirs;
  } catch (err) {
    log.error(`Failed to read series directories: ${err.message}`);
    return [];
  }
}

// Get all article slugs for a series
async function getArticleSlugs(seriesSlug) {
  try {
    const articleFiles = await readdir(path.join(SERIES_DIR, seriesSlug));
    return articleFiles
      .filter(file => file.endsWith('.mdx') && !file.startsWith('_'))
      .map(file => file.replace(/^\d+-/, '').replace(/\.mdx$/, ''));
  } catch (err) {
    log.error(`Failed to read articles for ${seriesSlug}: ${err.message}`);
    return [];
  }
}

// Get all standalone article slugs
async function getStandaloneArticleSlugs() {
  try {
    const articleFiles = await readdir(STANDALONE_DIR);
    return articleFiles
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''));
  } catch (err) {
    log.error(`Failed to read standalone articles: ${err.message}`);
    return [];
  }
}

// Test all routes
async function testRoutes() {
  log.info('Testing routes...');

  // Test home page
  const homeResult = await testUrl(BASE_URL);
  if (homeResult.success) {
    log.success(`Home page: ${homeResult.status}`);
  } else {
    log.error(`Home page: ${homeResult.status || homeResult.error}`);
  }

  // Test series index page
  const seriesIndexResult = await testUrl(`${BASE_URL}/series`);
  if (seriesIndexResult.success) {
    log.success(`Series index: ${seriesIndexResult.status}`);
  } else {
    log.error(`Series index: ${seriesIndexResult.status || seriesIndexResult.error}`);
  }

  // Test articles index page
  const articlesIndexResult = await testUrl(`${BASE_URL}/articles`);
  if (articlesIndexResult.success) {
    log.success(`Articles index: ${articlesIndexResult.status}`);
  } else {
    log.error(`Articles index: ${articlesIndexResult.status || articlesIndexResult.error}`);
  }

  // Test series pages
  const seriesSlugs = await getSeriesSlugs();
  for (const seriesSlug of seriesSlugs) {
    const seriesResult = await testUrl(`${BASE_URL}/series/${seriesSlug}`);
    if (seriesResult.success) {
      log.success(`Series page (${seriesSlug}): ${seriesResult.status}`);
    } else {
      log.error(`Series page (${seriesSlug}): ${seriesResult.status || seriesResult.error}`);
    }

    // Test article pages in this series
    const articleSlugs = await getArticleSlugs(seriesSlug);
    for (const articleSlug of articleSlugs) {
      const articleResult = await testUrl(`${BASE_URL}/series/${seriesSlug}/${articleSlug}`);
      if (articleResult.success) {
        log.success(`Series article (${seriesSlug}/${articleSlug}): ${articleResult.status}`);
      } else {
        log.error(`Series article (${seriesSlug}/${articleSlug}): ${articleResult.status || articleResult.error}`);
      }
    }
  }

  // Test standalone article pages
  const standaloneArticleSlugs = await getStandaloneArticleSlugs();
  for (const articleSlug of standaloneArticleSlugs) {
    const articleResult = await testUrl(`${BASE_URL}/articles/${articleSlug}`);
    if (articleResult.success) {
      log.success(`Standalone article (${articleSlug}): ${articleResult.status}`);
    } else {
      log.error(`Standalone article (${articleSlug}): ${articleResult.status || articleResult.error}`);
    }
  }

  log.info('Route testing completed!');
}

// Check if server is running
async function checkServer() {
  try {
    await testUrl(BASE_URL);
    return true;
  } catch (err) {
    return false;
  }
}

// Main function
async function main() {
  log.info('Starting route testing...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    log.error('Server is not running. Please start the development server with "npm run dev" first.');
    process.exit(1);
  }

  await testRoutes();
}

// Run the tests
main().catch(err => {
  log.error(`Testing failed with error: ${err.message}`);
  process.exit(1);
});
