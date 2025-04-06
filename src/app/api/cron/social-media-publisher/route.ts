import { NextResponse } from 'next/server';
import { getAllArticles, getAllSeries } from '@/lib/content';
import { 
  publishToLinkedIn, 
  publishToTwitter, 
  publishToFacebook, 
  publishToDevTo 
} from '@/lib/social/publishers';
import { logSocialPost } from '@/lib/social/logging';

export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by Vercel
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get all published content
    const articles = await getAllArticles();
    const series = await getAllSeries();
    
    // Filter for content published today
    const todaysArticles = articles.filter(article => 
      article.publishDate === today && 
      article.status === 'published' &&
      article.socialMedia && 
      Object.values(article.socialMedia).some(val => val === true)
    );
    
    const todaysSeries = series.filter(series => 
      series.publishDate === today && 
      series.status === 'published' &&
      series.socialMedia && 
      Object.values(series.socialMedia).some(val => val === true)
    );
    
    // If no content to publish, return early
    if (todaysArticles.length === 0 && todaysSeries.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No content to publish today' 
      });
    }
    
    // Track results
    const results = {
      linkedin: { success: 0, failed: 0 },
      twitter: { success: 0, failed: 0 },
      facebook: { success: 0, failed: 0 },
      devto: { success: 0, failed: 0 }
    };
    
    // Process articles
    for (const article of todaysArticles) {
      // Process each platform if selected
      if (article.socialMedia?.linkedin) {
        try {
          await publishToLinkedIn(article);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'linkedin',
            contentId: article.slug,
            contentType: 'article',
            success: true
          });
          results.linkedin.success++;
        } catch (error) {
          console.error('LinkedIn publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'linkedin',
            contentId: article.slug,
            contentType: 'article',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.linkedin.failed++;
        }
      }
      
      if (article.socialMedia?.twitter) {
        try {
          await publishToTwitter(article);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'twitter',
            contentId: article.slug,
            contentType: 'article',
            success: true
          });
          results.twitter.success++;
        } catch (error) {
          console.error('Twitter publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'twitter',
            contentId: article.slug,
            contentType: 'article',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.twitter.failed++;
        }
      }
      
      if (article.socialMedia?.facebook) {
        try {
          await publishToFacebook(article);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'facebook',
            contentId: article.slug,
            contentType: 'article',
            success: true
          });
          results.facebook.success++;
        } catch (error) {
          console.error('Facebook publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'facebook',
            contentId: article.slug,
            contentType: 'article',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.facebook.failed++;
        }
      }
      
      if (article.socialMedia?.devto) {
        try {
          await publishToDevTo(article);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'devto',
            contentId: article.slug,
            contentType: 'article',
            success: true
          });
          results.devto.success++;
        } catch (error) {
          console.error('DEV.to publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'devto',
            contentId: article.slug,
            contentType: 'article',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.devto.failed++;
        }
      }
    }
    
    // Process series
    for (const series of todaysSeries) {
      // Process each platform if selected
      if (series.socialMedia?.linkedin) {
        try {
          await publishToLinkedIn(series);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'linkedin',
            contentId: series.slug,
            contentType: 'series',
            success: true
          });
          results.linkedin.success++;
        } catch (error) {
          console.error('LinkedIn publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'linkedin',
            contentId: series.slug,
            contentType: 'series',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.linkedin.failed++;
        }
      }
      
      if (series.socialMedia?.twitter) {
        try {
          await publishToTwitter(series);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'twitter',
            contentId: series.slug,
            contentType: 'series',
            success: true
          });
          results.twitter.success++;
        } catch (error) {
          console.error('Twitter publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'twitter',
            contentId: series.slug,
            contentType: 'series',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.twitter.failed++;
        }
      }
      
      if (series.socialMedia?.facebook) {
        try {
          await publishToFacebook(series);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'facebook',
            contentId: series.slug,
            contentType: 'series',
            success: true
          });
          results.facebook.success++;
        } catch (error) {
          console.error('Facebook publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'facebook',
            contentId: series.slug,
            contentType: 'series',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.facebook.failed++;
        }
      }
      
      if (series.socialMedia?.devto) {
        try {
          await publishToDevTo(series);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'devto',
            contentId: series.slug,
            contentType: 'series',
            success: true
          });
          results.devto.success++;
        } catch (error) {
          console.error('DEV.to publishing error:', error);
          await logSocialPost({
            timestamp: new Date().toISOString(),
            platform: 'devto',
            contentId: series.slug,
            contentType: 'series',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          results.devto.failed++;
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      date: today,
      processed: {
        articles: todaysArticles.length,
        series: todaysSeries.length
      },
      results
    });
  } catch (error) {
    console.error('Social media publishing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process social media publishing',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
