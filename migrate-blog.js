const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);

// Configuration
const SOURCE_DIR = path.join(process.cwd(), 'src/app/articles');
const TARGET_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(TARGET_DIR, 'series');
const STANDALONE_DIR = path.join(TARGET_DIR, 'standalone');

// Logging utility
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  step: (msg) => console.log(`\x1b[35m[STEP]\x1b[0m ${msg}`),
};

// Helper to create directory if it doesn't exist
async function ensureDir(dir) {
  try {
    await stat(dir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(dir, { recursive: true });
      log.info(`Created directory: ${dir}`);
    } else {
      throw err;
    }
  }
}

// Extract series information from article metadata
async function extractSeriesInfo(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const seriesMatch = content.match(/series:\s*{([^}]*)}/s);
    
    if (!seriesMatch) return null;
    
    const nameMatch = seriesMatch[1].match(/name:\s*['"]([^'"]*)['"]/);
    const orderMatch = seriesMatch[1].match(/order:\s*(\d+)/);
    const descriptionMatch = seriesMatch[1].match(/description:\s*['"]([^'"]*)['"]/);
    const coverImageMatch = seriesMatch[1].match(/coverImage:\s*['"]([^'"]*)['"]/);
    
    if (!nameMatch) return null;
    
    return {
      name: nameMatch[1],
      order: orderMatch ? parseInt(orderMatch[1], 10) : 0,
      description: descriptionMatch ? descriptionMatch[1] : '',
      coverImage: coverImageMatch ? coverImageMatch[1] : '',
    };
  } catch (err) {
    log.error(`Failed to extract series info from ${filePath}: ${err.message}`);
    return null;
  }
}

// Extract article metadata
async function extractArticleMetadata(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    const titleMatch = content.match(/title:\s*['"]([^'"]*)['"]/);
    const descriptionMatch = content.match(/description:\s*['"]([^'"]*)['"]/);
    const authorMatch = content.match(/author:\s*['"]([^'"]*)['"]/);
    const dateMatch = content.match(/date:\s*['"]([^'"]*)['"]/);
    const tagsMatch = content.match(/tags:\s*\[(.*?)\]/s);
    const categoryMatch = content.match(/category:\s*['"]([^'"]*)['"]/);
    
    return {
      title: titleMatch ? titleMatch[1] : 'Untitled',
      description: descriptionMatch ? descriptionMatch[1] : '',
      author: authorMatch ? authorMatch[1] : 'Martin Ouimet',
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
      tags: tagsMatch ? tagsMatch[1].split(',').map(tag => 
        tag.trim().replace(/['"]/g, '')
      ) : [],
      category: categoryMatch ? categoryMatch[1] : 'Uncategorized',
    };
  } catch (err) {
    log.error(`Failed to extract metadata from ${filePath}: ${err.message}`);
    return {};
  }
}

// Convert series name to slug
function seriesNameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/@brainstack\//g, 'brainstack-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert article path to slug
function articlePathToSlug(filePath) {
  const basename = path.basename(filePath, '.mdx');
  return basename
    .replace(/^page$/, path.basename(path.dirname(filePath)))
    .replace(/[^a-z0-9]+/g, '-')
    .toLowerCase();
}

// Step 1: Create the new directory structure
async function createDirectoryStructure() {
  log.step('Step 1: Creating new directory structure');
  
  try {
    await ensureDir(TARGET_DIR);
    await ensureDir(SERIES_DIR);
    await ensureDir(STANDALONE_DIR);
    
    log.success('Created base directory structure');
    return true;
  } catch (err) {
    log.error(`Failed to create directory structure: ${err.message}`);
    return false;
  }
}

// Step 2: Analyze existing articles and identify series
async function analyzeArticles() {
  log.step('Step 2: Analyzing existing articles');
  
  try {
    const files = await readdir(SOURCE_DIR, { withFileTypes: true });
    const articles = [];
    const seriesMap = new Map();
    
    for (const file of files) {
      if (file.isDirectory()) {
        const mdxPath = path.join(SOURCE_DIR, file.name, 'page.mdx');
        
        try {
          await stat(mdxPath);
          
          const seriesInfo = await extractSeriesInfo(mdxPath);
          const metadata = await extractArticleMetadata(mdxPath);
          
          const article = {
            path: mdxPath,
            slug: file.name,
            ...metadata,
            series: seriesInfo,
          };
          
          articles.push(article);
          
          if (seriesInfo) {
            const seriesSlug = seriesNameToSlug(seriesInfo.name);
            
            if (!seriesMap.has(seriesSlug)) {
              seriesMap.set(seriesSlug, {
                name: seriesInfo.name,
                slug: seriesSlug,
                description: seriesInfo.description,
                coverImage: seriesInfo.coverImage,
                articles: [],
              });
            }
            
            seriesMap.get(seriesSlug).articles.push(article);
          }
        } catch (err) {
          if (err.code !== 'ENOENT') {
            log.warning(`Error processing ${mdxPath}: ${err.message}`);
          }
        }
      }
    }
    
    // Sort articles within each series by order
    for (const [_, series] of seriesMap) {
      series.articles.sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));
    }
    
    const standaloneArticles = articles.filter(article => !article.series);
    
    log.success(`Found ${articles.length} articles in ${seriesMap.size} series and ${standaloneArticles.length} standalone articles`);
    
    return {
      articles,
      seriesMap,
      standaloneArticles,
    };
  } catch (err) {
    log.error(`Failed to analyze articles: ${err.message}`);
    return { articles: [], seriesMap: new Map(), standaloneArticles: [] };
  }
}

