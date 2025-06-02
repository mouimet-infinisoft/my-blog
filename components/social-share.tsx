import Link from "next/link";
import { siFacebook, siLinkedin, siTwitter, siYcombinator, siReddit, siDevdotto, siMedium, siTelegram, siWhatsapp } from "simple-icons";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SocialShareProps {
  url: string;
  text?: string;
}

export const SocialShare = ({ url, text }: SocialShareProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || "");

  const socialPlatforms = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      icon: siTwitter.path,
      color: "hover:text-blue-400"
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: siLinkedin.path,
      color: "hover:text-blue-600"
    },
    {
      name: "Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
      icon: siReddit.path,
      color: "hover:text-orange-600"
    },
    {
      name: "Hacker News",
      href: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedText}`,
      icon: siYcombinator.path,
      color: "hover:text-orange-500"
    },
    {
      name: "Dev.to",
      href: `https://dev.to/new?prefill=---%0Atitle%3A%20${encodedText}%0Apublished%3A%20false%0Adescription%3A%20%0Atags%3A%20%0A---%0A%0A${encodedUrl}`,
      icon: siDevdotto.path,
      color: "hover:text-purple-500"
    },
    {
      name: "Medium",
      href: `https://medium.com/new-story?url=${encodedUrl}`,
      icon: siMedium.path,
      color: "hover:text-green-600"
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      icon: siTelegram.path,
      color: "hover:text-blue-500"
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: siWhatsapp.path,
      color: "hover:text-green-500"
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedText}&body=Check out this article: ${encodedUrl}`,
      icon: null, // Will use Mail component from lucide-react
      color: "hover:text-gray-600"
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: siFacebook.path,
      color: "hover:text-blue-500"
    }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <div className="flex gap-1">
        {socialPlatforms.map((platform) => (
          <Button
            key={platform.name}
            variant="ghost"
            size="sm"
            asChild
            className={`h-8 w-8 p-0 ${platform.color} transition-colors`}
          >
            <Link
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Share on ${platform.name}`}
            >
              {platform.icon ? (
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d={platform.icon}></path>
                </svg>
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
