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
  log.info('Fixing MDX files properly...');
  
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
          
          // Split the content into parts
          const parts = content.split('export default (props) => <ArticleLayout article={article} {...props} />');
          
          if (parts.length !== 2) {
            log.warning(`Unexpected format in ${articleFile}, skipping...`);
            continue;
          }
          
          // Get the content part
          let contentPart = parts[1].trim();
          
          // Check if the content starts with the title as a heading
          const titleHeadingRegex = new RegExp(`^\\s*# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
          const titleHeadingMatch = contentPart.match(titleHeadingRegex);
          
          if (titleHeadingMatch) {
            // Remove the title heading and any blank lines after it
            contentPart = contentPart.replace(titleHeadingRegex, '').trim();
            
            // Add a heading for the first section if needed
            if (!contentPart.startsWith('#')) {
              // Find the first paragraph
              const firstParagraphMatch = contentPart.match(/^(.+?)(?=\\n\\n|$)/s);
              if (firstParagraphMatch) {
                const firstParagraph = firstParagraphMatch[1].trim();
                // Add a heading before the first paragraph
                contentPart = `## Introduction\n\n${contentPart}`;
              }
            }
          }
          
          // Reconstruct the content
          const newContent = `${parts[0]}export default (props) => <ArticleLayout article={article} {...props} />\n\n${contentPart}`;
          
          // Write updated content
          await writeFile(articlePath, newContent, 'utf8');
          log.success(`Fixed content in ${articleFile}`);
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
        
        // Split the content into parts
        const parts = content.split('export default (props) => <ArticleLayout article={article} {...props} />');
        
        if (parts.length !== 2) {
          log.warning(`Unexpected format in ${articleFile}, skipping...`);
          continue;
        }
        
        // Get the content part
        let contentPart = parts[1].trim();
        
        // Check if the content starts with the title as a heading
        const titleHeadingRegex = new RegExp(`^\\s*# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
        const titleHeadingMatch = contentPart.match(titleHeadingRegex);
        
        if (titleHeadingMatch) {
          // Remove the title heading and any blank lines after it
          contentPart = contentPart.replace(titleHeadingRegex, '').trim();
          
          // Add a heading for the first section if needed
          if (!contentPart.startsWith('#')) {
            // Find the first paragraph
            const firstParagraphMatch = contentPart.match(/^(.+?)(?=\\n\\n|$)/s);
            if (firstParagraphMatch) {
              const firstParagraph = firstParagraphMatch[1].trim();
              // Add a heading before the first paragraph
              contentPart = `## Introduction\n\n${contentPart}`;
            }
          }
        }
        
        // Reconstruct the content
        const newContent = `${parts[0]}export default (props) => <ArticleLayout article={article} {...props} />\n\n${contentPart}`;
        
        // Write updated content
        await writeFile(articlePath, newContent, 'utf8');
        log.success(`Fixed content in ${articleFile}`);
      } catch (err) {
        log.error(`Failed to fix ${articleFile}: ${err.message}`);
      }
    }
  } catch (err) {
    log.error(`Failed to read standalone articles: ${err.message}`);
  }
  
  log.success('MDX files fixed properly!');
}

// Run the fix
fixMdxFiles().catch(err => {
  log.error(`Failed to fix MDX files: ${err.message}`);
  process.exit(1);
});
