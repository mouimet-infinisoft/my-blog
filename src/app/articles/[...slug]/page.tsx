import { ArticleLayout } from '@/components/ArticleLayout'
import { getArticlesBySlug } from '@/lib/articles'

export default async function Article({
  params,
}: {
  params: { slug: string[] }
}) {
  const { article, prevArticle, nextArticle } = await getArticlesBySlug(params.slug.join('/'))
  
  // Import the MDX content dynamically
  const Content = (await import(`../../articles/${params.slug.join('/')}/page.mdx`)).default

  return <Content article={article} prevArticle={prevArticle} nextArticle={nextArticle} />
}