"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GitHubCommentsProps {
  title: string;
  slug: string;
}

export const SocialComments = ({ title, slug }: GitHubCommentsProps) => {
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create the script element for giscus
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'Infinisoft-inc/AISDLC');
    script.setAttribute('data-repo-id', 'R_kgDOObV4_w');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOObV4_84CpNG9');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    // Store current ref value
    const currentRef = commentsRef.current;

    // Clear any existing giscus content
    if (currentRef) {
      currentRef.innerHTML = '';
      currentRef.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
  }, [slug]); // Re-run when slug changes

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments & Discussion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Join the conversation about this article. Comments are powered by GitHub Discussions - sign in with your GitHub account to participate.
          </p>

          {/* Giscus comments will be loaded here */}
          <div ref={commentsRef} className="giscus-container" />

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Powered by GitHub Discussions via Giscus • <a
                href="https://github.com/mouimet-infinisoft/AISDLC/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                View all discussions
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
