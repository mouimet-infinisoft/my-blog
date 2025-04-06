/**
 * Exports calendar items to CSV format
 * 
 * @param items The calendar items to export
 */
export function exportCalendarToCSV(items: any[]) {
  // Define CSV headers
  const headers = ['Title', 'Type', 'Status', 'Date', 'Category', 'URL'];
  
  // Convert items to CSV rows
  const rows = items.map(item => {
    const url = item.type === 'series' 
      ? `/series/${item.slug}` 
      : item.seriesSlug 
        ? `/series/${item.seriesSlug}/${item.slug}` 
        : `/articles/${item.slug}`;
    
    return [
      item.title,
      item.type,
      item.status,
      item.date,
      item.category || '',
      window.location.origin + url
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `content-calendar-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports calendar items to ICS format
 * 
 * @param items The calendar items to export
 */
export function exportCalendarToICS(items: any[]) {
  // ICS file header
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My Blog//Content Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');
  
  // Add events for each item
  items.forEach(item => {
    const date = new Date(item.date);
    const dateStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const url = item.type === 'series' 
      ? `/series/${item.slug}` 
      : item.seriesSlug 
        ? `/series/${item.seriesSlug}/${item.slug}` 
        : `/articles/${item.slug}`;
    
    const fullUrl = window.location.origin + url;
    
    icsContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${item.id}@myblog`,
      `DTSTAMP:${dateStr}`,
      `DTSTART:${dateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${item.title} (${item.type})`,
      `DESCRIPTION:Status: ${item.status}\\nCategory: ${item.category || 'None'}\\nURL: ${fullUrl}`,
      `URL:${fullUrl}`,
      `CATEGORIES:${item.category || 'Uncategorized'}`,
      'END:VEVENT'
    ].join('\r\n');
  });
  
  // ICS file footer
  icsContent += '\r\n' + 'END:VCALENDAR';
  
  // Create download link
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `content-calendar-${new Date().toISOString().split('T')[0]}.ics`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