// Step 3: Create series directories and metadata files
async function createSeriesStructure(seriesMap) {
  log.step('Step 3: Creating series directories and metadata files');
  
  try {
    for (const [seriesSlug, series] of seriesMap) {
      const seriesDir = path.join(SERIES_DIR, seriesSlug);
      await ensureDir(seriesDir);
      
      // Create _series.json
      const seriesMetadata = {
        name: series.name,
        description: series.description,
        slug: seriesSlug,
        coverImage: series.coverImage || '',
        category: series.articles[0]?.category || 'Uncategorized',
        githubRepo: '',
      };
      
      await writeFile(
        path.join(seriesDir, '_series.json'),
        JSON.stringify(seriesMetadata, null, 2),
        'utf8'
      );
      
      log.info(`Created series metadata for ${seriesSlug}`);
    }
    
    log.success(`Created ${seriesMap.size} series directories and metadata files`);
    return true;
  } catch (err) {
    log.error(`Failed to create series structure: ${err.message}`);
    return false;
  }
}

// Step 4: Copy and transform articles
async function copyArticles(seriesMap, standaloneArticles) {
  log.step('Step 4: Copying and transforming articles');
  
  try {
    // Copy series articles
    for (const [seriesSlug, series] of seriesMap) {
      const seriesDir = path.join(SERIES_DIR, seriesSlug);
      
      for (const article of series.articles) {
        const order = article.series?.order || 0;
        const paddedOrder = order.toString().padStart(2, '0');
        const articleSlug = articlePathToSlug(article.path);
        const newFileName = `${paddedOrder}-${articleSlug}.mdx`;
        const targetPath = path.join(seriesDir, newFileName);
        
        // Read original content
        const content = await readFile(article.path, 'utf8');
        
        // Transform content to new format
        const transformedContent = transformArticleContent(content, {
          ...article,
          order,
          slug: articleSlug,
          seriesSlug,
        });
        
        // Write transformed content
        await writeFile(targetPath, transformedContent, 'utf8');
        
        log.info(`Copied and transformed article: ${article.slug} -> ${newFileName}`);
      }
    }
    
    // Copy standalone articles
    for (const article of standaloneArticles) {
      const articleSlug = articlePathToSlug(article.path);
      const targetPath = path.join(STANDALONE_DIR, `${articleSlug}.mdx`);
      
      // Read original content
      const content = await readFile(article.path, 'utf8');
      
      // Transform content to new format
      const transformedContent = transformArticleContent(content, {
        ...article,
        slug: articleSlug,
        isStandalone: true,
      });
      
      // Write transformed content
      await writeFile(targetPath, transformedContent, 'utf8');
      
      log.info(`Copied and transformed standalone article: ${article.slug} -> ${articleSlug}.mdx`);
    }
    
    log.success(`Copied and transformed all articles`);
    return true;
  } catch (err) {
    log.error(`Failed to copy articles: ${err.message}`);
    return false;
  }
}

