import { Navbar } from "@/components/Navbar";
import { LineRichMenu } from "@/components/LineRichMenu";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerCalendar } from "@/components/CustomerCalendar";

export default async function HouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Search for the house in the DB
  const house = await prisma.house.findUnique({
    where: { hId: id.replace('CITY-', '') },
    include: { detail: true }
  });

  if (!house) {
    return notFound();
  }

  const priceFormatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(house.price || 0));

  return (
    <div className="min-h-screen bg-[#fff5f8] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>หน้าหลัก</span>
          <span>&rsaquo;</span>
          <span>พูลวิลล่าทั้งหมด</span>
          <span>&rsaquo;</span>
          <span className="font-bold text-[#ff758f]">CITY-{house.hId}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <p className="text-[#ff758f] font-bold text-sm mb-1 bg-pink-100 inline-block px-3 py-1 rounded-full">รหัสบ้าน CITY-{house.hId}</p>
            <h1 className="text-4xl font-black text-gray-900 mt-2">พูลวิลล่า CITY-{house.hId}</h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-gray-500 text-sm mb-1 font-semibold">ราคาเริ่มต้น / คืน</p>
            <p className="text-4xl font-black text-[#ff758f]">{priceFormatted}</p>
          </div>
        </div>

        {/* Main Image Banner */}
        <div className="relative w-full h-[50vh] md:h-[65vh] bg-pink-50 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group">
          {house.imgName ? (
             <img src={house.imgName} alt={`CITY-${house.hId}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <span className="text-6xl mb-4">🏠</span>
                <span className="text-xl font-bold">รอรูปภาพอัพเดท</span>
             </div>
          )}
          
          <div className="absolute top-6 right-6 flex gap-2">
             <button className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff758f] hover:text-white transition-colors text-gray-700">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
             </button>
             <button className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff758f] hover:text-white transition-colors text-gray-700">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex justify-around items-center">
              <div className="text-center">
                <span className="text-3xl mb-2 block">🛏️</span>
                <p className="text-lg font-black text-gray-800">{house.hBedroom} <span className="text-sm font-semibold text-gray-500">ห้องนอน</span></p>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div className="text-center">
                <span className="text-3xl mb-2 block">🚿</span>
                <p className="text-lg font-black text-gray-800">{house.hToilet} <span className="text-sm font-semibold text-gray-500">ห้องน้ำ</span></p>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div className="text-center">
                <span className="text-3xl mb-2 block">🧑</span>
                <p className="text-lg font-black text-gray-800">{house.people} <span className="text-sm font-semibold text-gray-500">ท่าน (สูงสุด {house.detail?.peopleMax || house.people})</span></p>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">✨</span>
                สิ่งอำนวยความสะดวก
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                 {/* Pool */}
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center text-lg">🏊</div>
                    <p className="font-bold text-gray-700 text-sm">สระว่ายน้ำ {house.swim === 'salt' ? 'ระบบเกลือ' : 'ระบบคลอรีน'}</p>
                 </div>
                 {house.wifi && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-lg">📶</div><p className="font-bold text-gray-700 text-sm">ฟรี Wi-Fi</p></div>}
                 {house.karaoke && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-lg">🎤</div><p className="font-bold text-gray-700 text-sm">คาราโอเกะ</p></div>}
                 {house.snooker && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-50 text-gray-700 rounded-full flex items-center justify-center text-lg">🎱</div><p className="font-bold text-gray-700 text-sm">โต๊ะสนุกเกอร์</p></div>}
                 {house.billard && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-lg">🎱</div><p className="font-bold text-gray-700 text-sm">โต๊ะพูล</p></div>}
                 {house.slider && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-lg">🛝</div><p className="font-bold text-gray-700 text-sm">สไลเดอร์</p></div>}
                 {house.jacuzzi && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-lg">🛁</div><p className="font-bold text-gray-700 text-sm">อ่างจากุซซี่</p></div>}
                 {house.grill && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-lg">🍖</div><p className="font-bold text-gray-700 text-sm">เตาปิ้งย่าง</p></div>}
                 {house.pet && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-lg">🐾</div><p className="font-bold text-gray-700 text-sm">สัตว์เลี้ยงเข้าได้</p></div>}
                 {house.swimmingKid && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-lg">🛟</div><p className="font-bold text-gray-700 text-sm">สระเด็ก / ห่วงยาง</p></div>}
                 {house.discotech && <div className="flex items-center gap-3"><div className="w-10 h-10 bg-fuchsia-50 text-fuchsia-500 rounded-full flex items-center justify-center text-lg">🪩</div><p className="font-bold text-gray-700 text-sm">ไฟเธค</p></div>}
              </div>
            </div>

            {/* Extra Details */}
            {house.detail && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">📝</span>
                  รายละเอียดเพิ่มเติม
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">เวลาเข้า-ออกพัก</p>
                      <p className="text-gray-600 text-sm mt-1">Check-in: {house.detail.checkin} | Check-out: {house.detail.checkout}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">ที่จอดรถ</p>
                      <p className="text-gray-600 text-sm mt-1">{house.detail.parking || "มีที่จอดรถส่วนตัว"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">🍳</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">อุปกรณ์ครัว</p>
                      <p className="text-gray-600 text-sm mt-1">{house.detail.kitchen || "อุปกรณ์ครัวครบครัน (กรุณาล้างทำความสะอาดหลังใช้งาน)"}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-red-50 rounded-2xl">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-bold text-red-700 text-sm">ค่าประกันความเสียหาย</p>
                      <p className="text-red-600 text-sm mt-1">{house.detail.insurance ? `${house.detail.insurance.toLocaleString()} บาท (คืนให้วันเช็คเอาท์หากไม่มีอะไรเสียหาย)` : "กรุณาสอบถามแอดมิน"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Right Sidebar - Calendar & Booking */}
          <div className="space-y-8">
             {/* Sticky Box */}
             <div className="sticky top-24">
                <CustomerCalendar hId={house.hId} />
                
                <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border-2 border-pink-100">
                   <p className="text-center font-bold text-gray-600 mb-4">สนใจจองบ้านพักหลังนี้?</p>
                   <a href="https://lin.ee/xxxxx" target="_blank" rel="noreferrer" className="w-full bg-[#00B900] hover:bg-[#009900] text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 transition-transform hover:-translate-y-1">
                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.53 8.909 8.441 9.615.65.138 1.536.43 1.748 1.01.19.516.064 1.319.031 1.62-.095.89-.487 2.871-.595 3.398-.142.695.53.533.842.38 1.05-.515 5.626-3.328 8.04-5.918 2.213-2.352 3.493-5.266 3.493-8.105z"/></svg>
                     ทัก LINE จองเลย
                   </a>
                   <p className="text-center text-xs text-gray-400 mt-4 font-semibold">หรือโทร. 093-562-2211 (ใบตอง)</p>
                </div>
             </div>
          </div>
        </div>

      </main>

      <LineRichMenu />
    </div>
  );
}
