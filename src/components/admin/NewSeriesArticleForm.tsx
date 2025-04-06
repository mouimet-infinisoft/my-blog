'use client';

import { useState, FormEvent } from 'react';
import { ArticleStatus, Series, SocialMediaTargets } from '@/lib/types';
import { SocialMediaSelector } from './SocialMediaSelector';
import { useRouter } from 'next/navigation';
import { MDXEditor } from './MDXEditor';

interface NewSeriesArticleFormProps {
  series: Series;
  onSave: (data: {
    title: string;
    content: string;
    description: string;
    status: ArticleStatus;
    publishDate?: string;
    category?: string;
    tags?: string[];
    order: number;
    socialMedia?: SocialMediaTargets;
  }) => Promise<void>;
}

export function NewSeriesArticleForm({ series, onSave }: NewSeriesArticleFormProps) {
  const router = useRouter();

  // Calculate next order number
  const nextOrder = series.articles.length > 0
    ? Math.max(...series.articles.map(a => a.order || 0)) + 1
    : 1;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    status: series.status || 'draft' as ArticleStatus,
    publishDate: '',
    category: series.category || '',
    tags: '',
    order: nextOrder,
    socialMedia: series.socialMedia || {
      linkedin: false,
      twitter: false,
      facebook: false,
      devto: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) : value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
    }));
  };

  const handleSocialMediaChange = (socialMedia: SocialMediaTargets) => {
    setFormData(prev => ({
      ...prev,
      socialMedia,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

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
        content: formData.content,
        description: formData.description,
        status: formData.status,
        publishDate: formData.publishDate || undefined,
        tags,
        category: formData.category || undefined,
        order: formData.order,
        socialMedia: formData.socialMedia,
      };

      await onSave(dataToSave);
      setSuccess(true);

      // Reset form after successful save
      setFormData({
        title: '',
        content: '',
        description: '',
        status: series.status || 'draft',
        publishDate: '',
        category: series.category || '',
        tags: '',
        order: formData.order + 1, // Increment order for next article
        socialMedia: series.socialMedia || {
          linkedin: false,
          twitter: false,
          facebook: false,
          devto: false,
        },
      });

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
          <p className="text-green-700 dark:text-green-400">Article created successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
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
          <label htmlFor="order" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Order
          </label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
          />
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Position in series
          </p>
        </div>
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
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Content (Markdown)
        </label>
        <div className="mt-1 border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden">
          <MDXEditor
            value={formData.content}
            onChange={handleContentChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Share on Social Media
        </label>
        <SocialMediaSelector
          value={formData.socialMedia}
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
          {isSubmitting ? 'Creating...' : 'Create Article'}
        </button>
      </div>
    </form>
  );
}
