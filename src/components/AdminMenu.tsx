import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" 
            clipRule="evenodd" 
          />
        </svg>
        Admin
      </button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-4 w-48 border border-gray-200 dark:border-zinc-700">
          <div className="space-y-2">
            <Link 
              href="/admin" 
              className={`block px-4 py-2 rounded-md ${
                pathname === '/admin' 
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/articles/new" 
              className={`block px-4 py-2 rounded-md ${
                pathname === '/admin/articles/new' 
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              New Article
            </Link>
            <Link 
              href="/admin/series/new" 
              className={`block px-4 py-2 rounded-md ${
                pathname === '/admin/series/new' 
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              New Series
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
