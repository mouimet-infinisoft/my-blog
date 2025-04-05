const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(CONTENT_DIR, 'standalone');

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Fix MDX files by removing duplicate headers
async function fixMdxFiles() {
  log.info('Fixing MDX files...');
  
  // Fix series articles
  try {
    const seriesDirs = await readdir(SERIES_DIR);
    
    for (const seriesDir of seriesDirs) {
      const articleFiles = (await readdir(path.join(SERIES_DIR, seriesDir)))
        .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
      
      for (const articleFile of articleFiles) {
        const articlePath = path.join(SERIES_DIR, seriesDir, articleFile);
        
        try {
          let content = await readFile(articlePath, 'utf8');
          
          // Extract article title
          const titleMatch = content.match(/title:\s*"([^"]*)"/);
          if (!titleMatch) continue;
          
          const title = titleMatch[1];
          
          // Remove duplicate header
          const headerRegex = new RegExp(`# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
          content = content.replace(headerRegex, '');
          
          // Write updated content
          await writeFile(articlePath, content, 'utf8');
          log.success(`Fixed duplicate header in ${articleFile}`);
        } catch (err) {
          log.error(`Failed to fix ${articleFile}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    log.error(`Failed to read series directories: ${err.message}`);
  }
  
  // Fix standalone articles
  try {
    const articleFiles = await readdir(STANDALONE_DIR);
    
    for (const articleFile of articleFiles) {
      const articlePath = path.join(STANDALONE_DIR, articleFile);
      
      try {
        let content = await readFile(articlePath, 'utf8');
        
        // Extract article title
        const titleMatch = content.match(/title:\s*"([^"]*)"/);
        if (!titleMatch) continue;
        
        const title = titleMatch[1];
        
        // Remove duplicate header
        const headerRegex = new RegExp(`# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
        content = content.replace(headerRegex, '');
        
        // Write updated content
        await writeFile(articlePath, content, 'utf8');
        log.success(`Fixed duplicate header in ${articleFile}`);
      } catch (err) {
        log.error(`Failed to fix ${articleFile}: ${err.message}`);
      }
    }
  } catch (err) {
    log.error(`Failed to read standalone articles: ${err.message}`);
  }
  
  log.success('MDX files fixed!');
}

// Run the fix
fixMdxFiles().catch(err => {
  log.error(`Failed to fix MDX files: ${err.message}`);
  process.exit(1);
});
