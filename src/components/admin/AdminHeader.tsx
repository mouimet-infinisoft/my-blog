import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="bg-white dark:bg-zinc-800 shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Content Admin</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/admin" className="hover:text-teal-500">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/articles" className="hover:text-teal-500">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/admin/series" className="hover:text-teal-500">
                  Series
                </Link>
              </li>
              <li>
                <Link href="/admin/calendar" className="hover:text-teal-500">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-teal-500">
                  View Site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
