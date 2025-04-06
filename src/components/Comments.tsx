'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface CommentsProps {
  category: string;
  path: string;
}

export function Comments({ category, path }: CommentsProps) {
  const { resolvedTheme } = useTheme();
  const commentsRef = useRef<HTMLDivElement>(null);
  const theme = resolvedTheme === 'dark' ? 'dark_dimmed' : 'light';
  
  useEffect(() => {
    // Remove any existing script
    const existingScript = document.getElementById('giscus-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Remove any existing giscus container
    if (commentsRef.current) {
      while (commentsRef.current.firstChild) {
        commentsRef.current.removeChild(commentsRef.current.firstChild);
      }
    }
    
    // Add the new script
    const script = document.createElement('script');
    script.id = 'giscus-script';
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'mouimet-infinisoft/my-blog');
    script.setAttribute('data-repo-id', 'R_kgDOOGCLDQ');
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', 'DIC_kwDOOGCLDc4Co1P2');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    
    if (commentsRef.current) {
      commentsRef.current.appendChild(script);
    }
  }, [category, path, theme]);
  
  return (
    <div className="mt-10 pt-10 border-t border-zinc-200 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      <div ref={commentsRef} />
    </div>
  );
}
