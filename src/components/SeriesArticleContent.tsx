'use client'

import React from 'react'
import { MDXProvider } from '@mdx-js/react'

// Custom components for MDX content
const components = {
  // Override heading components to add IDs for anchor links
  h1: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => {
    const id = children?.toString().toLowerCase().replace(/\s+/g, '-')
    return <h1 id={id as string} {...props}>{children}</h1>
  },
  h2: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => {
    const id = children?.toString().toLowerCase().replace(/\s+/g, '-')
    return <h2 id={id as string} {...props}>{children}</h2>
  },
  h3: ({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) => {
    const id = children?.toString().toLowerCase().replace(/\s+/g, '-')
    return <h3 id={id as string} {...props}>{children}</h3>
  },
  // Add custom styling for code blocks
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <pre className="rounded-md bg-gray-100 p-4 dark:bg-gray-800" {...props} />
  ),
  // Add custom styling for inline code
  code: ({ children, ...props }: React.HTMLProps<HTMLElement>) => (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800" {...props}>
      {children}
    </code>
  ),
  // Add custom styling for links
  a: ({ children, ...props }: React.HTMLProps<HTMLAnchorElement>) => (
    <a className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" {...props}>
      {children}
    </a>
  ),
}

interface SeriesArticleContentProps {
  children: React.ReactNode
}

export function SeriesArticleContent({ children }: SeriesArticleContentProps) {
  return (
    <div className="series-article-content prose prose-zinc dark:prose-invert">
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </div>
  )
}
