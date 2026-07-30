import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LineRichMenu } from "@/components/LineRichMenu";
import { BookingFlowModal } from "@/components/BookingFlowModal";

export default async function VillaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const house = await prisma.house.findUnique({
    where: { hId: id.replace('CITY-', '') },
    include: { detail: true }
  });

  if (!house) {
    notFound();
  }

  // Similar houses
  const similarHouses = await prisma.house.findMany({
    where: { 
      id: { not: house.id },
      hZone: house.hZone 
    },
    take: 3
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32 relative">
      
      {/* Hero Image Section */}
      <div className="w-full h-[60vh] relative overflow-hidden bg-gray-900">
        <img 
          src={house.imgName || "https://placehold.co/1200x800/ffe4e6/ff758f"} 
          alt={`พูลวิลล่า CITY-${house.hId}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-5xl mx-auto">
          <div className="flex gap-2 mb-3">
             <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">CITY-{house.hId}</span>
             <span className="bg-[#ff758f] text-white px-3 py-1 rounded-full text-xs font-bold">โซน: {house.hZone}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-md">พูลวิลล่า CITY-{house.hId}</h1>
          <p className="text-gray-200 font-semibold">{house.hFarsea || "ใกล้ทะเลและสถานที่ท่องเที่ยว"}</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-3xl mb-2">🛏️</span>
            <p className="text-lg font-black text-gray-800">{house.hBedroom} <span className="text-sm font-semibold text-gray-500">ห้องนอน</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-3xl mb-2">🚿</span>
            <p className="text-lg font-black text-gray-800">{house.hToilet} <span className="text-sm font-semibold text-gray-500">ห้องน้ำ</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center border border-gray-100">
            <span className="text-3xl mb-2">🧑</span>
            <p className="text-lg font-black text-gray-800">{house.people} <span className="text-sm font-semibold text-gray-500">ท่าน (สูงสุด {house.detail?.peopleMax || house.people})</span></p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-8">
          
          {/* Amenities Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">✨</span>
              สิ่งอำนวยความสะดวก
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                {/* Pool */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-14 h-14 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-cyan-100">🏊</div>
                  <p className="font-bold text-gray-700 text-sm">สระว่ายน้ำ<br/><span className="text-xs text-gray-500 font-semibold">{house.swim === 'salt' ? 'ระบบเกลือ' : 'ระบบคลอรีน'}</span></p>
                </div>
                {house.wifi && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100">📶</div><p className="font-bold text-gray-700 text-sm">ฟรี Wi-Fi</p></div>}
                {house.karaoke && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-purple-100">🎤</div><p className="font-bold text-gray-700 text-sm">คาราโอเกะ</p></div>}
                {house.snooker && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100">🎱</div><p className="font-bold text-gray-700 text-sm">โต๊ะสนุกเกอร์</p></div>}
                {house.billard && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-green-100">🎱</div><p className="font-bold text-gray-700 text-sm">โต๊ะพูล</p></div>}
                {house.slider && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-orange-100">🛝</div><p className="font-bold text-gray-700 text-sm">สไลเดอร์</p></div>}
                {house.jacuzzi && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-sky-100">🛁</div><p className="font-bold text-gray-700 text-sm">อ่างจากุซซี่</p></div>}
                {house.grill && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-red-100">🍖</div><p className="font-bold text-gray-700 text-sm">เตาปิ้งย่าง</p></div>}
                {house.pet && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-amber-100">🐾</div><p className="font-bold text-gray-700 text-sm">สัตว์เลี้ยงเข้าได้</p></div>}
                {house.swimmingKid && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-yellow-100">🛟</div><p className="font-bold text-gray-700 text-sm">สระเด็ก</p></div>}
                {house.discotech && <div className="flex flex-col items-center gap-2 text-center"><div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-fuchsia-100">🪩</div><p className="font-bold text-gray-700 text-sm">ไฟเธค</p></div>}
            </div>
          </div>

          {/* Extra Details */}
          {house.detail && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">📝</span>
                รายละเอียดการเข้าพัก
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-3xl mt-1">⏰</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">เวลาเข้า-ออกพัก</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Check-in: {house.detail.checkin.includes('T') ? new Date(house.detail.checkin).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : house.detail.checkin} <br/> 
                      Check-out: {house.detail.checkout.includes('T') ? new Date(house.detail.checkout).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : house.detail.checkout}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-3xl mt-1">🚗</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">ที่จอดรถ</p>
                    <p className="text-gray-600 text-sm mt-1">{house.detail.parking || "มีที่จอดรถส่วนตัว"}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 md:col-span-2">
                  <span className="text-3xl mt-1">🍳</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">อุปกรณ์ครัว</p>
                    <p className="text-gray-600 text-sm mt-1">{house.detail.kitchen || "อุปกรณ์ครัวครบครัน (กรุณาล้างทำความสะอาดหลังใช้งาน หรือมีบริการแม่บ้านทำความสะอาด)"}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 bg-red-50 rounded-2xl border border-red-100 md:col-span-2 items-center">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="font-bold text-red-700 text-sm">ค่าประกันความเสียหาย</p>
                    <p className="text-red-600 text-sm mt-1">{house.detail.insurance ? `${house.detail.insurance.toLocaleString()} บาท (ชำระวันเช็คอิน และคืนให้วันเช็คเอาท์หากไม่มีอะไรเสียหาย)` : "กรุณาสอบถามแอดมินเกี่ยวกับค่าประกัน"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>

      </main>

      {/* Similar Houses Section */}
      {similarHouses.length > 0 && (
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center md:text-left">บ้านพักใกล้เคียง ({house.hZone})</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarHouses.map(simHouse => (
                <a href={`/villas/${simHouse.hId}`} key={simHouse.id} className="group block bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={simHouse.imgName || "https://placehold.co/800x600/ffe4e6/ff758f"} 
                      alt={`CITY-${simHouse.hId}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
                      {simHouse.people} ท่าน
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-[#ff758f] transition-colors">พูลวิลล่า CITY-{simHouse.hId}</h3>
                    <p className="text-[#ff758f] font-black">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(simHouse.price || 0))} <span className="text-xs text-gray-500 font-semibold">/ คืน</span></p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Booking Flow Modal Component (Sticky Bottom inside) */}
      <BookingFlowModal house={house} />
      
      <LineRichMenu />
    </div>
  );
}
