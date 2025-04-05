import { getAllSeries, getAllArticles } from '@/lib/content';

export default async function TestContentPage() {
  const series = await getAllSeries();
  const articles = await getAllArticles();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Series ({series.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <div key={s.slug} className="border p-4 rounded-lg">
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-gray-600">{s.description}</p>
              <p className="mt-2">Articles: {s.articles.length}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">All Articles ({articles.length})</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.slug} className="border p-4 rounded-lg">
              <h3 className="font-bold">{article.title}</h3>
              <p className="text-sm text-gray-600">{article.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {article.seriesSlug ? (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Series: {article.seriesSlug}
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    Standalone
                  </span>
                )}
                {article.category && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                )}
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {article.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
