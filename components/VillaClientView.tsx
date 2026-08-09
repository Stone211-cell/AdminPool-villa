"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookingFlowModal } from "@/components/BookingFlowModal";
import { LineRichMenu } from "@/components/LineRichMenu";

gsap.registerPlugin(ScrollTrigger);

// Define prop types based on Prisma schema (simplified for UI)
type House = any;
type HouseDetail = any;

export function VillaClientView({ 
  house, 
  similarHouses 
}: { 
  house: House; 
  similarHouses: House[] 
}) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Parallax & Scale effect for Hero Image
    gsap.to(".hero-image", {
      yPercent: 20,
      scale: 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // Fade up staggered animation for info cards
    gsap.from(".fade-up-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".info-section",
        start: "top 80%",
      }
    });
    
    // Amenity staggered animation
    gsap.from(".amenity-item", {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".amenity-section",
        start: "top 85%",
      }
    });
  }, { scope: container });

  const images = Array.isArray(house.images) && house.images.length > 0 
    ? house.images 
    : [house.imgName || "https://placehold.co/1200x800/ffe4e6/ff758f"];

  // Helper arrays for amenities
  const features = [
    { key: "swim", label: house.swim === "salt" ? "สระว่ายน้ำระบบเกลือ" : "สระว่ายน้ำคลอรีน", icon: "🏊" },
    { key: "wifi", label: "ฟรี Wi-Fi แรงทะลุมิติ", icon: "📶", val: house.wifi },
    { key: "karaoke", label: "คาราโอเกะพร้อมเครื่องเสียง", icon: "🎤", val: house.karaoke },
    { key: "snooker", label: "โต๊ะสนุกเกอร์สุดเอ็กซ์คลูซีฟ", icon: "🎱", val: house.snooker },
    { key: "billard", label: "โต๊ะพูลมาตรฐาน", icon: "🎱", val: house.billard },
    { key: "slider", label: "สไลเดอร์ริมสระมันส์ๆ", icon: "🛝", val: house.slider },
    { key: "jacuzzi", label: "อ่างจากุซซี่แช่ตัวชิลๆ", icon: "🛁", val: house.jacuzzi },
    { key: "grill", label: "เตาปิ้งย่างปาร์ตี้บาร์บีคิว", icon: "🍖", val: house.grill },
    { key: "pet", label: "พาน้องหมาแมวมาพักได้", icon: "🐾", val: house.pet },
    { key: "swimmingKid", label: "สระตื้นสำหรับเด็ก", icon: "🛟", val: house.swimmingKid },
    { key: "discotech", label: "ไฟเธคจัดเต็มทั้งหลัง", icon: "🪩", val: house.discotech },
  ].filter(f => f.val !== false); // Keep true or undefined (for swim)

  return (
    <div ref={container} className="min-h-screen bg-[#FDFDFD] pb-32 relative font-sans text-gray-800">
      
      {/* Hero Image Section (3D Parallax) */}
      <section className="hero-section w-full h-[70vh] relative overflow-hidden bg-[#1a1a2e]">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={house.imgName || "https://placehold.co/1200x800/ffe4e6/ff758f"} 
            alt={`พูลวิลล่า BT-${house.hId}`}
            referrerPolicy="no-referrer"
            className="hero-image w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] via-transparent to-black/40"></div>
        <div className="absolute bottom-10 left-0 right-0 px-6 max-w-6xl mx-auto z-10">
          <div className="flex flex-wrap gap-3 mb-4">
             <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold border border-white/30 shadow-lg">รหัสบ้าน: BT-{house.hId}</span>
             <span className="bg-[#ff758f] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-pink-500/30">โซน {house.hZone}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-xl tracking-tight leading-tight">พูลวิลล่า {house.name || `BT-${house.hId}`}</h1>
          <p className="text-gray-100/90 text-lg md:text-xl font-medium max-w-2xl drop-shadow-md">
            {house.hFarsea || "เติมเต็มวันหยุดของคุณด้วยบ้านพักพูลวิลล่าส่วนตัว สิ่งอำนวยความสะดวกครบครัน พร้อมปาร์ตี้ได้เต็มที่"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8 relative">
        <main className="flex-1 min-w-0">
          
          {/* Quick Stats Grid */}
          <section className="info-section grid grid-cols-3 gap-3 md:gap-6 mb-16 -mt-20 relative z-20">
            <div className="fade-up-card bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2">
              <span className="text-4xl md:text-5xl mb-3 drop-shadow-sm">🛏️</span>
              <p className="text-xl md:text-2xl font-black text-gray-900">{house.hBedroom} <span className="block text-sm md:text-base font-semibold text-gray-500 mt-1">ห้องนอน</span></p>
            </div>
            <div className="fade-up-card bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2">
              <span className="text-4xl md:text-5xl mb-3 drop-shadow-sm">🚿</span>
              <p className="text-xl md:text-2xl font-black text-gray-900">{house.hToilet} <span className="block text-sm md:text-base font-semibold text-gray-500 mt-1">ห้องน้ำ</span></p>
            </div>
            <div className="fade-up-card bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center justify-center text-center transform transition-transform hover:-translate-y-2">
              <span className="text-4xl md:text-5xl mb-3 drop-shadow-sm">🧑</span>
              <p className="text-xl md:text-2xl font-black text-gray-900">{house.people} <span className="block text-sm md:text-base font-semibold text-gray-500 mt-1">ท่าน (สูงสุด {house.detail?.peopleMax || house.people})</span></p>
            </div>
          </section>

          <div className="space-y-16">
            
            {/* Amenities Section */}
            <section className="amenity-section bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100">
              <div className="mb-10 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">ไฮไลท์สิ่งอำนวยความสะดวก</h2>
                <p className="text-gray-500 font-medium">จัดเต็มทุกฟังก์ชัน ให้ปาร์ตี้ของคุณและครอบครัวสนุกสุดเหวี่ยงแบบไม่มีสะดุด</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-10 gap-x-6">
                  {features.map((f, i) => (
                    <div key={i} className="amenity-item flex flex-col items-center gap-4 text-center group cursor-default">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.03)] border border-gray-100 group-hover:bg-[#ff758f] group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-pink-200">
                        {f.icon}
                      </div>
                      <p className="font-bold text-gray-700 text-sm md:text-base leading-tight group-hover:text-[#ff758f] transition-colors">{f.label}</p>
                    </div>
                  ))}
              </div>
            </section>

            {/* House Details & Rules */}
            {house.detail && (
              <section className="fade-up-card grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1a1a2e] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  <h2 className="text-3xl font-black mb-8 flex items-center gap-3 relative z-10">
                    <span className="text-3xl">🔑</span> กฎการเข้าพัก
                  </h2>
                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">⏰</div>
                      <div>
                        <p className="font-bold text-lg mb-1">เวลาเข้า-ออก</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          เช็คอินตั้งแต่: <span className="text-white font-bold">{house.detail.checkin.includes('T') ? new Date(house.detail.checkin).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : house.detail.checkin} น.</span><br/> 
                          เช็คเอาท์ไม่เกิน: <span className="text-white font-bold">{house.detail.checkout.includes('T') ? new Date(house.detail.checkout).toLocaleTimeString('th-TH', {hour:'2-digit', minute:'2-digit'}) : house.detail.checkout} น.</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-xl shrink-0 text-red-300">💰</div>
                      <div>
                        <p className="font-bold text-lg mb-1 text-red-200">ค่าประกันความเสียหาย</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {house.detail.insurance ? `${house.detail.insurance.toLocaleString()} บาท` : "สอบถามแอดมิน"}
                          <span className="block text-xs mt-1 opacity-70">(ชำระวันเข้าพัก และคืนให้เต็มจำนวนในวันเช็คเอาท์หากไม่มีความเสียหาย)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-center">
                  <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <span className="text-3xl">🏠</span> ข้อมูลเพิ่มเติม
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start pb-6 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shrink-0">🚗</div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">พื้นที่จอดรถ</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{house.detail.parking || "มีพื้นที่จอดรถส่วนตัวรองรับผู้เข้าพัก"}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shrink-0">🍳</div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg mb-1">อุปกรณ์ครัวจัดเต็ม</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{house.detail.kitchen || "เตรียมไว้ให้ครบครัน ซื้อแค่วัตถุดิบมาทำอาหารและปิ้งย่างได้เลย (รบกวนล้างทำความสะอาดหลังใช้ หรือเรียกใช้บริการแม่บ้านได้ครับ)"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Bento Grid Image Gallery (Moved to Bottom) */}
            <section className="fade-up-card space-y-6 pt-10 border-t border-gray-200">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-[#ff758f] flex items-center justify-center text-2xl text-white shadow-lg shadow-pink-200">📸</span>
                บรรยากาศรอบบ้าน
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[600px] md:h-[700px]">
                {images.slice(0, 5).map((img: string, i: number) => {
                  let gridClass = "col-span-1 row-span-1";
                  if (i === 0) gridClass = "col-span-2 row-span-2 md:col-span-2 md:row-span-2"; // Big image
                  else if (i === 3 && images.length > 4) gridClass = "col-span-1 row-span-1 md:col-span-2"; // Wide image

                  return (
                    <div key={i} className={`relative overflow-hidden rounded-3xl shadow-md group ${gridClass}`}>
                      <img 
                        src={img} 
                        alt={`บรรยากาศบ้านพัก ${i+1}`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                    </div>
                  );
                })}
              </div>
              {images.length > 5 && (
                <p className="text-center text-gray-500 font-semibold text-sm">
                  มีรูปภาพทั้งหมด {images.length} รูป (ตัวอย่าง)
                </p>
              )}
            </section>
            
          </div>
        </main>

        {/* Similar Houses Sidebar */}
        {similarHouses && similarHouses.length > 0 && (
          <aside className="w-full lg:w-[350px] shrink-0 mt-16 lg:mt-0">
            <div className="sticky top-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">พูลวิลล่าใกล้เคียง</h2>
                <p className="text-gray-500 font-medium">โซน {house.hZone}</p>
              </div>
              
              <div className="flex flex-col gap-6">
                {similarHouses.map((simHouse: any) => (
                  <a href={`/villas/${simHouse.hId}`} key={simHouse.id} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-pink-200/40 transition-all duration-300 border border-gray-100">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={simHouse.imgName || "https://placehold.co/800x600/ffe4e6/ff758f"} 
                        alt={`BT-${simHouse.hId}`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-md">
                        {simHouse.people} ท่าน
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-[#ff758f] transition-colors">พูลวิลล่า {simHouse.name || `BT-${simHouse.hId}`}</h3>
                      <p className="text-[#ff758f] font-black text-xl">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(simHouse.price || 0))} <span className="text-xs text-gray-500 font-semibold">/ คืน</span></p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Floating Booking Flow Modal Component (Sticky Bottom inside) */}
      <BookingFlowModal house={house} />
      
      <LineRichMenu />
    </div>
  );
}
