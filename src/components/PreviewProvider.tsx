'use client';

import { PreviewBanner } from './PreviewBanner';
import { useEffect, useState } from 'react';

/**
 * Provider component that detects preview mode and renders the preview banner
 */
export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check for preview mode by looking for the preview cookie
    const cookies = document.cookie.split(';');
    const hasPreviewCookie = cookies.some(cookie =>
      cookie.trim().startsWith('__next_preview_data=') ||
      cookie.trim().startsWith('__prerender_bypass=')
    );

    setIsPreview(hasPreviewCookie);
  }, []);

  return (
    <>
      {isPreview && <PreviewBanner />}
      {children}
    </>
  );
}
