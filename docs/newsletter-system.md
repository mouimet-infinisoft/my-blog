# Newsletter Subscription System Documentation

This document provides an overview of the newsletter subscription system implemented in the blog.

## Overview

The newsletter subscription system allows readers to subscribe to the blog and receive email notifications when new content is published. The system consists of the following components:

1. **Subscription Form**: A client-side React component that collects user email and name
2. **Subscription API**: A server-side API endpoint that processes subscription requests
3. **Welcome Email**: An automated email sent to new subscribers
4. **Content Notification System**: A cron job that sends emails about newly published content

## Architecture

The system uses the following technologies:

- **Resend API**: For email delivery and contact management
- **Next.js API Routes**: For handling subscription requests and cron jobs
- **Vercel Cron Jobs**: For scheduling automated content notifications

## Setup Requirements

### 1. Environment Variables

The following environment variables need to be set in `.env.local`:

```
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=newsletter@yourdomain.com
SITE_URL=https://yourdomain.com
CRON_SECRET=your_cron_secret
RESEND_AUDIENCE_ID=your_audience_id
```

### 2. DNS Configuration

The following DNS records need to be set up for the Resend API to work properly:

| Record Type | Host/Name | Value/Address | TTL | Priority |
|-------------|-----------|---------------|-----|----------|
| MX | send.blog | feedback-smtp.us-east-1.amazonses.com | 300 | 10 |
| TXT | send.blog | v=spf1 include:amazonses.com ~all | 300 | - |
| TXT | resend._domainkey.blog | k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4P7/RVudYhCzSX+ECHX4lDOp/GjkJefPBmYlBPbKYLjaCUTftEd0xA2PUUqB8oK/7Yz+z+QRjKHN29ycnd/HEdWDUcGk8+QXM3EjL9RJy5KgxJMJWEA+zdWSKgNFVJYWIJJeJw+66+XJmGR7u+NuLVdgMYc4V0ploOWx5+wK6CQIDAQAB | 300 | - |
| TXT | _dmarc | v=DMARC1; p=none; | 300 | - |

You can use the provided scripts to set up these DNS records automatically:

```bash
node scripts/setup-resend-dns-improved.js
```

### 3. Resend Audience Setup

Create a Resend audience to store subscribers:

```bash
node scripts/create-resend-audience.js
```

## Components

### 1. Subscription Form (`src/components/NewsletterSignup.tsx`)

A client-side React component that:
- Collects user email and optional name
- Validates input data
- Submits data to the subscription API
- Displays success/error messages

### 2. Subscription API (`src/app/api/newsletter/subscribe/route.ts`)

A Next.js API route that:
- Validates the submitted email
- Adds the subscriber to the Resend audience
- Sends a welcome email to the new subscriber
- Returns success/error responses

### 3. Content Notification System (`src/app/api/cron/newsletter-sender/route.ts`)

A Next.js API route that:
- Is triggered by a Vercel cron job
- Finds content published on the current day
- Retrieves all active subscribers
- Generates and sends an email with the new content

## Testing

### Testing the Subscription Form

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open the browser at http://localhost:3000
3. Fill out the subscription form and submit
4. Check the console for API responses
5. Check your email for the welcome message

### Testing the Content Notification System

You can test the content notification system without waiting for the scheduled cron job using the test endpoint:

```bash
curl -X GET http://localhost:3000/api/test/newsletter-sender
```

Or use this command to create a test article with today's date and then trigger the notification:

```bash
# Create a test article with today's date
cat > src/app/content/standalone/test-newsletter-article.mdx << EOL
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  title: "Test Newsletter Article",
  description: "This is a test article to verify the newsletter sender functionality",
  author: "Test Author",
  date: "$(date +%Y-%m-%d)",
  slug: "test-newsletter-article",
  tags: ["test", "newsletter"],
  category: "Testing",
  status: "published",
  publishDate: "$(date +%Y-%m-%d)"
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} />

# Test Newsletter Article

This is a test article created to verify that the newsletter sender functionality works correctly.
EOL

# Trigger the newsletter sender
curl -X GET http://localhost:3000/api/test/newsletter-sender
```

## Vercel Cron Job Configuration

The system uses Vercel cron jobs to automatically send notifications about new content. The configuration is in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/newsletter-sender?secret=${CRON_SECRET}",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This configuration runs the newsletter sender every day at 10:00 AM.

## Troubleshooting

### Common Issues

1. **Emails not being sent**:
   - Check that the Resend API key is correct
   - Verify that the DNS records are properly set up
   - Ensure the FROM_EMAIL is configured correctly

2. **Subscribers not being added**:
   - Verify that the RESEND_AUDIENCE_ID is correct
   - Check the API response for detailed error messages

3. **Cron job not running**:
   - Ensure the CRON_SECRET is set correctly
   - Check Vercel logs for any errors

### Debugging

For detailed debugging, check the server logs in the Vercel dashboard or locally in the development console.

## Future Improvements

- Add unsubscribe functionality
- Implement email templates customization
- Add analytics for open rates and click-through rates
- Implement A/B testing for email subject lines
- Add subscriber segmentation based on interests
