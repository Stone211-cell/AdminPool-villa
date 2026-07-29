import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BAITONG POOLVILLA | บ้านพักพูลวิลล่า พัทยา สัตหีบ ราคาพิเศษ",
  description: "จองบ้านพักพูลวิลล่าส่วนตัวที่ดีที่สุดในพัทยา สัตหีบ โทร 093-562-2211 ใบตอง",
};

export default async function CustomerLandingPage() {
  const houses = await prisma.house.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#fff5f8] font-sans overflow-x-hidden relative">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 flex flex-col items-center justify-center px-4">
        {/* Background Decorative Blur */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Badges */}
        <div className="flex gap-4 mb-10 z-10 w-full max-w-4xl justify-start sm:justify-center">
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#ff758f] flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>
             <div>
               <p className="text-xs font-bold text-gray-800">บ้านจริง ตรงปก</p>
               <p className="text-[10px] text-gray-500">จากเจ้าของตัวจริง ตรวจเช็คโดยทีมงานทุกหลัง</p>
             </div>
           </div>
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#ff8fa3] flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
             <div>
               <p className="text-xs font-bold text-gray-800">จองบ้านสบายใจ</p>
               <p className="text-[10px] text-gray-500">วางมัดจำก่อนได้ไม่ต้องจ่ายเต็ม</p>
             </div>
           </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-[2rem] shadow-xl p-2 md:p-3 w-full max-w-5xl z-20 flex flex-col md:flex-row items-center border border-pink-50 gap-2 relative">
          
          <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="ค้นหาบ้านพักพูลวิลล่า" className="w-full bg-transparent focus:outline-none text-sm font-semibold text-gray-700 placeholder-gray-400" />
          </div>

          <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer hover:bg-pink-50 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-sm font-semibold text-gray-700">เลือกวันเข้าพัก</span>
          </div>

          <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full cursor-pointer hover:bg-pink-50 rounded-xl transition-colors relative group">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <span className="text-sm font-semibold text-gray-700">ผู้เข้าพัก</span>

            {/* Hover Popup for Guests */}
            <div className="absolute top-full right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
               {[
                 { id: "adult", icon: "user", label: "ผู้ใหญ่", desc: "" },
                 { id: "child", icon: "baby", label: "เด็ก", desc: "อายุ 0-12 ปี" },
                 { id: "pet", icon: "paw", label: "สัตว์เลี้ยง", desc: "หมา แมว ฯลฯ" },
                 { id: "room", icon: "door", label: "ห้องพัก", desc: "จำนวนห้องพักที่ต้องการ" },
               ].map(item => (
                 <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff758f] font-bold">
                         {item.id === "adult" && "🧑"}
                         {item.id === "child" && "👶"}
                         {item.id === "pet" && "🐾"}
                         {item.id === "room" && "🚪"}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-700">{item.label}</p>
                         {item.desc && <p className="text-[10px] text-gray-400">{item.desc}</p>}
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#ff758f] hover:bg-pink-50 font-bold">-</button>
                      <span className="w-4 text-center font-bold text-gray-700">0</span>
                      <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#ff758f] hover:bg-pink-50 font-bold">+</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <button className="bg-[#ff758f] hover:bg-[#ff5c77] text-white px-8 py-4 rounded-full font-bold transition-colors w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            ค้นหา
          </button>
        </div>
      </div>

      {/* House List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">บ้านพักแนะนำสำหรับคุณ</h2>
            <p className="text-gray-500">คัดสรรพูลวิลล่าที่ดีที่สุดในพัทยา พร้อมให้คุณเข้าพัก</p>
          </div>
          <button className="hidden sm:flex text-[#ff758f] font-bold items-center gap-1 hover:text-[#ff5c77] transition-colors">
            ดูทั้งหมด <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {houses.map(house => (
            <Link href={`/villas/CITY-${house.hId}`} key={house.hId} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all group">
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                <img 
                  src={house.imgName || ""} 
                  alt={`CITY-${house.hId}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  CITY-{house.hId}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">บ้านพักพูลวิลล่า CITY-{house.hId}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-pink-50 text-[#ff758f] px-2 py-1 rounded-lg text-xs font-bold">🛏️ {house.hBedroom} นอน</span>
                  <span className="bg-pink-50 text-[#ff758f] px-2 py-1 rounded-lg text-xs font-bold">🚿 {house.hToilet} น้ำ</span>
                  <span className="bg-pink-50 text-[#ff758f] px-2 py-1 rounded-lg text-xs font-bold">🧑 {house.people} คน</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">ราคาเริ่มต้น</p>
                    <p className="text-lg font-black text-gray-900">
                      {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(house.price || 0))}
                    </p>
                  </div>
                  <div className="bg-[#ff758f] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-pink-200 group-hover:bg-[#ff5c77] transition-colors">
                    ดูรายละเอียด
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <LineRichMenu />
    </div>
  );
}