// Transform article content to new format
function transformArticleContent(content, article) {
  // Extract the main content (everything after the frontmatter)
  const mainContentMatch = content.match(/export default \(props\) => <ArticleLayout[^>]*>([^]*)/s);
  const mainContent = mainContentMatch ? mainContentMatch[1] : content;
  
  // Create new frontmatter
  let newContent = 'import { ArticleLayout } from \'@/components/ArticleLayout\'\n\n';
  newContent += 'export const article = {\n';
  newContent += `  title: "${article.title}",\n`;
  newContent += `  description: "${article.description}",\n`;
  newContent += `  author: "${article.author}",\n`;
  newContent += `  date: "${article.date}",\n`;
  
  if (!article.isStandalone) {
    newContent += `  order: ${article.order},\n`;
    newContent += `  seriesSlug: "${article.seriesSlug}",\n`;
  }
  
  newContent += `  slug: "${article.slug}",\n`;
  
  if (article.tags && article.tags.length > 0) {
    newContent += `  tags: [${article.tags.map(tag => `"${tag}"`).join(', ')}],\n`;
  }
  
  if (article.category) {
    newContent += `  category: "${article.category}",\n`;
  }
  
  // Add GitHub repo if available
  newContent += '  githubRepo: ""\n';
  newContent += '}\n\n';
  
  // Add metadata export
  newContent += 'export const metadata = {\n';
  newContent += '  title: article.title,\n';
  newContent += '  description: article.description,\n';
  newContent += '}\n\n';
  
  // Add default export
  newContent += 'export default (props) => <ArticleLayout article={article} {...props} />\n\n';
  
  // Add main content
  newContent += mainContent;
  
  return newContent;
}

