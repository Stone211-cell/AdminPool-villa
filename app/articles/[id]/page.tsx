import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const article = await prisma.article.findUnique({
    where: { id }
  });

  if (!article || !article.published) {
    return notFound();
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/articles" className="text-[#ff758f] hover:underline font-bold text-sm">
            &larr; กลับไปหน้าบทความ
          </Link>
        </div>

        <article className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-gray-100" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">{article.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-10 pb-6 border-b border-gray-100">
            <span className="font-bold flex items-center gap-2"><span className="text-xl">✍️</span> {article.author}</span>
            <span>&bull;</span>
            <span>{new Date(article.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {article.imageUrl && (
            <div className="w-full h-[40vh] md:h-[50vh] rounded-2xl overflow-hidden mb-10 shadow-md">
              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg prose-pink max-w-none text-gray-700 leading-loose">
            {article.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>

      <LineRichMenu />
    </div>
  );
}
