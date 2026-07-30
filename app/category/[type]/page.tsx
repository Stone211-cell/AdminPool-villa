import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientSearch } from "@/components/ClientSearch"; // We can reuse ClientSearch with a slight modification or just build a grid here.

export default async function CategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: rawType } = await params;
  const type = rawType.toUpperCase();
  
  if (type !== "PROMOTION" && type !== "RECOMMENDED") {
    notFound();
  }

  const houses = await prisma.house.findMany({
    where: { category: type },
    orderBy: { createdAt: "desc" }
  });

  const title = type === "PROMOTION" ? "บ้านพูลวิลล่าราคาโปรโมชั่น" : "บ้านพูลวิลล่าแนะนำ";
  const desc = type === "PROMOTION" ? "บ้านพักพูลวิลล่าราคาโปรโมชั่น ON SALE ลดสูงสุด 20-40%" : "คัดสรรบ้านพักยอดฮิตจากผู้เข้าพักจริง การันตีความประทับใจ";

  return (
    <div className="min-h-screen bg-[#fff5f8] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="mb-12 text-center" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">{desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-aos="fade-up">
          {houses.map((house) => (
             <Link href={`/villas/${house.id}`} key={house.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
               <div className="relative h-64 overflow-hidden">
                 <img 
                    src={house.imgName || "https://placehold.co/800x600/ffe4e6/ff758f"} 
                    alt={`CITY-${house.hId}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                 />
                 {house.category === "PROMOTION" && (
                   <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/30">SALE</div>
                 )}
               </div>
               <div className="p-6">
                 <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#ff758f] transition-colors line-clamp-1">พูลวิลล่า CITY-{house.hId}</h3>
                 <p className="text-gray-500 text-sm line-clamp-2 mb-4">ที่พักพูลวิลล่าส่วนตัว พร้อมสิ่งอำนวยความสะดวกครบครัน</p>
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
          {houses.length === 0 && (
            <div className="col-span-1 md:col-span-3 text-center py-20 text-gray-500 font-bold">
              <div className="text-6xl mb-4">😢</div>
              ไม่พบบ้านพักในหมวดหมู่นี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
