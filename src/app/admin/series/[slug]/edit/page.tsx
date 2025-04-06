import { getAllSeries } from '@/lib/content';
import { SeriesForm } from '@/components/admin/SeriesForm';
import { updateSeriesMetadata } from '@/lib/admin/fileSystem';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata = {
  title: 'Edit Series',
};

export default async function EditSeriesPage({ params }: PageProps) {
  const { slug } = params;
  
  try {
    const allSeries = await getAllSeries();
    const series = allSeries.find(s => s.slug === slug);
    
    if (!series) {
      return notFound();
    }
    
    // Server action to save series changes
    async function saveSeries(data: any) {
      'use server';
      
      await updateSeriesMetadata(slug, data);
    }
    
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Series: {series.name}</h1>
        <SeriesForm series={series} onSave={saveSeries} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
