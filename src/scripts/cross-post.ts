import 'dotenv/config';
import { SocialMediaManager } from '../lib/socialMedia/SocialMediaManager';
import { extractArticleContent } from '../lib/socialMedia/utils';

async function main() {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Please provide an article URL');
    console.error('Usage: npm run cross-post <article-url>');
    process.exit(1);
  }

  try {
    const manager = new SocialMediaManager({
      devTo: {
        apiKey: process.env.DEVTO_API_KEY || '',
      },
      linkedin: {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
        userId: process.env.LINKEDIN_USER_ID || '',
      },
    });

    const article = await extractArticleContent(url);
    if (!article) {
      console.error('Failed to extract article content');
      process.exit(1);
    }

    const result = await manager.crossPost(article);

    if (result.success) {
      console.log('✅ Article cross-posted successfully!');
      for (const postResult of result.results) {
        console.log(`- ${postResult.provider}: ${postResult.success ? '✓' : '✗'} ${postResult.postUrl || postResult.error || ''}`);
      }
    } else {
      console.error('❌ Failed to cross-post article');
      for (const postResult of result.results) {
        if (!postResult.success) {
          console.error(`- ${postResult.provider}: ${postResult.error}`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});