// Step 5: Create content loading system
async function createContentLoader() {
  log.step('Step 5: Creating content loading system');
  
  try {
    const contentLoaderPath = path.join(process.cwd(), 'src/lib/content.ts');
    
    const contentLoaderCode = `import fs from 'fs';
import path from 'path';
import { type Article, type ArticleWithSlug, type Series } from './types';

export async function getAllSeries() {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series');
  const seriesDirs = fs.readdirSync(seriesPath);
  
  return Promise.all(seriesDirs.map(async (dir) => {
    const seriesJsonPath = path.join(seriesPath, dir, '_series.json');
    const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8'));
    
    // Get articles in this series
    const articles = await getArticlesBySeries(dir);
    
    return {
      ...seriesData,
      articles
    };
  }));
}

export async function getArticlesBySeries(seriesSlug: string) {
  const seriesPath = path.join(process.cwd(), 'src/app/content/series', seriesSlug);
  const files = fs.readdirSync(seriesPath)
    .filter(file => file.endsWith('.mdx') && !file.startsWith('_'));
  
  const articles = await Promise.all(files.map(async (file) => {
    const filePath = path.join(seriesPath, file);
    const { article } = await import(\`../app/content/series/\${seriesSlug}/\${file}\`);
    
    return {
      ...article,
      slug: file.replace(/^\\d+-/, '').replace(/\\.mdx$/, ''),
      seriesSlug
    };
  }));
  
  return articles.sort((a, b) => a.order - b.order);
}

export async function getStandaloneArticles() {
  const standalonePath = path.join(process.cwd(), 'src/app/content/standalone');
  const files = fs.readdirSync(standalonePath).filter(file => file.endsWith('.mdx'));
  
  return Promise.all(files.map(async (file) => {
    const { article } = await import(\`../app/content/standalone/\${file}\`);
    
    return {
      ...article,
      isStandalone: true
    };
  }));
}

export async function getAllArticles() {
  const series = await getAllSeries();
  const seriesArticles = series.flatMap(s => s.articles);
  const standaloneArticles = await getStandaloneArticles();
  
  return [...seriesArticles, ...standaloneArticles].sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getArticleBySlug(slug: string, seriesSlug?: string) {
  if (seriesSlug) {
    const articles = await getArticlesBySeries(seriesSlug);
    const article = articles.find(a => a.slug === slug);
    
    if (!article) {
      throw new Error(\`Article not found: \${slug} in series \${seriesSlug}\`);
    }
    
    const articleIndex = articles.findIndex(a => a.slug === slug);
    
    return {
      article,
      prevArticle: articleIndex > 0 ? articles[articleIndex - 1] : undefined,
      nextArticle: articleIndex < articles.length - 1 ? articles[articleIndex + 1] : undefined,
    };
  }
  
  // Try to find in standalone articles
  const standaloneArticles = await getStandaloneArticles();
  const article = standaloneArticles.find(a => a.slug === slug);
  
  if (article) {
    return { article };
  }
  
  // If not found, try to find in all series
  const series = await getAllSeries();
  
  for (const s of series) {
    const article = s.articles.find(a => a.slug === slug);
    if (article) {
      const articleIndex = s.articles.findIndex(a => a.slug === slug);
      
      return {
        article,
        prevArticle: articleIndex > 0 ? s.articles[articleIndex - 1] : undefined,
        nextArticle: articleIndex < s.articles.length - 1 ? s.articles[articleIndex + 1] : undefined,
      };
    }
  }
  
  throw new Error(\`Article not found: \${slug}\`);
}

export async function getArticlesByTag(tag: string) {
  const articles = await getAllArticles();
  return articles.filter(article => article.tags?.includes(tag));
}

export async function getArticlesByCategory(category: string) {
  const articles = await getAllArticles();
  return articles.filter(article => article.category === category);
}

export async function getAllTags() {
  const articles = await getAllArticles();
  const tags = new Set<string>();
  
  articles.forEach(article => {
    article.tags?.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export async function getAllCategories() {
  const articles = await getAllArticles();
  const categories = new Set<string>();
  
  articles.forEach(article => {
    if (article.category) {
      categories.add(article.category);
    }
  });
  
  return Array.from(categories).sort();
}
`;
    
    // Create a backup of the existing file if it exists
    try {
      await stat(contentLoaderPath);
      await copyFile(contentLoaderPath, `${contentLoaderPath}.bak`);
      log.info(`Created backup of existing content loader: ${contentLoaderPath}.bak`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    
    // Write the new content loader
    await writeFile(contentLoaderPath, contentLoaderCode, 'utf8');
    
    log.success('Created content loading system');
    return true;
  } catch (err) {
    log.error(`Failed to create content loader: ${err.message}`);
    return false;
  }
}

// Step 6: Create verification script
async function createVerificationScript() {
  log.step('Step 6: Creating verification script');
  
  try {
    const verifyPath = path.join(process.cwd(), 'verify-migration.js');
    
    const verifyCode = `const fs = require('fs');
const path = require('path');

// Configuration
const NEW_CONTENT_DIR = path.join(process.cwd(), 'src/app/content');
const SERIES_DIR = path.join(NEW_CONTENT_DIR, 'series');
const STANDALONE_DIR = path.join(NEW_CONTENT_DIR, 'standalone');

// Logging utility
const log = {
  info: (msg) => console.log(\`\\x1b[36m[INFO]\\x1b[0m \${msg}\`),
  success: (msg) => console.log(\`\\x1b[32m[SUCCESS]\\x1b[0m \${msg}\`),
  warning: (msg) => console.log(\`\\x1b[33m[WARNING]\\x1b[0m \${msg}\`),
  error: (msg) => console.log(\`\\x1b[31m[ERROR]\\x1b[0m \${msg}\`),
};

// Verify directory structure
function verifyDirectoryStructure() {
  log.info('Verifying directory structure...');
  
  if (!fs.existsSync(NEW_CONTENT_DIR)) {
    log.error(\`Content directory not found: \${NEW_CONTENT_DIR}\`);
    return false;
  }
  
  if (!fs.existsSync(SERIES_DIR)) {
    log.error(\`Series directory not found: \${SERIES_DIR}\`);
    return false;
  }
  
  if (!fs.existsSync(STANDALONE_DIR)) {
    log.error(\`Standalone directory not found: \${STANDALONE_DIR}\`);
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
      log.error(\`Series metadata file not found: \${seriesJsonPath}\`);
      allValid = false;
      continue;
    }
    
    try {
      const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf8'));
      
      if (!seriesData.name) {
        log.error(\`Series name missing in \${seriesJsonPath}\`);
        allValid = false;
      }
      
      if (!seriesData.description) {
        log.warning(\`Series description missing in \${seriesJsonPath}\`);
      }
      
      if (!seriesData.slug) {
        log.error(\`Series slug missing in \${seriesJsonPath}\`);
        allValid = false;
      }
    } catch (err) {
      log.error(\`Failed to parse series metadata: \${seriesJsonPath}\`);
      allValid = false;
    }
  }
  
  if (allValid) {
    log.success(\`Verified metadata for \${seriesDirs.length} series\`);
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
          log.error(\`Article metadata missing in \${articlePath}\`);
          allValid = false;
        }
        
        if (!content.includes('export default (props) => <ArticleLayout')) {
          log.error(\`ArticleLayout component missing in \${articlePath}\`);
          allValid = false;
        }
      } catch (err) {
        log.error(\`Failed to read article: \${articlePath}\`);
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
        log.error(\`Article metadata missing in \${articlePath}\`);
        allValid = false;
      }
      
      if (!content.includes('export default (props) => <ArticleLayout')) {
        log.error(\`ArticleLayout component missing in \${articlePath}\`);
        allValid = false;
      }
    } catch (err) {
      log.error(\`Failed to read article: \${articlePath}\`);
      allValid = false;
    }
  }
  
  if (allValid) {
    log.success(\`Verified \${seriesArticlesCount} series articles and \${standaloneFiles.length} standalone articles\`);
  }
  
  return allValid;
}

// Verify content loader
function verifyContentLoader() {
  log.info('Verifying content loader...');
  
  const contentLoaderPath = path.join(process.cwd(), 'src/lib/content.ts');
  
  if (!fs.existsSync(contentLoaderPath)) {
    log.error(\`Content loader not found: \${contentLoaderPath}\`);
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
      if (!content.includes(\`async function \${func}\`)) {
        log.error(\`Required function missing in content loader: \${func}\`);
        return false;
      }
    }
    
    log.success('Content loader verified');
    return true;
  } catch (err) {
    log.error(\`Failed to read content loader: \${err.message}\`);
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
`;
    
    await writeFile(verifyPath, verifyCode, 'utf8');
    
    log.success('Created verification script');
    return true;
  } catch (err) {
    log.error(`Failed to create verification script: ${err.message}`);
    return false;
  }
}

// Main migration function
async function migrate() {
  log.info('Starting blog migration...');
  
  // Step 1: Create directory structure
  const structureCreated = await createDirectoryStructure();
  if (!structureCreated) {
    log.error('Migration failed at step 1');
    return false;
  }
  
  // Step 2: Analyze articles
  const { articles, seriesMap, standaloneArticles } = await analyzeArticles();
  if (articles.length === 0) {
    log.error('No articles found. Migration failed at step 2');
    return false;
  }
  
  // Step 3: Create series structure
  const seriesStructureCreated = await createSeriesStructure(seriesMap);
  if (!seriesStructureCreated) {
    log.error('Migration failed at step 3');
    return false;
  }
  
  // Step 4: Copy articles
  const articlesCopied = await copyArticles(seriesMap, standaloneArticles);
  if (!articlesCopied) {
    log.error('Migration failed at step 4');
    return false;
  }
  
  // Step 5: Create content loader
  const contentLoaderCreated = await createContentLoader();
  if (!contentLoaderCreated) {
    log.error('Migration failed at step 5');
    return false;
  }
  
  // Step 6: Create verification script
  const verificationScriptCreated = await createVerificationScript();
  if (!verificationScriptCreated) {
    log.error('Migration failed at step 6');
    return false;
  }
  
  log.success('Migration completed successfully!');
  log.info('Next steps:');
  log.info('1. Run the verification script: node verify-migration.js');
  log.info('2. Update your routes and components to use the new content structure');
  log.info('3. Test your blog thoroughly');
  log.info('4. Once everything is working, you can remove the old articles directory');
  
  return true;
}

// Run the migration
migrate().catch(err => {
  log.error(`Migration failed with error: ${err.message}`);
  process.exit(1);
});
