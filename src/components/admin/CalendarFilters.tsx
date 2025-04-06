'use client';

interface CalendarFiltersProps {
  categories: string[];
  filters: {
    contentType: string;
    status: string;
    category: string;
  };
  onFilterChange: (filters: any) => void;
}

export function CalendarFilters({ categories, filters, onFilterChange }: CalendarFiltersProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Content Type
          </label>
          <select
            id="contentType"
            name="contentType"
            value={filters.contentType}
            onChange={(e) => onFilterChange({ contentType: e.target.value })}
            className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="all">All Content</option>
            <option value="article">Articles Only</option>
            <option value="series">Series Only</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
