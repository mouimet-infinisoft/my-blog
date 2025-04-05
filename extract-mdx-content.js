const fs = require('fs');
const path = require('path');

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(CONTENT_DIR, 'series');
const OUTPUT_DIR = path.join(process.cwd(), 'src/app/content-extracted');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create series output directory
const SERIES_OUTPUT_DIR = path.join(OUTPUT_DIR, 'series');
if (!fs.existsSync(SERIES_OUTPUT_DIR)) {
  fs.mkdirSync(SERIES_OUTPUT_DIR, { recursive: true });
}

// Process all series directories
const seriesDirs = fs.readdirSync(SERIES_DIR);

for (const seriesDir of seriesDirs) {
  const seriesPath = path.join(SERIES_DIR, seriesDir);
  const seriesOutputDir = path.join(SERIES_OUTPUT_DIR, seriesDir);
  
  // Create output directory for this series
  if (!fs.existsSync(seriesOutputDir)) {
    fs.mkdirSync(seriesOutputDir, { recursive: true });
  }
  
  // Process all MDX files in this series
  const files = fs.readdirSync(seriesPath)
    .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
  
  for (const file of files) {
    const filePath = path.join(seriesPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the content after the default export
    const contentMatch = content.match(/export default \(props\) => <ArticleLayout[^>]*>([^]*)/s);
    
    if (contentMatch) {
      let extractedContent = contentMatch[1].trim();
      
      // Remove closing tag if present
      extractedContent = extractedContent.replace(/<\/ArticleLayout>\s*$/, '');
      
      // Get article metadata
      const metadataMatch = content.match(/export const article = {([^}]*)}/s);
      let articleMetadata = {};
      
      if (metadataMatch) {
        try {
          // Extract title and other metadata
          const titleMatch = metadataMatch[1].match(/title:\s*"([^"]*)"/);
          const descriptionMatch = metadataMatch[1].match(/description:\s*"([^"]*)"/);
          const dateMatch = metadataMatch[1].match(/date:\s*"([^"]*)"/);
          const orderMatch = metadataMatch[1].match(/order:\s*(\d+)/);
          
          articleMetadata = {
            title: titleMatch ? titleMatch[1] : '',
            description: descriptionMatch ? descriptionMatch[1] : '',
            date: dateMatch ? dateMatch[1] : '',
            order: orderMatch ? parseInt(orderMatch[1]) : 0
          };
        } catch (error) {
          console.error(`Error parsing metadata for ${file}:`, error);
        }
      }
      
      // Create a new MDX file with just the content
      const outputContent = `
# ${articleMetadata.title}

${extractedContent}
      `.trim();
      
      // Write to output file
      const outputPath = path.join(seriesOutputDir, file);
      fs.writeFileSync(outputPath, outputContent, 'utf8');
      
      console.log(`Extracted content from ${file} to ${outputPath}`);
    } else {
      console.error(`Could not extract content from ${file}`);
    }
  }
}

console.log('Content extraction complete!');
