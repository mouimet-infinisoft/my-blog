'use client';

import { useState, useMemo } from 'react';
import { ArticleWithSlug, Series, ArticleStatus } from '@/lib/types';
import { CalendarFilters } from './CalendarFilters';
import { SeriesTimeline } from './SeriesTimeline';
import { exportCalendarToCSV, exportCalendarToICS } from '@/lib/admin/calendarExport';
import Link from 'next/link';

interface CalendarProps {
  articles: ArticleWithSlug[];
  series: Series[];
}

type CalendarItem = {
  id: string;
  title: string;
  date: string;
  type: 'article' | 'series';
  status: ArticleStatus;
  category?: string;
  slug: string;
  seriesSlug?: string;
};

type CalendarView = 'month' | 'timeline';

export function ContentCalendar({ articles, series }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [filters, setFilters] = useState({
    contentType: 'all', // 'all', 'articles', 'series'
    status: 'all', // 'all', 'draft', 'ready', 'scheduled', 'published', 'featured'
    category: 'all',
  });

  // Convert articles and series to calendar items
  const calendarItems = useMemo(() => {
    const items: CalendarItem[] = [];

    // Add articles
    articles.forEach(article => {
      if (article.publishDate) {
        items.push({
          id: `article-${article.slug}`,
          title: article.title,
          date: article.publishDate,
          type: 'article',
          status: article.status || 'draft',
          category: article.category,
          slug: article.slug,
          seriesSlug: article.seriesSlug,
        });
      }
    });

    // Add series
    series.forEach(s => {
      if (s.publishDate) {
        items.push({
          id: `series-${s.slug}`,
          title: s.name,
          date: s.publishDate,
          type: 'series',
          status: s.status || 'draft',
          category: s.category,
          slug: s.slug,
        });
      }
    });

    return items;
  }, [articles, series]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return calendarItems.filter(item => {
      if (filters.contentType !== 'all' && filters.contentType === 'article' && item.type !== 'article') {
        return false;
      }
      if (filters.contentType !== 'all' && filters.contentType === 'series' && item.type !== 'series') {
        return false;
      }
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      return true;
    });
  }, [calendarItems, filters]);

  // Get all categories for filter options
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    articles.forEach(article => {
      if (article.category) {
        categorySet.add(article.category);
      }
    });
    series.forEach(s => {
      if (s.category) {
        categorySet.add(s.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [articles, series]);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle export
  const handleExport = (format: 'csv' | 'ics') => {
    if (format === 'csv') {
      exportCalendarToCSV(filteredItems);
    } else {
      exportCalendarToICS(filteredItems);
    }
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Create array of days
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    // Group days into weeks
    const weeks = [];
    let week = [];
    
    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      
      if (week.length === 7 || i === days.length - 1) {
        // Pad last week if needed
        while (week.length < 7) {
          week.push(null);
        }
        
        weeks.push(week);
        week = [];
      }
    }
    
    return weeks;
  }, [currentDate]);

  // Get items for a specific day
  const getItemsForDay = (day: number | null) => {
    if (day === null) return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return filteredItems.filter(item => item.date === dateStr);
  };

  // Render month view
  const renderMonthView = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              &lt;
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-sm rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              &gt;
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center border-b border-zinc-200 dark:border-zinc-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr border-b border-zinc-200 dark:border-zinc-700">
          {calendarGrid.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const isToday = day !== null && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear() && 
                day === new Date().getDate();
              
              const dayItems = getItemsForDay(day);
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`min-h-[100px] p-1 border-r border-b border-zinc-200 dark:border-zinc-700 ${
                    isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                  } ${day === null ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}
                >
                  {day !== null && (
                    <>
                      <div className="text-right text-sm font-medium p-1">
                        {day}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[80px]">
                        {dayItems.map(item => (
                          <div 
                            key={item.id}
                            className={`text-xs p-1 rounded truncate ${
                              item.type === 'series' 
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200' 
                                : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200'
                            } ${
                              item.status === 'draft' ? 'opacity-60' : ''
                            }`}
                          >
                            <Link 
                              href={item.type === 'series' 
                                ? `/admin/series/${item.slug}` 
                                : item.seriesSlug 
                                  ? `/admin/series/${item.seriesSlug}/articles/${item.slug}` 
                                  : `/admin/articles/${item.slug}`
                              }
                              className="hover:underline"
                            >
                              {item.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Plan and visualize your content schedule
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'month' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`px-3 py-1 text-sm rounded ${
              view === 'timeline' 
                ? 'bg-teal-600 text-white' 
                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1 text-sm rounded bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('ics')}
            className="px-3 py-1 text-sm rounded bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            Export ICS
          </button>
        </div>
      </div>
      
      <CalendarFilters 
        categories={categories} 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {view === 'month' ? renderMonthView() : <SeriesTimeline series={series} />}
    </div>
  );
}
