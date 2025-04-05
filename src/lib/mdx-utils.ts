import fs from 'fs';
import path from 'path';

/**
 * Extracts the content from an MDX file, removing the frontmatter and default export
 */
export async function extractMdxContent(filePath: string): Promise<string> {
  try {
    // Read the file content
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Find the position of the default export
    const defaultExportMatch = content.match(/export default \(props\) => <ArticleLayout[^>]*>([^]*)/s);
    
    if (!defaultExportMatch) {
      throw new Error(`Could not find default export in MDX file: ${filePath}`);
    }
    
    // Extract the content after the default export
    let mdxContent = defaultExportMatch[1].trim();
    
    // Remove any closing tags or components at the end
    mdxContent = mdxContent.replace(/<\/ArticleLayout>\s*$/, '');
    
    return mdxContent;
  } catch (error) {
    console.error(`Error extracting MDX content from ${filePath}:`, error);
    return ''; // Return empty string on error
  }
}
