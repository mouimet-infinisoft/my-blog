import { Metadata } from "next";

import { projects } from "@/lib/projects-data";
import { SpotlightCard } from "@/components/spotlight-card";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Projects",
    description: "Explore my journey in AI-driven software development, from foundational frameworks to experimental methodologies.",
  };
}

export default async function SocialPage() {
  return (
    <div className="container pb-10">
      <article className="prose mx-auto max-w-5xl dark:prose-invert prose-headings:mb-3 prose-headings:mt-8 prose-headings:font-heading prose-headings:font-bold prose-headings:leading-tight hover:prose-a:text-accent-foreground prose-a:prose-headings:no-underline">
        <h1 className="mt-0 ">Projects</h1>
        <p className="m-0 text-xl ">
          Explore my journey in AI-driven software development, from foundational frameworks to experimental methodologies. Each project represents years of experimentation, learning, and exploration in the intersection of artificial intelligence and software engineering.
        </p>
        <hr className="my-4" />
        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {projects.map((item) => (
            <SpotlightCard key={item.href} {...item} />
          ))}
        </div>
      </article>
    </div>
  );
}
