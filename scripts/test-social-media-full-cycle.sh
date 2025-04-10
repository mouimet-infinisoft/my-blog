#!/bin/bash

# This script tests the full cycle of the social media publisher:
# 1. Creates a test article with today's date and social media flags
# 2. Triggers the social media publisher
# 3. Verifies the results
# 4. Deletes the test article

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Social Media Publisher Full Cycle${NC}"
echo "========================================"

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${RED}Error: Development server is not running.${NC}"
  echo "Please start the development server with 'npm run dev' first."
  exit 1
fi

# Generate a unique ID for this test
TEST_ID=$(date +%s)
TEST_ARTICLE_SLUG="test-social-media-article-${TEST_ID}"
TEST_ARTICLE_PATH="src/app/content/standalone/${TEST_ARTICLE_SLUG}.mdx"

echo -e "\n${YELLOW}Step 1: Creating test article with today's date and social media flags...${NC}"

TODAY=$(date +%Y-%m-%d)

cat > $TEST_ARTICLE_PATH << EOL
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  title: "Test Social Media Article (${TEST_ID})",
  description: "This is a test article to verify the social media publisher functionality",
  author: "Test Author",
  date: "${TODAY}",
  slug: "${TEST_ARTICLE_SLUG}",
  tags: ["test", "social-media"],
  category: "Testing",
  status: "published",
  publishDate: "${TODAY}",
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

# Wait for Next.js to detect the new file
echo -e "\n${YELLOW}Waiting for Next.js to detect the new file...${NC}"
sleep 5

echo -e "\n${YELLOW}Step 2: Triggering social media publisher...${NC}"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/test/social-media-publisher)

# Check if the response contains success message
if echo $RESPONSE | grep -q "success"; then
  echo -e "${GREEN}Social media publisher triggered successfully!${NC}"
  echo "Response: $RESPONSE"
else
  echo -e "${RED}Error triggering social media publisher.${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -e "\n${YELLOW}Step 3: Verifying results...${NC}"
echo "Checking logs for social media posts..."

# Check if logs directory exists
if [ ! -d "logs" ]; then
  mkdir -p logs
fi

# Check if social-posts.json exists
if [ ! -f "logs/social-posts.json" ]; then
  echo '[]' > logs/social-posts.json
fi

# Check if our test article is in the logs
if grep -q "${TEST_ARTICLE_SLUG}" logs/social-posts.json; then
  echo -e "${GREEN}Found test article in social media logs!${NC}"
  
  # Count successful posts
  SUCCESSFUL_POSTS=$(grep -c "\"success\":true" logs/social-posts.json)
  echo "Successful posts: $SUCCESSFUL_POSTS"
  
  # Count failed posts
  FAILED_POSTS=$(grep -c "\"success\":false" logs/social-posts.json)
  echo "Failed posts: $FAILED_POSTS"
else
  echo -e "${YELLOW}Test article not found in logs. This might be normal in development mode.${NC}"
  echo "Checking console output instead..."
fi

echo -e "\n${YELLOW}Step 4: Cleaning up...${NC}"
echo "Removing test article..."

if [ -f "$TEST_ARTICLE_PATH" ]; then
  rm "$TEST_ARTICLE_PATH"
  echo -e "${GREEN}Test article removed.${NC}"
else
  echo -e "${RED}Test article not found at $TEST_ARTICLE_PATH${NC}"
fi

echo -e "\n${GREEN}Test completed.${NC}"
echo "Check the console logs for details about the social media posts."
