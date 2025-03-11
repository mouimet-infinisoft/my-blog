import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/lexend/400.css'
import '@fontsource/lexend/500.css'
import '@fontsource/lexend/600.css'
import '@fontsource/lexend/700.css'
import '@/styles/tailwind.css'

export const metadata: Metadata = {
  title: {
    template: '%s - Martin Ouimet',
    default: 'Martin Ouimet - Technology Leader & AI Solutions Architect',
  },
  description:
    'Innovative technology leader with 20+ years of experience transforming businesses through AI and cloud solutions. Founder and CEO of Infinisoft World, delivering enterprise-grade software across multiple sectors.',
  alternates: {
    types: {
      'application/rss+xml': `${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
