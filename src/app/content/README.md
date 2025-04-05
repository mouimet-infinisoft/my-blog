# Blog Content Structure

This directory contains all the content for the blog, organized by series and standalone articles.

## Directory Structure

```
content/
├── series/
│   ├── brainstack-hub-series/
│   │   ├── _series.json
│   │   ├── 01-understanding-event-hub.mdx
│   │   ├── 02-getting-started-brainstack-hub.mdx
│   │   └── ...
│   ├── brainstack-inject-series/
│   │   ├── _series.json
│   │   ├── 01-brainstack-inject-tutorial.mdx
│   │   └── ...
│   └── ...
└── standalone/
    ├── understanding-dependency-injection.mdx
    └── ...
```

## Series Structure

Each series is contained in its own directory under `series/`. The directory name is the slug used in URLs.

Each series directory contains:

- `_series.json`: Metadata for the series
- Article files with the naming convention: `{order}-{slug}.mdx`

### Series Metadata

The `_series.json` file contains metadata for the series:

```json
{
  "name": "@brainstack/hub Series",
  "description": "Master event-driven architecture with @brainstack/hub...",
  "slug": "brainstack-hub-series",
  "coverImage": "/images/brainstack-hub.png",
  "category": "Event-Driven Architecture",
  "githubRepo": "https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/hub/series",
  "status": "published",
  "publishDate": "2024-04-15",
  "releaseSchedule": {
    "frequency": "weekly",
    "startDate": "2024-04-15"
  }
}
```

### Publication Status Fields

Series include the following publication status fields:

- `status`: The current publication status of the series
  - `draft`: Series is still being written and edited
  - `ready`: Series is complete but waiting to be scheduled
  - `scheduled`: Series is complete and has a future publication date
  - `published`: Series is live and visible to readers
  - `featured`: Published series that is highlighted or promoted
- `publishDate`: The date when the series should be published (ISO 8601 format)
- `releaseSchedule`: Configuration for article release scheduling
  - `frequency`: How often to release articles (`weekly`, `biweekly`, or `monthly`)
  - `startDate`: When to start releasing articles (ISO 8601 format)

## Article Structure

Each article is an MDX file with the following structure:

```mdx
import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
  title: "Understanding Event-Driven Architecture with @brainstack/hub",
  description: "Deep dive into event-driven architecture...",
  author: "Martin Ouimet",
  date: "2024-01-15",
  order: 1,
  seriesSlug: "brainstack-hub-series",
  slug: "understanding-event-hub",
  tags: ["event-driven", "architecture", "brainstack", "hub", "typescript"],
  category: "Architecture",
  githubRepo: "https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack/hub/series/01-understanding",
  status: "published",
  publishDate: "2024-01-15"
}

export const metadata = {
  title: article.title,
  description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} />

# Article Content

Content goes here...
```

### Publication Status Fields

Articles include the following publication status fields:

- `status`: The current publication status of the article
  - `draft`: Article is still being written and edited
  - `ready`: Article is complete but waiting to be scheduled
  - `scheduled`: Article is complete and has a future publication date
  - `published`: Article is live and visible to readers
  - `featured`: Published article that is highlighted or promoted
- `publishDate`: The date when the article should be published (ISO 8601 format)

## Standalone Articles

Standalone articles (not part of any series) are stored in the `standalone/` directory. They have the same structure as series articles, but without the `order` and `seriesSlug` properties.

## URL Structure

- Series index: `/series`
- Series detail: `/series/[seriesSlug]`
- Series article: `/series/[seriesSlug]/[articleSlug]`
- Articles index: `/articles`
- Standalone article: `/articles/[articleSlug]`

## Adding New Content

### Adding a New Series

1. Create a new directory under `series/` with the series slug
2. Create a `_series.json` file with the series metadata
3. Add article files with the naming convention: `{order}-{slug}.mdx`

### Adding a New Article to an Existing Series

1. Create a new MDX file in the series directory with the naming convention: `{order}-{slug}.mdx`
2. Include the article metadata with the correct `seriesSlug` and `order`

### Adding a New Standalone Article

1. Create a new MDX file in the `standalone/` directory
2. Include the article metadata without `seriesSlug` and `order` properties

## Content Visibility

Content visibility is determined by the `status` and `publishDate` fields:

- In development mode, all content is visible regardless of status
- In production mode:
  - Content with `status` of `published` or `featured` is always visible
  - Content with `status` of `scheduled` is visible only if the current date is on or after the `publishDate`
  - Content with `status` of `draft` or `ready` is never visible
