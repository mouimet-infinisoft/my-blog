// contentlayer.config.ts
import { makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// lib/content-definitions/page.ts
import { defineDocumentType } from "contentlayer/source-files";
var Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    description: {
      type: "string"
    },
    lastUpdatedDate: {
      type: "date"
    },
    status: {
      type: "enum",
      options: ["draft", "published"],
      required: true
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    }
  }
}));

// lib/content-definitions/post.ts
import { defineDocumentType as defineDocumentType2 } from "contentlayer/source-files";
import GithubSlugger from "github-slugger";

// lib/utils.ts
import { clsx } from "clsx";
import { compareDesc } from "date-fns";
import { twMerge } from "tailwind-merge";

// lib/social-data.ts
var socialProfiles = [
  {
    name: "github",
    link: "https://github.com/mouimet-infinisoft"
  },
  {
    name: "linkedin",
    link: "https://www.linkedin.com/in/mouimet-infinisoft/"
  },
  {
    name: "x",
    link: "https://x.com/InfinisoftI"
  }
];

// lib/metadata.ts
var BASE_URL = `https://${process.env.VERCEL_URL}` || process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3e3}`;
var defaultAuthor = {
  name: "Martin Ouimet",
  handle: "@InfinisoftI",
  socialProfiles,
  email: "mart@infinisoft.world",
  website: "https://blog.infinisoft.world",
  jobTitle: "Technology Leader & AI Solutions Architect",
  company: "Infinisoft World Inc.",
  availableForWork: true,
  location: {
    city: "Montreal",
    media: "/martin-portrait.jpg"
  }
};
var defaultTitle = `${defaultAuthor.name}'s Blog`;
var defaultDescription = `I'm ${defaultAuthor.name}, an innovative technology leader with 20+ years of experience transforming businesses through AI and cloud solutions. Founder and CEO of Infinisoft World.`;
var siteMetadata = {
  title: {
    template: `%s | ${defaultTitle}`,
    default: defaultTitle
  },
  description: defaultDescription,
  siteRepo: "https://github.com/mart-infinisoft/blog-template",
  newsletterProvider: "mailerlite",
  newsletterUrl: "https://blog.infinisoft.world",
  analyticsProvider: "umami",
  defaultTheme: "system",
  activeAnnouncement: false,
  announcement: {
    buttonText: "Support on DevHunt \u2192",
    link: "https://devhunt.org/tool/modern-developer-blog-template-digital-garden-starter"
  },
  postsPerPage: 10,
  postsOnHomePage: 8,
  projectsOnHomePage: 4
};

// lib/utils.ts
var calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const noOfWords = text.split(/\s/g).length;
  const minutes = noOfWords / wordsPerMinute;
  const readTime = Math.ceil(minutes);
  return readTime;
};

// lib/content-definitions/author.ts
import { defineNestedType } from "contentlayer/source-files";
var Author = defineNestedType(() => ({
  name: "Author",
  fields: {
    name: { type: "string", required: true },
    image: { type: "string" }
  }
}));

// lib/content-definitions/series.ts
import { defineNestedType as defineNestedType2 } from "contentlayer/source-files";
var Series = defineNestedType2(() => ({
  name: "Series",
  fields: {
    title: {
      type: "string",
      required: true
    },
    order: {
      type: "number",
      required: true
    }
  }
}));

// lib/content-definitions/post.ts
var tagOptions = [
  "starter",
  "development",
  "docs",
  "freelancing",
  "opinion",
  "jamstack",
  "frontend",
  "development",
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "gatsby",
  "tailwindcss",
  "ai",
  "sdlc",
  "voice-driven-development",
  "mobile-development",
  "software-engineering",
  "case-study"
];
var Post = defineDocumentType2(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true
    },
    description: {
      type: "string"
    },
    publishedDate: {
      type: "date",
      required: true
    },
    lastUpdatedDate: {
      type: "date"
    },
    tags: {
      type: "list",
      of: { type: "string", options: tagOptions },
      required: false
    },
    series: {
      type: "nested",
      of: Series
    },
    author: {
      type: "nested",
      of: Author
    },
    status: {
      type: "enum",
      options: ["draft", "published"],
      required: true
    }
  },
  computedFields: {
    tagSlugs: {
      type: "list",
      resolve: async (doc) => {
        if (doc.tags) {
          const tags = [...doc?.tags ?? []];
          const slugger = new GithubSlugger();
          return tags.map((tag) => slugger.slug(tag));
        }
        return null;
      }
    },
    readTimeMinutes: {
      type: "number",
      resolve: (doc) => calculateReadingTime(doc.body.raw)
    },
    headings: {
      type: "json",
      resolve: async (doc) => {
        const slugger = new GithubSlugger();
        const regXHeader = /\n\n(?<flag>#{1,6})\s+(?<content>.+)/g;
        const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(({ groups }) => {
          const flag = groups?.flag;
          const content = groups?.content;
          return {
            heading: flag?.length,
            text: content,
            slug: content ? slugger.slug(content) : void 0
          };
        });
        return headings;
      }
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    }
  }
}));

// contentlayer.config.ts
var HEADING_LINK_ANCHOR = `anchor-heading-link`;
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [Post, Page],
  mdx: {
    esbuildOptions(options) {
      options.target = "esnext";
      return options;
    },
    remarkPlugins: [[remarkGfm], [remarkMath]],
    rehypePlugins: [
      [rehypeKatex],
      [rehypeSlug],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: [HEADING_LINK_ANCHOR]
          }
        }
      ],
      [
        rehypePrettyCode,
        {
          // prepacked themes
          // https://github.com/shikijs/shiki/blob/main/docs/themes.md
          theme: "github-dark",
          // https://stackoverflow.com/questions/76549262/onvisithighlightedline-cannot-push-classname-using-rehype-pretty-code
          // FIXME: maybe properly type this
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
            node.properties.className = ["line"];
          },
          // FIXME: maybe properly type this
          onVisitHighlightedLine(node) {
            node.properties.className?.push("line--highlighted");
          }
        }
      ]
    ]
  }
});
export {
  HEADING_LINK_ANCHOR,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-Q2QCAZLL.mjs.map
