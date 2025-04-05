'use client'

import React, { useEffect, useState } from 'react'
import { SeriesArticleContent } from './SeriesArticleContent'

interface SeriesArticleRendererProps {
  MDXComponent: React.ComponentType<any>
}

export function SeriesArticleRenderer({ MDXComponent }: SeriesArticleRendererProps) {
  const [content, setContent] = useState<React.ReactNode | null>(null)
  
  useEffect(() => {
    // Create a temporary div to render the MDX component
    const tempDiv = document.createElement('div')
    const tempRoot = document.createDocumentFragment()
    
    // Render the MDX component to the temporary div
    const cleanup = () => {
      try {
        // Extract the content from the rendered MDX component
        setContent(<MDXComponent />)
      } catch (error) {
        console.error('Error rendering MDX component:', error)
      }
    }
    
    // Call cleanup immediately
    cleanup()
    
    // Return cleanup function
    return () => {
      tempDiv.innerHTML = ''
    }
  }, [MDXComponent])
  
  return (
    <SeriesArticleContent>
      {content}
    </SeriesArticleContent>
  )
}
