import { type Metadata } from 'next'
import Image from 'next/image'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import logoIBrain from '@/images/logos/animaginary.svg'
import logoBrainstack from '@/images/logos/cosmos.svg'
import logoSoSimple from '@/images/logos/helio-stream.svg'
import logoBookt from '@/images/logos/open-shuttle.svg'
import logoTelus from '@/images/logos/planetaria.svg'

const projects = [
  {
    name: 'iBrain',
    description:
      'AI-powered workflow automation platform featuring NLP, vector embeddings, and real-time speech processing. A multi-tenant SaaS solution with comprehensive API integrations.',
    link: { href: 'https://github.com/ibrain-one/ibrain/wiki#ibrain-one-wiki', label: 'Wiki Documentation' },
    logo: logoIBrain,
  },
  {
    name: '@brainstack Framework',
    description:
      'Zero-dependency TypeScript ecosystem with 29 packages for AI-driven development. Features modules for dependency injection, state management, and event handling.',
    link: { href: 'https://github.com/Infinisoft-inc/public/tree/main/Packages/%40brainstack#brainstack-framework', label: 'github.com/brainstack' },
    logo: logoBrainstack,
  },
  {
    name: 'So Simple SaaS Platform',
    description:
      'Multi-tenant platform with real-time dashboard reporting and operational optimization, increasing service coverage by 70%.',
    link: { href: 'https://infinisoft.world/', label: 'Client Project' },
    logo: logoSoSimple,
  },
  {
    name: 'Bookt Workforce Platform',
    description:
      'Microservices-based scheduling and communication platform with real-time Firebase integration for dynamic updates.',
    link: { href: 'https://www.linkedin.com/in/mouimet-infinisoft', label: 'Client Project' },
    logo: logoBookt,
  },
  {
    name: 'Telus Health Storage',
    description:
      'High-availability AWS S3-compatible storage proxy API integrated with Telus HCP, featuring robust state machine for business rules.',
    link: { href: 'https://www.npmjs.com/~infinisoft-world', label: 'Client Project' },
    logo: logoTelus,
  },
  // Add new projects here based on the resume
]

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Innovative solutions I\'ve built to transform businesses through AI and cloud technologies.'
}

export default function Projects() {
  return (
    <SimpleLayout
      title="Transforming businesses through innovative technology solutions."
      intro="As a technology leader with over 20 years of experience, I've led the development of enterprise-grade software across finance, healthcare, retail, and transportation sectors. Here are some of the key projects that showcase my commitment to innovation and excellence."
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <Card as="li" key={project.name}>
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 shadow-md shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
              <Image
                src={project.logo}
                alt=""
                className="h-8 w-8"
                unoptimized
              />
            </div>
            <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
              <Card.Link href={project.link.href}>{project.name}</Card.Link>
            </h2>
            <Card.Description>{project.description}</Card.Description>
            <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">
              <LinkIcon className="h-6 w-6 flex-none" />
              <span className="ml-2">{project.link.label}</span>
            </p>
          </Card>
        ))}
      </ul>
    </SimpleLayout>
  )
}
