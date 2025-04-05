import Link from 'next/link';

/**
 * Banner displayed when preview mode is active
 */
export function PreviewBanner() {
  return (
    <div className="bg-yellow-500 text-black p-2 text-center sticky top-0 z-50">
      <p className="text-sm font-medium">
        Preview Mode Active - 
        <Link href="/api/preview/exit" className="underline ml-1 hover:text-yellow-800">
          Exit Preview Mode
        </Link>
      </p>
    </div>
  );
}
