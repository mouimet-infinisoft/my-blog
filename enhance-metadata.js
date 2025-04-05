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

// GitHub repository base URLs
const GITHUB_REPOS = {
  'brainstack-hub-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/hub/series',
  'brainstack-inject-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/inject/series',
  'brainstack-nlsh-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/nlsh/series',
  'brainstack-state-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/state/series',
  'brainstack-store-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/store/series',
  'brainstack-log-series': 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/log/series',
  'infinicode-series': 'https://github.com/Infinisoft-inc/public/tree/main/Projects/InfiniCode/series',
};

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// Update series metadata
async function updateSeriesMetadata() {
  log.info('Updating series metadata...');
  
  try {
    const seriesDirs = await readdir(SERIES_DIR);
    
    for (const seriesDir of seriesDirs) {
      const seriesJsonPath = path.join(SERIES_DIR, seriesDir, '_series.json');
      
      try {
        const seriesData = JSON.parse(await readFile(seriesJsonPath, 'utf8'));
        
        // Add GitHub repository URL if not present
        if (!seriesData.githubRepo && GITHUB_REPOS[seriesDir]) {
          seriesData.githubRepo = GITHUB_REPOS[seriesDir];
          log.info(`Added GitHub repo URL to ${seriesDir}`);
        }
        
        // Add cover image if not present
        if (!seriesData.coverImage) {
          seriesData.coverImage = `/images/${seriesDir.replace(/-series$/, '')}.png`;
          log.info(`Added cover image to ${seriesDir}`);
        }
        
        // Write updated metadata
        await writeFile(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf8');
        log.success(`Updated metadata for ${seriesDir}`);
      } catch (err) {
        log.error(`Failed to update metadata for ${seriesDir}: ${err.message}`);
      }
    }
  } catch (err) {
    log.error(`Failed to read series directories: ${err.message}`);
  }
}

// Update article metadata
async function updateArticleMetadata() {
  log.info('Updating article metadata...');
  
  // Update series articles
  try {
    const seriesDirs = await readdir(SERIES_DIR);
    
    for (const seriesDir of seriesDirs) {
      const articleFiles = (await readdir(path.join(SERIES_DIR, seriesDir)))
        .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
      
      for (const articleFile of articleFiles) {
        const articlePath = path.join(SERIES_DIR, seriesDir, articleFile);
        
        try {
          let content = await readFile(articlePath, 'utf8');
          
          // Extract article metadata
          const metadataMatch = content.match(/export const article = {([^}]*)}/s);
          if (!metadataMatch) continue;
          
          // Check if GitHub repo is missing
          if (!content.includes('githubRepo:') || content.includes('githubRepo: ""')) {
            const orderMatch = content.match(/order:\s*(\d+)/);
            const order = orderMatch ? orderMatch[1].padStart(2, '0') : '01';
            
            if (GITHUB_REPOS[seriesDir]) {
              const repoUrl = `${GITHUB_REPOS[seriesDir]}/${order}-${articleFile.replace(/^\d+-/, '').replace(/\.mdx$/, '')}`;
              
              // Add or update GitHub repo URL
              if (content.includes('githubRepo: ""')) {
                content = content.replace('githubRepo: ""', `githubRepo: "${repoUrl}"`);
              } else {
                content = content.replace(/export const article = {([^}]*)}/s, (match, p1) => {
                  return `export const article = {${p1}  githubRepo: "${repoUrl}",\n}`;
                });
              }
              
              log.info(`Added GitHub repo URL to ${articleFile}`);
            }
          }
          
          // Update date if it's in the future
          const dateMatch = content.match(/date:\s*"([^"]*)"/);
          if (dateMatch) {
            const date = new Date(dateMatch[1]);
            const now = new Date();
            
            if (date > now) {
              // Set to a recent date (within the last month)
              const recentDate = new Date();
              recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));
              const formattedDate = recentDate.toISOString().split('T')[0];
              
              content = content.replace(/date:\s*"([^"]*)"/, `date: "${formattedDate}"`);
              log.info(`Updated future date in ${articleFile}`);
            }
          }
          
          // Write updated content
          await writeFile(articlePath, content, 'utf8');
          log.success(`Updated metadata for ${articleFile}`);
        } catch (err) {
          log.error(`Failed to update metadata for ${articleFile}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    log.error(`Failed to read series directories: ${err.message}`);
  }
  
  // Update standalone articles
  try {
    const articleFiles = await readdir(STANDALONE_DIR);
    
    for (const articleFile of articleFiles) {
      const articlePath = path.join(STANDALONE_DIR, articleFile);
      
      try {
        let content = await readFile(articlePath, 'utf8');
        
        // Update date if it's in the future
        const dateMatch = content.match(/date:\s*"([^"]*)"/);
        if (dateMatch) {
          const date = new Date(dateMatch[1]);
          const now = new Date();
          
          if (date > now) {
            // Set to a recent date (within the last month)
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));
            const formattedDate = recentDate.toISOString().split('T')[0];
            
            content = content.replace(/date:\s*"([^"]*)"/, `date: "${formattedDate}"`);
            log.info(`Updated future date in ${articleFile}`);
          }
        }
        
        // Write updated content
        await writeFile(articlePath, content, 'utf8');
        log.success(`Updated metadata for ${articleFile}`);
      } catch (err) {
        log.error(`Failed to update metadata for ${articleFile}: ${err.message}`);
      }
    }
  } catch (err) {
    log.error(`Failed to read standalone articles: ${err.message}`);
  }
}

// Main function
async function enhanceMetadata() {
  log.info('Starting metadata enhancement...');
  
  await updateSeriesMetadata();
  await updateArticleMetadata();
  
  log.success('Metadata enhancement completed!');
}

// Run the enhancement
enhanceMetadata().catch(err => {
  log.error(`Enhancement failed with error: ${err.message}`);
  process.exit(1);
});
