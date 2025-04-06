import { NewSeriesForm } from '@/components/admin/NewSeriesForm';
import { createSeries } from '@/lib/admin/fileSystem';
import Link from 'next/link';

export const metadata = {
  title: 'Create New Series',
};

export default function NewSeriesPage() {
  // Server action to create a new series
  async function saveSeries(data: any) {
    'use server';
    
    const { name, description, ...metadata } = data;
    await createSeries(name, description, metadata);
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Series</h1>
        <Link
          href="/admin/series"
          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Back to Series
        </Link>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden rounded-lg p-6">
        <NewSeriesForm onSave={saveSeries} />
      </div>
    </div>
  );
}
