import { getAllArticles, getAllSeries } from '@/lib/content';
import { Dashboard } from '@/components/admin/Dashboard';

export const metadata = {
  title: 'Content Admin Dashboard',
};

export default async function AdminDashboardPage() {
  const articles = await getAllArticles();
  const series = await getAllSeries();
  
  return <Dashboard articles={articles} series={series} />;
}
