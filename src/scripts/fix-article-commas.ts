import fs from 'fs';
import path from 'path';

// Paths
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(CONTENT_DIR, 'standalone');

/**
 * Fixes missing commas in article metadata objects
 */
async function fixArticleFiles() {
  console.log('Fixing article files...');
  
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
      
      // Find the article object
      const articleMatch = content.match(/export const article = {([^}]*)}/s);
      
      if (articleMatch) {
        // Check for missing commas before status field
        if (content.includes('githubRepo: ""') && content.includes('status: "')) {
          content = content.replace(/githubRepo: ""(\s+)status:/g, 'githubRepo: "",$1status:');
          
          // Write the updated content back to the file
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Fixed comma in ${file}`);
        }
      } else {
        console.log(`Could not find article object in ${file}`);
      }
    }
  }
  
  // Process standalone articles
  const standaloneFiles = fs.readdirSync(STANDALONE_DIR)
    .filter(file => file.endsWith('.mdx'));
  
  for (const file of standaloneFiles) {
    const filePath = path.join(STANDALONE_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the article object
    const articleMatch = content.match(/export const article = {([^}]*)}/s);
    
    if (articleMatch) {
      // Check for missing commas before status field
      if (content.includes('githubRepo: ""') && content.includes('status: "')) {
        content = content.replace(/githubRepo: ""(\s+)status:/g, 'githubRepo: "",$1status:');
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed comma in ${file}`);
      }
    } else {
      console.log(`Could not find article object in ${file}`);
    }
  }
}

/**
 * Main function to run the fix
 */
async function main() {
  try {
    await fixArticleFiles();
    console.log('Fix completed successfully!');
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
main();
