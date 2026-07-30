"use client";

import { useState } from "react";
import Link from "next/link";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";

interface ClientSearchProps {
  initialHouses: any[];
  articles?: any[];
}

export function ClientSearch({ initialHouses, articles = [] }: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [guests, setGuests] = useState({ adult: 0, child: 0, pet: 0 });
  const [date, setDate] = useState<DateRange | undefined>();

  // Filter out houses without an image
  const validHouses = initialHouses.filter(house => house.imgName && house.imgName.trim() !== "");

  // Pagination logic for main search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 4 rows of 3 on desktop

  // Pagination logic for categories
  const [promoPage, setPromoPage] = useState(0);
  const [recommendPage, setRecommendPage] = useState(0);
  const catItemsPerPage = 6;

  const matchGuests = (house: any) => {
    return house.people >= guests.adult + guests.child;
  };

  const filteredHouses = validHouses.filter(house => {
    const matchSearch = house.hId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (house.hZone && house.hZone.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch && matchGuests(house);
  });


  const isSearching = searchTerm.length > 0 || guests.adult > 0 || guests.child > 0 || guests.pet > 0;

  // Categories
  const promoHousesAll = validHouses.filter(h => h.category === "PROMOTION");
  const recommendHousesAll = validHouses.filter(h => h.category === "RECOMMENDED");

  const promoHouses = promoHousesAll.slice(promoPage * catItemsPerPage, (promoPage + 1) * catItemsPerPage);
  const recommendHouses = recommendHousesAll.slice(recommendPage * catItemsPerPage, (recommendPage + 1) * catItemsPerPage);

  const totalPromoPages = Math.ceil(promoHousesAll.length / catItemsPerPage);
  const totalRecommendPages = Math.ceil(recommendHousesAll.length / catItemsPerPage);
  const otherHouses = validHouses.filter(h => h.category !== "PROMOTION" && h.category !== "RECOMMENDED");

  // Reset page when filters change
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleGuestsChange = (newGuests: typeof guests) => {
    setGuests(newGuests);
    setCurrentPage(1);
  };

  const currentDisplayHouses = isSearching ? filteredHouses : otherHouses;
  const totalPages = Math.ceil(currentDisplayHouses.length / itemsPerPage);
  const paginatedHouses = currentDisplayHouses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    const uniquePages = pages.filter((p, i, a) => p !== "..." || a[i - 1] !== "...");

    return (
      <div className="flex justify-center items-center gap-2 mt-12 mb-8" data-aos="fade-up">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1} 
          className="w-10 h-10 rounded-full flex items-center justify-center border text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          &lt;
        </button>
        {uniquePages.map((p, i) => (
          p === "..." ? (
            <span key={i} className="text-gray-400 font-bold px-2">...</span>
          ) : (
            <button 
              key={i} 
              onClick={() => setCurrentPage(p as number)} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentPage === p ? 'bg-[#ff758f] text-white shadow-md shadow-pink-200' : 'text-gray-600 hover:bg-pink-50 hover:text-[#ff758f]'}`}
            >
              {p}
            </button>
          )
        ))}
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages} 
          className="w-10 h-10 rounded-full flex items-center justify-center border text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          &gt;
        </button>
      </div>
    );
  };

  const renderHouseGrid = (housesToRender: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {housesToRender.map((house, i) => (
        <Link 
          href={`/villas/CITY-${house.hId}`} 
          key={house.hId} 
          className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all group relative"
          data-aos="fade-up"
          data-aos-delay={(i % 3) * 100}
        >
          {/* Badge */}
          {house.category === "PROMOTION" && (
            <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
              SALE
            </div>
          )}
          {house.category === "RECOMMENDED" && (
            <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
              ⭐ แนะนำ
            </div>
          )}
          
          <div className="relative h-56 bg-gray-200 overflow-hidden">
            <img 
              src={house.imgName || ""} 
              alt={`CITY-${house.hId}`} 
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/ffe4e6/ff758f?text=CITY-"+house.hId; }}
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
      {housesToRender.length === 0 && (
         <div className="col-span-1 md:col-span-3 text-center py-20 text-gray-500 font-bold">
           <div className="text-6xl mb-4">😢</div>
           ไม่พบบ้านพักที่ตรงกับเงื่อนไข
         </div>
      )}
    </div>
  );

  const renderDotsPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-3 h-3 rounded-full transition-all ${currentPage === i ? 'bg-[#ff758f] w-6' : 'bg-gray-300 hover:bg-pink-300'}`}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white rounded-[2rem] shadow-xl p-2 md:p-3 w-full max-w-5xl z-20 flex flex-col md:flex-row items-center border border-pink-50 gap-2 relative mt-4 mx-auto" data-aos="fade-up">
        
        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="ค้นหาชื่อบ้าน, รหัส หรือ โซน" 
            className="w-full bg-transparent focus:outline-none text-sm font-semibold text-gray-700 placeholder-gray-400" 
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-gray-100 relative group">
          <svg className="w-5 h-5 text-[#ff758f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className="text-sm font-semibold text-gray-700 w-full text-left cursor-pointer">
            {date?.from ? (
              date.to ? (
                `${date.from.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${date.to.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
              ) : (
                `${date.from.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
              )
            ) : (
              "เลือกวันเข้าพัก"
            )}
          </span>

          {/* Date Picker Popup */}
          <div className="absolute top-full left-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
            <DayPicker
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              pagedNavigation
              className="text-sm font-sans"
            />
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full cursor-pointer rounded-xl transition-colors relative group">
          <svg className="w-5 h-5 text-[#ff758f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span className="text-sm font-semibold text-gray-700">
            ผู้เข้าพัก {guests.adult + guests.child > 0 ? `(${guests.adult + guests.child} คน)` : ''}
          </span>

          {/* Hover Popup for Guests */}
          <div className="absolute top-full right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100]">
             {[
               { id: "adult", icon: "user", label: "ผู้ใหญ่", desc: "" },
               { id: "child", icon: "baby", label: "เด็ก", desc: "อายุ 0-12 ปี" },
               { id: "pet", icon: "paw", label: "สัตว์เลี้ยง", desc: "หมา แมว ฯลฯ" },
             ].map(item => (
               <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#ff758f] font-bold text-lg">
                       {item.id === "adult" && "🧑"}
                       {item.id === "child" && "👶"}
                       {item.id === "pet" && "🐾"}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-700">{item.label}</p>
                       {item.desc && <p className="text-[10px] text-gray-400">{item.desc}</p>}
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleGuestsChange({ ...guests, [item.id]: Math.max(0, guests[item.id as keyof typeof guests] - 1) })} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#ff758f] hover:bg-pink-50 font-bold">-</button>
                    <span className="w-4 text-center font-bold text-gray-700">{guests[item.id as keyof typeof guests]}</span>
                    <button onClick={() => handleGuestsChange({ ...guests, [item.id]: guests[item.id as keyof typeof guests] + 1 })} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#ff758f] hover:bg-pink-50 font-bold">+</button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <button 
          onClick={() => {
            const params = new URLSearchParams();
            if (searchTerm) params.append('q', searchTerm);
            if (guests.adult > 0) params.append('adults', guests.adult.toString());
            if (guests.child > 0) params.append('children', guests.child.toString());
            if (date?.from) params.append('checkin', date.from.toISOString());
            if (date?.to) params.append('checkout', date.to.toISOString());
            window.location.href = `/searchroom?${params.toString()}`;
          }}
          className="bg-[#ff758f] hover:bg-[#ff5c77] text-white px-8 py-4 rounded-full font-bold transition-colors w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2 shadow-lg shadow-pink-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          ค้นหา
        </button>
      </div>

      {/* House List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        
        {isSearching ? (
          /* Search Results View */
          <div className="mb-16">
            <div className="flex items-end justify-between mb-8" data-aos="fade-up">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">ผลการค้นหา</h2>
                <p className="text-gray-500">พบ {filteredHouses.length} หลัง</p>
              </div>
            </div>
            {renderHouseGrid(paginatedHouses)}
            {renderPagination()}
          </div>
        ) : (
          /* Categorized Landing View */
          <>
            {/* RECOMMENDED Section (Section 1) */}
            {recommendHousesAll.length > 0 && (
              <div className="mb-16">
                <div className="flex items-end justify-between mb-8" data-aos="fade-up">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">บ้านพูลวิลล่าแนะนำ</h2>
                    <p className="text-gray-500">คัดสรรบ้านพักยอดฮิตจากผู้เข้าพักจริง การันตีความประทับใจ</p>
                  </div>
                  <Link href="/category/RECOMMENDED" className="hidden sm:flex bg-[#1f2937] text-white px-4 py-2 rounded-full text-sm font-bold items-center gap-1 hover:bg-gray-800 shadow-lg shadow-gray-200 transition-colors">
                    ดูทั้งหมด <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                </div>
                {renderHouseGrid(recommendHouses)}
                {renderDotsPagination(recommendPage, totalRecommendPages, setRecommendPage)}
              </div>
            )}

            {/* PROMOTION Section (Section 2) */}
            {promoHousesAll.length > 0 && (
              <div className="mb-16">
                <div className="flex items-end justify-between mb-8" data-aos="fade-up">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">บ้านพูลวิลล่าราคาโปรโมชั่น</h2>
                    <p className="text-gray-500">บ้านพักพลูวิลล่าราคาโปรโมชั่น ON SALE ลดสูงสุด 20-40%</p>
                  </div>
                  <Link href="/category/PROMOTION" className="hidden sm:flex bg-[#1f2937] text-white px-4 py-2 rounded-full text-sm font-bold items-center gap-1 hover:bg-gray-800 shadow-lg shadow-gray-200 transition-colors">
                    ดูทั้งหมด <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                </div>
                {renderHouseGrid(promoHouses)}
                {renderDotsPagination(promoPage, totalPromoPages, setPromoPage)}
              </div>
            )}

            {/* ARTICLES Section (Section 3) */}
            {articles.length > 0 && (
              <div className="mb-16 relative">
                <div className="flex items-end justify-between mb-8" data-aos="fade-up">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">บทความและข่าวสาร</h2>
                    <p className="text-gray-500">อัพเดตเรื่องราว ทริคการท่องเที่ยว และโปรโมชั่นที่น่าสนใจ</p>
                  </div>
                  <Link href="/articles" className="hidden sm:flex bg-[#1f2937] text-white px-4 py-2 rounded-full text-sm font-bold items-center gap-1 hover:bg-gray-800 shadow-lg shadow-gray-200 transition-colors">
                    ดูทั้งหมด <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
                  {articles.slice(0, 3).map((article: any, idx: number) => (
                    <Link href={`/articles/${article.id}`} key={article.id} className={`group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all h-[280px] block transform hover:-translate-y-2 duration-500 ${idx === 1 ? 'md:-translate-y-4' : ''}`}>
                      {/* Animated Sparkles / Attention grabbers in the background */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      
                      <img src={article.imageUrl || "https://placehold.co/800x600/ffe4e6/ff758f"} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937]/90 via-[#1f2937]/40 to-transparent flex flex-col justify-end p-6">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[#ff758f] text-xs font-black mb-2 uppercase tracking-wider">
                            {new Date(article.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-snug">{article.title}</h3>
                          <p className="text-white/70 line-clamp-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{article.content}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
