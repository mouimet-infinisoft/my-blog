import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Github } from "lucide-react";

import { projects } from "@/lib/projects-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProjectProps {
  params: {
    slug: string;
  };
}

async function getProjectFromParams(params: ProjectProps["params"]) {
  const project = projects.find((project) => project.slug === params.slug);

  if (!project) {
    return null;
  }

  return project;
}

export async function generateMetadata({ params }: ProjectProps): Promise<Metadata> {
  const project = await getProjectFromParams(params);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.shortDescription || project.description,
  };
}

export async function generateStaticParams(): Promise<ProjectProps["params"][]> {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectProps) {
  const project = await getProjectFromParams(params);

  if (!project) {
    notFound();
  }

  return (
    <div className="container max-w-6xl pb-10">
      <article className="prose mx-auto max-w-5xl dark:prose-invert prose-headings:mb-3 prose-headings:mt-8 prose-headings:font-heading prose-headings:font-bold prose-headings:leading-tight hover:prose-a:text-accent-foreground prose-a:prose-headings:no-underline">
        {/* Back Button */}
        <div className="mb-8 not-prose">
          <Button variant="ghost" asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Project Header */}
        <div className="mb-8 not-prose">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="mb-4 text-4xl font-bold">{project.title}</h1>
              <p className="text-xl text-muted-foreground">{project.shortDescription}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{project.status}</Badge>
                <Badge variant="outline">{project.year}</Badge>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {project.demoUrl && (
                <Button asChild>
                  <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    {project.demoUrl.includes('npmjs.com') ? (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    ) : project.demoUrl.includes('github.com') ? (
                      <Github className="mr-2 h-4 w-4" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    {project.demoUrl.includes('npmjs.com') ? 'View Packages' :
                     project.demoUrl.includes('github.com') ? 'Documentation' : 'Live Demo'}
                  </Link>
                </Button>
              )}
              {project.externalUrl && (
                <Button variant="outline" asChild>
                  <Link href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                    {project.externalUrl.includes('github') ? (
                      <Github className="mr-2 h-4 w-4" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    {project.externalUrl.includes('github') ? 'GitHub Repo' : 'Visit Site'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>



        {/* Project Description */}
        <div className="mb-8">
          <h2>About This Project</h2>
          <p>{project.description}</p>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-8 not-prose">
            <h2 className="mb-4 text-2xl font-bold">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}


      </article>
    </div>
  );
}
