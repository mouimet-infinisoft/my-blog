import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner';
import { isDevelopment } from '@/lib/environment';
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Additional security check - only render in development
  if (!isDevelopment()) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AdminWarningBanner />
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
