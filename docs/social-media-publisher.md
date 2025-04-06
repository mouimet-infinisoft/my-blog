# Social Media Publisher Documentation

This document provides an overview of the automated social media post generation system implemented in the blog.

## Overview

The social media publisher system automatically generates and publishes posts to various social media platforms when new content is published on the blog. The system is triggered by a daily cron job and only publishes content that has been explicitly marked for social media sharing.

## Supported Platforms

The system currently supports the following platforms:

1. **LinkedIn** - Professional network posts with article links
2. **Twitter** - Short-form posts with links to content
3. **Facebook** - Detailed posts with article links
4. **DEV.to** - Cross-posting of full articles with canonical URLs

## Architecture

The system uses the following technologies:

- **Vercel Cron Jobs** - For scheduling automated publishing
- **Next.js API Routes** - For handling cron job requests
- **Platform-specific APIs** - For publishing to each social media platform

## Setup Requirements

### 1. Environment Variables

The following environment variables need to be set in `.env.local`:

```
# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_AUTHOR_URN=your_linkedin_person_urn

# Twitter
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_TOKEN=your_facebook_page_token
FACEBOOK_PAGE_ID=your_facebook_page_id

# DEV.to
DEVTO_API_KEY=your_devto_api_key

# General
SITE_URL=https://blog.infinisoft.world
CRON_SECRET=your_cron_secret
```

A template file `.env.social-media.template` is provided for reference.

### 2. Platform-specific Setup

#### LinkedIn

1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/
2. Request the necessary permissions for posting content
3. Generate an access token with the required scopes
4. Find your LinkedIn Person URN (usually in the format `urn:li:person:ABC123`)

#### Twitter

1. Create a Twitter Developer App at https://developer.twitter.com/
2. Generate API keys and access tokens
3. Ensure the app has write permissions

#### Facebook

1. Create a Facebook App at https://developers.facebook.com/
2. Set up a Facebook Page
3. Generate a Page Access Token with posting permissions
4. Note your Page ID

#### DEV.to

1. Generate an API key from your DEV.to account settings
2. Ensure the API key has the necessary permissions for creating articles

## Content Configuration

To enable social media sharing for content, add a `socialMedia` object to the article or series metadata:

```javascript
export const article = {
  // ... other metadata
  status: "published",
  publishDate: "2024-04-15",
  socialMedia: {
    linkedin: true,
    twitter: true,
    facebook: true,
    devto: true
  }
}
```

You can selectively enable or disable specific platforms by setting their values to `true` or `false`.

## How It Works

1. The cron job runs daily at 9:00 AM
2. It identifies content published on the current day with `status: "published"`
3. It filters for content that has social media sharing enabled
4. For each platform selected, it:
   - Generates platform-specific content using templates
   - Publishes the content using the platform's API
   - Logs the result

## Testing

You can test the social media publisher without waiting for the scheduled cron job using the test endpoint:

```bash
./scripts/test-social-media-publisher.sh
```

This script will:
1. Create a test article with today's date and social media flags enabled
2. Trigger the social media publisher endpoint
3. Display the results

Alternatively, you can manually call the test endpoint:

```bash
curl -X GET http://localhost:3000/api/test/social-media-publisher
```

## Logging

In development mode, the system logs all publishing activities to `logs/social-posts.json`. This log includes:

- Timestamp
- Platform
- Content ID
- Content type (article or series)
- Success status
- Error details (if any)

## Troubleshooting

### Common Issues

1. **API Authentication Errors**:
   - Verify that all API keys and tokens are correct
   - Check that tokens haven't expired
   - Ensure the apps have the necessary permissions

2. **Content Not Being Published**:
   - Verify that the content has `status: "published"`
   - Check that the `publishDate` is set to today's date
   - Ensure the `socialMedia` flags are set correctly

3. **Cron Job Not Running**:
   - Ensure the `CRON_SECRET` is set correctly
   - Check Vercel logs for any errors

### Development Mode

In development mode, the system doesn't actually publish to social media platforms. Instead, it logs the data that would be sent to each platform's API. This allows for safe testing without creating actual posts.

## Future Improvements

- Add support for more social media platforms
- Implement custom templates for different content types
- Add image support for social media posts
- Implement scheduling for individual posts
- Add analytics tracking for social media engagement
