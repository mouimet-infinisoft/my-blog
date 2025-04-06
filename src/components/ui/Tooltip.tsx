'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 transform whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white dark:bg-zinc-700">
          {content}
          <div className="absolute left-1/2 top-full -ml-1 h-0 w-0 -translate-x-1/2 transform border-4 border-transparent border-t-zinc-800 dark:border-t-zinc-700"></div>
        </div>
      )}
    </div>
  );
}
