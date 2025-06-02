import { AuthorType, SiteMetaData } from "@/types";

import { socialProfiles } from "./social-data";

export const BASE_URL =
  `https://${process.env.VERCEL_URL}` ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

export const defaultAuthor: AuthorType = {
  name: "Martin Ouimet",
  handle: "@InfinisoftI",
  socialProfiles,
  email: "mart@infinisoft.world",
  website: "https://blog.infinisoft.world",
  jobTitle: "Technology Leader & AI Solutions Architect",
  company: "Infinisoft World Inc.",
  availableForWork: true,
  location: {
    city: "Montreal",
    media: "/martin-portrait.jpg",
  },
};

const defaultTitle = `${defaultAuthor.name}'s Blog`;
const defaultDescription = `I'm ${defaultAuthor.name}, an innovative technology leader with 20+ years of experience transforming businesses through AI and cloud solutions. Founder and CEO of Infinisoft World.`;

const siteMetadata: SiteMetaData = {
  title: {
    template: `%s | ${defaultTitle}`,
    default: defaultTitle,
  },
  description: defaultDescription,
  siteRepo: "https://github.com/mart-infinisoft/blog-template",
  newsletterProvider: "mailerlite",
  newsletterUrl: "https://blog.infinisoft.world",
  analyticsProvider: "umami",
  defaultTheme: "system",
  activeAnnouncement: false,
  announcement: {
    buttonText: "Support on DevHunt →",
    link: "https://devhunt.org/tool/modern-developer-blog-template-digital-garden-starter",
  },
  postsPerPage: 10,
  postsOnHomePage: 8,
  projectsOnHomePage: 4,
};

export default siteMetadata;
