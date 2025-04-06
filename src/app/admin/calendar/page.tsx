import { getAllArticles, getAllSeries } from '@/lib/content';
import { ContentCalendar } from '@/components/admin/Calendar';

export const metadata = {
  title: 'Content Calendar',
};

export default async function CalendarPage() {
  const articles = await getAllArticles();
  const series = await getAllSeries();

  return <ContentCalendar articles={articles} series={series} />;
}
