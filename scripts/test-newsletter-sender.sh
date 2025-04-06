#!/bin/bash

# This script tests the newsletter sender functionality by:
# 1. Creating a test article with today's date
# 2. Triggering the newsletter sender endpoint

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Newsletter Sender System${NC}"
echo "==============================="

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${RED}Error: Development server is not running.${NC}"
  echo "Please start the development server with 'npm run dev' first."
  exit 1
fi

# Create a test article with today's date
echo -e "\n${YELLOW}Creating test article with today's date...${NC}"

TODAY=$(date +%Y-%m-%d)
TEST_ARTICLE_PATH="src/app/content/standalone/test-newsletter-article-$(date +%s).mdx"

cat > $TEST_ARTICLE_PATH << EOL
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  title: "Test Newsletter Article ($(date +%s))",
  description: "This is a test article to verify the newsletter sender functionality",
  author: "Test Author",
  date: "$TODAY",
  slug: "test-newsletter-article-$(date +%s)",
  tags: ["test", "newsletter"],
  category: "Testing",
  status: "published",
  publishDate: "$TODAY"
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} />

# Test Newsletter Article

This is a test article created to verify that the newsletter sender functionality works correctly.

## Purpose

The purpose of this article is to:

1. Test the automated newsletter system
2. Verify that the cron job correctly identifies newly published content
3. Ensure that subscribers receive notifications about new content

This article should be automatically detected by the newsletter sender because it has:
- Today's date as the publication date
- "published" status

If you're reading this in an email, the newsletter system is working correctly!
EOL

echo -e "${GREEN}Test article created at: $TEST_ARTICLE_PATH${NC}"

# Trigger the newsletter sender
echo -e "\n${YELLOW}Triggering newsletter sender...${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/test/newsletter-sender)

# Check if the response contains success message
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}Newsletter sender triggered successfully!${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}Error triggering newsletter sender.${NC}"
  echo "Response: $RESPONSE"
fi

echo -e "\n${YELLOW}Test completed.${NC}"
echo "Check your email for the newsletter notification."
echo "You can also check the server logs for more details."
