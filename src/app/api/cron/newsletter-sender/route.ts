import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAllArticles, getAllSeries } from '@/lib/content';

// Initialize Resend with the provided API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify cron secret to ensure this is called by Vercel
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get all published content
    const articles = await getAllArticles();
    const series = await getAllSeries();
    
    // Filter for content published today
    const todaysArticles = articles.filter(article => 
      article.date === today && article.status === 'published'
    );
    
    const todaysSeries = series.filter(s => 
      s.articles[0]?.date === today && s.status === 'published'
    );
    
    // If no content published today, exit early
    if (todaysArticles.length === 0 && todaysSeries.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No content published today' 
      });
    }
    
    // Get all subscribers from Resend
    const { data: audienceData } = await resend.audiences.list();
    if (!audienceData || audienceData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No audiences found' 
      });
    }
    
    // Get the default audience
    const defaultAudience = audienceData[0];
    
    // Get contacts from the audience
    const { data: contactsData } = await resend.contacts.list({ audienceId: defaultAudience.id });
    if (!contactsData || contactsData.data.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No subscribers found' 
      });
    }
    
    // Extract subscriber emails
    const subscribers = contactsData.data.filter(contact => !contact.unsubscribed);
    
    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No active subscribers found' 
      });
    }
    
    // Generate email content
    const emailSubject = `New Content on Infinisoft Blog - ${today}`;
    const emailHtml = generateEmailContent(todaysArticles, todaysSeries);
    
    // Send batch email using Resend
    const { data, error } = await resend.emails.send({
      from: `Infinisoft Blog <${process.env.FROM_EMAIL}>`,
      to: process.env.FROM_EMAIL || '', // Send to yourself
      bcc: subscribers.map(sub => sub.email), // BCC all subscribers
      subject: emailSubject,
      html: emailHtml,
    });
    
    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      contentCount: {
        articles: todaysArticles.length,
        series: todaysSeries.length
      }
    });
  } catch (error) {
    console.error('Newsletter sending error:', error);
    return NextResponse.json({ error: 'Failed to process newsletter' }, { status: 500 });
  }
}

function generateEmailContent(articles: any[], series: any[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Content on Infinisoft Blog</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #0d9488;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9fafb;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6b7280;
        }
        a {
          color: #0d9488;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .item {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .item:last-child {
          border-bottom: none;
        }
        h2 {
          color: #0d9488;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Content on Infinisoft Blog</h1>
        </div>
        <div class="content">
          <p>We're excited to share our latest content with you:</p>
          
          ${articles.length > 0 ? `
            <h2>New Articles</h2>
            ${articles.map(article => `
              <div class="item">
                <h3><a href="${process.env.SITE_URL}/articles/${article.slug}">${article.title}</a></h3>
                ${article.description ? `<p>${article.description}</p>` : ''}
                <p><a href="${process.env.SITE_URL}/articles/${article.slug}">Read more →</a></p>
              </div>
            `).join('')}
          ` : ''}
          
          ${series.length > 0 ? `
            <h2>New Series</h2>
            ${series.map(series => `
              <div class="item">
                <h3><a href="${process.env.SITE_URL}/series/${series.slug}">${series.name}</a></h3>
                ${series.description ? `<p>${series.description}</p>` : ''}
                <p><a href="${process.env.SITE_URL}/series/${series.slug}">Explore series →</a></p>
              </div>
            `).join('')}
          ` : ''}
          
          <p>Visit our blog at <a href="${process.env.SITE_URL}">${process.env.SITE_URL}</a> to explore more content.</p>
          <p>Thank you for subscribing to our newsletter!</p>
          <p>Best regards,<br>The Infinisoft Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Infinisoft. All rights reserved.</p>
          <p>You're receiving this email because you subscribed to our newsletter.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
