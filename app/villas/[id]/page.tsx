import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function HouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Search for the house in the DB
  const house = await prisma.house.findUnique({
    where: { hId: id.replace('CITY-', '') }
  });

  if (!house) {
    return notFound();
  }

  const priceFormatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(house.price || 0));

  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span>หน้าหลัก</span>
          <span>&rsaquo;</span>
          <span>ค้นหาบ้าน</span>
          <span>&rsaquo;</span>
          <span className="font-bold text-gray-800">CITY-{house.hId}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">CITY-{house.hId}</p>
            <h1 className="text-3xl font-black text-gray-900">บ้านพัก CITY-{house.hId}</h1>
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                แชร์
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm mb-1">ราคาเริ่มต้น / คืน</p>
            <p className="text-4xl font-black text-[#1f2937]">{priceFormatted}</p>
          </div>
        </div>

        {/* Main Image Banner (simulating Carousel) */}
        <div className="relative w-full h-[60vh] bg-gray-100 rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 group">
          <img src={house.imgName || ""} alt={`CITY-${house.hId}`} className="w-full h-full object-cover" />
          
          {/* Navigation Arrows */}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Detail Content */}
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">รายละเอียดบ้านพัก</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">🛌</div>
              <div><p className="text-sm text-gray-500">ห้องนอน</p><p className="font-bold">{house.hBedroom} ห้อง</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">🚿</div>
              <div><p className="text-sm text-gray-500">ห้องน้ำ</p><p className="font-bold">{house.hToilet} ห้อง</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">🧑</div>
              <div><p className="text-sm text-gray-500">ผู้เข้าพักสูงสุด</p><p className="font-bold">{house.people} ท่าน</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">🏊</div>
              <div><p className="text-sm text-gray-500">สระว่ายน้ำ</p><p className="font-bold">{house.swim === 'salt' ? 'ระบบเกลือ' : 'ระบบคลอรีน'}</p></div>
            </div>
          </div>
        </div>

      </main>

      <LineRichMenu />
    </div>
  );
}
