#!/bin/bash

# This script tests the social media publisher functionality by:
# 1. Creating a test article with today's date
# 2. Triggering the social media publisher endpoint

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Social Media Publisher System${NC}"
echo "==============================="

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${RED}Error: Development server is not running.${NC}"
  echo "Please start the development server with 'npm run dev' first."
  exit 1
fi

# Create a test article with today's date and social media flags
echo -e "\n${YELLOW}Creating test article with today's date and social media flags...${NC}"

TODAY=$(date +%Y-%m-%d)
TEST_ARTICLE_PATH="src/app/content/standalone/test-social-media-article-$(date +%s).mdx"

cat > $TEST_ARTICLE_PATH << EOL
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  title: "Test Social Media Article ($(date +%s))",
  description: "This is a test article to verify the social media publisher functionality",
  author: "Test Author",
  date: "$TODAY",
  slug: "test-social-media-article-$(date +%s)",
  tags: ["test", "social-media"],
  category: "Testing",
  status: "published",
  publishDate: "$TODAY",
  socialMedia: {
    linkedin: true,
    twitter: true,
    facebook: true,
    devto: true
  }
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} />

# Test Social Media Article

This is a test article created to verify that the social media publisher functionality works correctly.

## Purpose

The purpose of this article is to:

1. Test the automated social media publishing system
2. Verify that the cron job correctly identifies newly published content
3. Ensure that posts are created for the selected social media platforms

This article should be automatically detected by the social media publisher because it has:
- Today's date as the publication date
- "published" status
- Social media flags set to true
EOL

echo -e "${GREEN}Test article created at: $TEST_ARTICLE_PATH${NC}"

# Trigger the social media publisher
echo -e "\n${YELLOW}Triggering social media publisher...${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/test/social-media-publisher)

# Check if the response contains success message
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}Social media publisher triggered successfully!${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}Error triggering social media publisher.${NC}"
  echo "Response: $RESPONSE"
fi

echo -e "\n${YELLOW}Test completed.${NC}"
echo "Check the console logs for details about the social media posts."
