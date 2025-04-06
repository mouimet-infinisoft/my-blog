'use client';

import { useState, useEffect } from 'react';

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MDXEditor({ value, onChange }: MDXEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render the editor on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="min-h-[300px] bg-zinc-50 dark:bg-zinc-900 p-4">
        Loading editor...
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-2 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onChange(value + '# ')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '## ')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '### ')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Heading 3"
          >
            H3
          </button>
          <span className="border-r border-zinc-300 dark:border-zinc-700 mx-1"></span>
          <button
            type="button"
            onClick={() => onChange(value + '**Bold**')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '*Italic*')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded italic"
            title="Italic"
          >
            I
          </button>
          <span className="border-r border-zinc-300 dark:border-zinc-700 mx-1"></span>
          <button
            type="button"
            onClick={() => onChange(value + '- List item\n')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Unordered List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '1. List item\n')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Ordered List"
          >
            1. List
          </button>
          <span className="border-r border-zinc-300 dark:border-zinc-700 mx-1"></span>
          <button
            type="button"
            onClick={() => onChange(value + '[Link text](https://example.com)')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '![Image alt text](https://example.com/image.jpg)')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Image"
          >
            🖼️
          </button>
          <button
            type="button"
            onClick={() => onChange(value + '```\ncode block\n```')}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Code Block"
          >
            {'</>'}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[300px] p-4 bg-white dark:bg-zinc-900 w-full focus:outline-none"
        placeholder="Write your content here using Markdown..."
      />
    </div>
  );
}
