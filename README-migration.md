# Blog Migration Guide

This document provides instructions for migrating your blog to the new structure.

## Overview

The migration process:

1. Creates a new directory structure for your blog content
2. Copies and transforms your articles to the new structure
3. Creates series metadata files
4. Implements a new content loading system
5. Provides a verification script to ensure everything is working correctly

## Migration Steps

### 1. Backup Your Content

Before starting, make sure to backup your content:

```bash
# Create a backup of your articles directory
cp -r src/app/articles src/app/articles.bak
```

### 2. Run the Migration Script

Run the migration script to create the new structure:

```bash
node migrate-blog.js
```

This script will:
- Create the new directory structure in `src/app/content`
- Copy and transform your articles to the new structure
- Create series metadata files
- Implement a new content loading system
- Create a verification script

### 3. Verify the Migration

Run the verification script to ensure everything is working correctly:

```bash
node verify-migration.js
```

This script will check:
- The directory structure
- Series metadata files
- Article content
- Content loader implementation

### 4. Update Your Routes

Update your Next.js routes to use the new content structure:

1. Create or update the following route files:
   - `src/app/series/page.tsx` - List all series
   - `src/app/series/[seriesSlug]/page.tsx` - Series overview page
   - `src/app/series/[seriesSlug]/[articleSlug]/page.tsx` - Individual article within a series
   - `src/app/articles/page.tsx` - List all articles (both series and standalone)
   - `src/app/articles/[articleSlug]/page.tsx` - Standalone article

2. Update your components to use the new content loading system:
   - Import from `@/lib/content` instead of `@/lib/articles`
   - Use the new functions: `getAllSeries`, `getArticlesBySeries`, etc.

### 5. Test Your Blog

Test your blog thoroughly to ensure everything is working correctly:

1. Check that all series pages load correctly
2. Check that all article pages load correctly
3. Verify that navigation between articles in a series works
4. Test all links and references

### 6. Remove the Old Structure

Once you're confident that everything is working correctly, you can remove the old structure:

```bash
# Remove the old articles directory
rm -rf src/app/articles

# Remove the old articles.ts file
rm -rf src/lib/articles.ts
```

## New Directory Structure

The new directory structure is as follows:

```
src/
└── app/
    └── content/
        ├── series/
        │   ├── brainstack-hub/
        │   │   ├── _series.json
        │   │   ├── 01-understanding-event-hub.mdx
        │   │   ├── 02-getting-started.mdx
        │   │   └── ...
        │   ├── brainstack-inject/
        │   │   ├── _series.json
        │   │   ├── 01-getting-started.mdx
        │   │   └── ...
        │   └── ...
        └── standalone/
            ├── understanding-dependency-injection.mdx
            └── ...
```

## Series Metadata

Each series has a `_series.json` file with the following structure:

```json
{
  "name": "@brainstack/hub Series",
  "description": "Master event-driven architecture with @brainstack/hub...",
  "slug": "brainstack-hub",
  "coverImage": "/images/event_driven_series.png",
  "category": "Event-Driven Architecture",
  "githubRepo": "https://github.com/username/repo/path"
}
```

## Article Metadata

Each article has metadata at the top of the file:

```jsx
export const article = {
  title: "Understanding Event-Driven Architecture with @brainstack/hub",
  description: "Deep dive into event-driven architecture...",
  author: "Martin Ouimet",
  date: "2024-01-15",
  order: 1,
  slug: "understanding-event-hub",
  seriesSlug: "brainstack-hub",
  tags: ["event-driven", "architecture", "brainstack", "hub", "typescript"],
  category: "Architecture",
  githubRepo: "https://github.com/username/repo/path"
}
```

## Content Loading System

The new content loading system is implemented in `src/lib/content.ts` and provides the following functions:

- `getAllSeries()` - Get all series with their articles
- `getArticlesBySeries(seriesSlug)` - Get all articles in a series
- `getStandaloneArticles()` - Get all standalone articles
- `getAllArticles()` - Get all articles (both series and standalone)
- `getArticleBySlug(slug, seriesSlug?)` - Get an article by its slug
- `getArticlesByTag(tag)` - Get all articles with a specific tag
- `getArticlesByCategory(category)` - Get all articles in a specific category
- `getAllTags()` - Get all tags used in articles
- `getAllCategories()` - Get all categories used in articles

## Troubleshooting

If you encounter any issues during the migration, check the following:

1. **Verification script fails**:
   - Check the error messages and fix the issues
   - Run the verification script again

2. **Articles not loading**:
   - Check that the article files are in the correct location
   - Verify that the article metadata is correct
   - Check the content loading system implementation

3. **Series not displaying correctly**:
   - Check the series metadata files
   - Verify that the articles have the correct `seriesSlug` property

4. **Routes not working**:
   - Check that the route files are in the correct location
   - Verify that the route files are importing from the correct modules
   - Check that the route parameters are correct

If you need to revert the migration, you can restore your backup:

```bash
# Restore the articles directory
cp -r src/app/articles.bak src/app/articles
```

## Next Steps

After completing the migration, consider the following improvements:

1. **Add GitHub repository links** to all articles
2. **Standardize article structure** using the template
3. **Create cross-references** between related articles in different series
4. **Add "Next Steps"** sections at the end of each article
5. **Implement analytics** to track article performance
