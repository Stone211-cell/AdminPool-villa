import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClientSearch } from "@/components/ClientSearch";
import { ProfileSetupModal } from "@/components/ProfileSetupModal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "BAITONG POOLVILLA | บ้านพักพูลวิลล่า พัทยา สัตหีบ ราคาพิเศษ",
  description: "จองบ้านพักพูลวิลล่าส่วนตัวที่ดีที่สุดในพัทยา สัตหีบ โทร 093-562-2211 ใบตอง",
};

export default async function CustomerLandingPage() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: "desc" }
  });

  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return (
    <div className="min-h-screen font-sans overflow-x-hidden relative">
      <Navbar />
      <ProfileSetupModal />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 flex flex-col items-center justify-center px-4">
        {/* Background Decorative Blur */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Badges */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 z-10 w-full max-w-4xl justify-start sm:justify-center px-4">
           <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-[#ff758f] flex items-center justify-center text-white shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>
             <div>
               <p className="text-lg font-black text-gray-800">บ้านจริง ตรงปก</p>
               <p className="text-sm font-medium text-gray-500 mt-1">จากเจ้าของตัวจริง ตรวจเช็คโดยทีมงานทุกหลัง</p>
             </div>
           </div>
           <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-[#ff8fa3] flex items-center justify-center text-white shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
             <div>
               <p className="text-lg font-black text-gray-800">จองบ้านสบายใจ</p>
               <p className="text-sm font-medium text-gray-500 mt-1">วางมัดจำก่อนได้ ไม่ต้องจ่ายเต็มจำนวน</p>
             </div>
           </div>
        </div>
      </div>

      {/* Client Search and House List */}
      <ClientSearch initialHouses={houses} articles={articles} />

      <LineRichMenu />
    </div>
  );
}