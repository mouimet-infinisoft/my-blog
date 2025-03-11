import clsx from 'clsx'

export function Prose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div 
      className={clsx(
        className,
        'prose prose-zinc max-w-none dark:prose-invert',
        // Headings
        'prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:font-semibold',
        'prose-h2:text-2xl prose-h2:mt-12 prose-h2:pb-4',
        'prose-h3:text-xl prose-h3:mt-8 prose-h3:pb-2',
        // Lead paragraph
        'prose-lead:text-zinc-500 dark:prose-lead:text-zinc-400',
        // Links
        'prose-a:font-semibold prose-a:text-teal-500 hover:prose-a:text-teal-600',
        // Lists
        'prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6',
        'prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6',
        'prose-li:my-2 prose-li:pl-2',
        // Code blocks
        'prose-pre:rounded-xl prose-pre:bg-zinc-900 prose-pre:shadow-lg dark:prose-pre:bg-zinc-800/60 dark:prose-pre:shadow-none dark:prose-pre:ring-1 dark:prose-pre:ring-zinc-300/10',
        'prose-pre:my-8 prose-pre:p-6',
        // Inline code
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-code:rounded-md prose-code:bg-zinc-100 prose-code:px-2 prose-code:py-0.5 dark:prose-code:bg-zinc-800',
        // Blockquotes
        'prose-blockquote:border-l-2 prose-blockquote:border-teal-500 prose-blockquote:pl-6 prose-blockquote:italic',
        // Tables
        'prose-table:my-8 prose-table:border-collapse',
        'prose-th:border prose-th:border-zinc-300 prose-th:p-3 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800',
        'prose-td:border prose-td:border-zinc-300 prose-td:p-3',
        // Images
        'prose-img:rounded-xl prose-img:shadow-lg'
      )} 
      {...props} 
    />
  )
}
