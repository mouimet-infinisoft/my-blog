const fs = require('fs');
const path = require('path');

/**
 * Extracts the content from an MDX file, removing the frontmatter and default export
 */
function extractMdxContent(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the position of the default export
    const defaultExportMatch = content.match(/export default \(props\) => <ArticleLayout[^>]*>([^]*)/s);
    
    if (!defaultExportMatch) {
      console.error(`Could not find default export in MDX file: ${filePath}`);
      return '';
    }
    
    // Extract the content after the default export
    let mdxContent = defaultExportMatch[1].trim();
    
    // Remove any closing tags or components at the end
    mdxContent = mdxContent.replace(/<\/ArticleLayout>\s*$/, '');
    
    // Write the extracted content to a new file
    const dirName = path.dirname(filePath);
    const baseName = path.basename(filePath, '.mdx');
    const extractedFilePath = path.join(dirName, `${baseName}-content.mdx`);
    
    fs.writeFileSync(extractedFilePath, mdxContent, 'utf8');
    
    console.log(`Extracted content from ${filePath} to ${extractedFilePath}`);
    
    return extractedFilePath;
  } catch (error) {
    console.error(`Error extracting MDX content from ${filePath}:`, error);
    return ''; // Return empty string on error
  }
}

// Process all MDX files in the content directory
function processAllMdxFiles() {
  const contentDir = path.join(process.cwd(), 'src/app/content');
  const seriesDir = path.join(contentDir, 'series');
  
  // Process series articles
  const seriesDirs = fs.readdirSync(seriesDir);
  
  for (const seriesSlug of seriesDirs) {
    const seriesPath = path.join(seriesDir, seriesSlug);
    
    if (fs.statSync(seriesPath).isDirectory()) {
      const files = fs.readdirSync(seriesPath);
      
      for (const file of files) {
        if (file.endsWith('.mdx') && !file.endsWith('-content.mdx') && !file.startsWith('_')) {
          const filePath = path.join(seriesPath, file);
          extractMdxContent(filePath);
        }
      }
    }
  }
  
  console.log('Processed all MDX files');
}

// Run the extraction
processAllMdxFiles();
