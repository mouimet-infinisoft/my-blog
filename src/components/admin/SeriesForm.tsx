'use client';

import { useState, FormEvent } from 'react';
import { Series, ArticleStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface SeriesFormProps {
  series: Series;
  onSave: (data: Partial<Series>) => Promise<void>;
}

export function SeriesForm({ series, onSave }: SeriesFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: series.name,
    description: series.description,
    status: series.status || 'draft',
    publishDate: series.publishDate || '',
    category: series.category || '',
    releaseSchedule: {
      frequency: series.releaseSchedule?.frequency || 'weekly',
      startDate: series.releaseSchedule?.startDate || '',
    },
    socialMedia: {
      linkedin: series.socialMedia?.linkedin || false,
      twitter: series.socialMedia?.twitter || false,
      facebook: series.socialMedia?.facebook || false,
      devto: series.socialMedia?.devto || false,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    if (name.startsWith('releaseSchedule.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        releaseSchedule: {
          ...prev.releaseSchedule,
          [field]: inputValue,
        },
      }));
    } else if (name.startsWith('socialMedia.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: inputValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data for saving
      const dataToSave: Partial<Series> = {
        name: formData.name,
        description: formData.description,
        status: formData.status as ArticleStatus,
        publishDate: formData.publishDate || undefined,
        category: formData.category || undefined,
        socialMedia: {
          linkedin: formData.socialMedia.linkedin,
          twitter: formData.socialMedia.twitter,
          facebook: formData.socialMedia.facebook,
          devto: formData.socialMedia.devto,
        },
      };

      // Only include releaseSchedule if startDate is provided
      if (formData.releaseSchedule.startDate) {
        dataToSave.releaseSchedule = {
          frequency: formData.releaseSchedule.frequency,
          startDate: formData.releaseSchedule.startDate,
        };
      }

      await onSave(dataToSave);
      setSuccess(true);
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-400">Series updated successfully!</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        >
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Publish Date
        </label>
        <input
          type="date"
          id="publishDate"
          name="publishDate"
          value={formData.publishDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        />
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Required for scheduled content
        </p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Release Schedule</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="releaseSchedule.frequency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Frequency
            </label>
            <select
              id="releaseSchedule.frequency"
              name="releaseSchedule.frequency"
              value={formData.releaseSchedule.frequency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label htmlFor="releaseSchedule.startDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Start Date
            </label>
            <input
              type="date"
              id="releaseSchedule.startDate"
              name="releaseSchedule.startDate"
              value={formData.releaseSchedule.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              When to start releasing articles in this series
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h3 className="text-lg font-medium mb-4">Social Media</h3>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Select platforms where this series should be shared when published
        </p>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="socialMedia.linkedin"
              name="socialMedia.linkedin"
              checked={formData.socialMedia.linkedin}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label htmlFor="socialMedia.linkedin" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              LinkedIn
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="socialMedia.twitter"
              name="socialMedia.twitter"
              checked={formData.socialMedia.twitter}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label htmlFor="socialMedia.twitter" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              Twitter
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="socialMedia.facebook"
              name="socialMedia.facebook"
              checked={formData.socialMedia.facebook}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label htmlFor="socialMedia.facebook" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              Facebook
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="socialMedia.devto"
              name="socialMedia.devto"
              checked={formData.socialMedia.devto}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <label htmlFor="socialMedia.devto" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
              DEV.to
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
