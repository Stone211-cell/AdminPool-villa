import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "บทความทั้งหมด | BAITONG POOLVILLA",
};

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-8 text-center" data-aos="fade-up">บทความและข่าวสาร</h1>
        
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500" data-aos="fade-up" data-aos-delay="100">
            <span className="text-6xl mb-4 block">📰</span>
            ยังไม่มีบทความในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <Link 
                href={`/articles/${article.id}`} 
                key={article.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-2 transition-all group"
                data-aos="fade-up"
                data-aos-delay={(i % 3) * 100}
              >
                <div className="relative h-48 bg-pink-50 overflow-hidden">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#ff758f] transition-colors">{article.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{article.content}</p>
                  <p className="text-xs text-gray-400 font-semibold">{new Date(article.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <LineRichMenu />
    </div>
  );
}
