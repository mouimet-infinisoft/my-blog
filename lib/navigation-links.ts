import { ContentNavItem, NavItem } from "@/types";

import siteMetadata, { defaultAuthor } from "@/lib/metadata";

const content: ContentNavItem[] = [
  {
    title: "Blog",
    href: "/posts",
    description: "Articles about AI, software engineering, and technology leadership",
  },
  {
    title: "Newsletter",
    href: "/#newsletter",
    description: "Subscribe for early access to new articles",
  }
];

export const navigationLinks: NavItem[] = [
  {
    title: "Content",
    content,
  },
  {
    title: "Projects",
    href: "/projects",
  },

  {
    title: "Now",
    href: "/now",
  },
];
