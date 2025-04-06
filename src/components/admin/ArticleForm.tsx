'use client';

import { useState, FormEvent } from 'react';
import { ArticleWithSlug, ArticleStatus, Series } from '@/lib/types';
import { SocialMediaSelector } from './SocialMediaSelector';
import { useRouter } from 'next/navigation';

interface ArticleFormProps {
  article: ArticleWithSlug;
  series?: Series;
  onSave: (data: Partial<ArticleWithSlug>) => Promise<void>;
}

export function ArticleForm({ article, series, onSave }: ArticleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: article.title,
    description: article.description,
    status: article.status || 'draft',
    publishDate: article.publishDate || '',
    tags: article.tags?.join(', ') || '',
    category: article.category || '',
    shareOnLinkedin: article.shareOnLinkedin || false,
    shareOnTwitter: article.shareOnTwitter || false,
    shareOnFacebook: article.shareOnFacebook || false,
    shareOnDevto: article.shareOnDevto || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [platform === 'linkedin' ? 'shareOnLinkedin' :
       platform === 'twitter' ? 'shareOnTwitter' :
       platform === 'facebook' ? 'shareOnFacebook' :
       'shareOnDevto']: checked,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Process tags
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : undefined;

      // Prepare data for saving
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        status: formData.status as ArticleStatus,
        publishDate: formData.publishDate || undefined,
        tags,
        category: formData.category || undefined,
        shareOnLinkedin: formData.shareOnLinkedin,
        shareOnTwitter: formData.shareOnTwitter,
        shareOnFacebook: formData.shareOnFacebook,
        shareOnDevto: formData.shareOnDevto,
      };

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
          <p className="text-green-700 dark:text-green-400">Article updated successfully!</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
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
          {series?.releaseSchedule?.startDate && article.status === 'scheduled' && (
            <span className="ml-2 text-xs text-teal-600 dark:text-teal-400">
              (Set by series schedule)
            </span>
          )}
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
          {series?.releaseSchedule?.startDate && article.status === 'scheduled' && (
            <>
              <br />
              <span className="text-teal-600 dark:text-teal-400">
                This date was automatically set based on the series schedule.
                You can override it manually if needed.
              </span>
            </>
          )}
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

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="tag1, tag2, tag3"
          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
        />
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Comma-separated list of tags
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Share on Social Media
        </label>
        <SocialMediaSelector
          linkedin={formData.shareOnLinkedin}
          twitter={formData.shareOnTwitter}
          facebook={formData.shareOnFacebook}
          devto={formData.shareOnDevto}
          onChange={handleSocialMediaChange}
        />
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select platforms where this content should be shared when published
        </p>
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
