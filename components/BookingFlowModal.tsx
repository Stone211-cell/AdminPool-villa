"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";

const THAI_MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];

const STATUS = {
  booked:  { label: "ติดจอง", bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700", labelColor: "bg-purple-500" },
  waiting: { label: "รอชำระ", bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-600", labelColor: "bg-orange-500" },
  repair:  { label: "ปิดปรับปรุง", bg: "bg-red-50", border: "border-red-200", text: "text-red-500", labelColor: "bg-red-500" },
  holiday: { label: "ราคาพิเศษ", bg: "bg-green-50", border: "border-green-200", text: "text-green-600", labelColor: "bg-green-500" },
  free:    { label: "", bg: "bg-white", border: "border-gray-100", text: "text-gray-700", labelColor: "" },
} as const;

type DayStatus = keyof typeof STATUS;

export function BookingFlowModal({ house }: { house: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { isSignedIn } = useAuth();
  
  // Step 1: Calendar
  const [month, setMonth] = useState(new Date());
  const [heatmap, setHeatmap] = useState<Record<string, {status: DayStatus, price: number, people: number}>>({});
  const [loadingCal, setLoadingCal] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  // Step 2: Contact
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    adult: 1,
    child: 0,
    pet: 0,
    note: ""
  });
  
  // Step 3: Summary
  const [priceDetails, setPriceDetails] = useState({ nights: 0, totalPrice: 0 });

  // Open modal & fetch data
  const handleOpen = () => {
    setIsOpen(true);
    setStep(1);
    fetchHeatmap(month);
    if (isSignedIn) {
      axios.get("/api/user/profile").then(res => {
        if (res.data.user) {
          setFormData(prev => ({
            ...prev,
            name: `${res.data.user.firstName} ${res.data.user.lastName}`.trim(),
            phone: res.data.user.phone,
            email: res.data.user.email
          }));
        }
      });
    }
  };

  const fetchHeatmap = async (d: Date) => {
    setLoadingCal(true);
    try {
      const { data } = await axios.get(`/api/houses/${house.hId}/date-info`, {
        params: { y: d.getFullYear(), m: d.getMonth() + 1 }
      });
      // We assume date-info now returns more details or we just use default house price
      setHeatmap(data.heatmap || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCal(false);
    }
  };

  const navMonth = (dir: number) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + dir);
    setMonth(next);
    fetchHeatmap(next);
  };

  const handleDateClick = (date: Date, status: DayStatus) => {
    if (status === "booked" || status === "repair" || status === "waiting") {
      // Allow checkout on booked days if checkIn is set, but let's keep it simple: 
      // If no checkin, can't start on booked.
      if (!checkIn) return;
    }
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      setCheckOut(date);
      calculatePrice(checkIn, date);
    } else {
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  const calculatePrice = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Simplified price calculation
    const totalPrice = house.price * diffDays;
    setPriceDetails({ nights: diffDays, totalPrice });
  };

  const handleNext = () => {
    if (step === 1 && (!checkIn || !checkOut)) return alert("กรุณาเลือกวันเช็คอินและเช็คเอาท์");
    if (step === 2 && (!formData.name || !formData.phone)) return alert("กรุณากรอกข้อมูลติดต่อให้ครบถ้วน");
    setStep(s => s + 1);
  };

  const handleConfirm = () => {
    const deposit = Math.ceil((priceDetails.totalPrice * 0.6) / 100) * 100;
    const cid = checkIn?.toLocaleDateString('th-TH') || "";
    const cod = checkOut?.toLocaleDateString('th-TH') || "";
    const message = `[จองบ้านพัก]\nบ้าน: CITY-${house.hId}\nเช็คอิน: ${cid}\nเช็คเอาท์: ${cod}\nจำนวนคืน: ${priceDetails.nights} คืน\nผู้เข้าพัก: ผู้ใหญ่ ${formData.adult} เด็ก ${formData.child} สัตว์เลี้ยง ${formData.pet}\nรวมยอดที่พัก: ${priceDetails.totalPrice.toLocaleString()} บาท\nยอดมัดจำ(60%): ${deposit.toLocaleString()} บาท\n\nชื่อลูกค้า: ${formData.name}\nเบอร์โทร: ${formData.phone}\n${formData.email ? `อีเมล: ${formData.email}\n` : ''}${formData.note ? `หมายเหตุ: ${formData.note}` : ''}`;
    
    window.open(`https://line.me/R/oaMessage/@villadd/?${encodeURIComponent(message)}`, '_blank');
  };

  // Calendar render logic
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <>
      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-0.5">ราคาเริ่มต้น</p>
            <p className="text-[#ff758f] font-black text-xl md:text-2xl">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(house.price)} 
              <span className="text-sm text-gray-500 font-semibold"> / คืน</span>
            </p>
          </div>
          <button 
            onClick={handleOpen}
            className="bg-[#ff758f] hover:bg-[#ff5c77] text-white px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-lg shadow-lg shadow-pink-200 transition-all animate-bounce hover:animate-none"
          >
            จองบ้านพัก
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
            
            {/* Header & Progress */}
            <div className="bg-gray-50 border-b border-gray-100 p-6">
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-gray-800">✕</button>
              <h2 className="text-xl font-black text-gray-900 mb-6">จองบ้านพัก พูลวิลล่า CITY-{house.hId}</h2>
              
              <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0">
                   <div className="h-full bg-[#ff758f] rounded-full transition-all duration-300" style={{width: step === 1 ? '33%' : step === 2 ? '66%' : '100%'}}></div>
                </div>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#ff758f] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#ff758f] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-[#ff758f] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-bold text-gray-500">
                <span className={step >= 1 ? "text-[#ff758f]" : ""}>เลือกวัน</span>
                <span className={step >= 2 ? "text-[#ff758f]" : ""}>ข้อมูลติดต่อ</span>
                <span className={step >= 3 ? "text-[#ff758f]" : ""}>สรุปราคา</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
              
              {/* STEP 1: Calendar */}
              {step === 1 && (
                <div className={loadingCal ? "opacity-50 pointer-events-none" : ""}>
                   <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all font-bold">{"<"}</button>
                    <span className="font-black text-xl text-gray-800">{THAI_MONTHS_FULL[m]} {y + 543}</span>
                    <button onClick={() => navMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all font-bold">{">"}</button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {THAI_DAYS.map((d, i) => (
                      <div key={d} className="text-center text-sm font-bold pb-2 text-gray-500">{d}</div>
                    ))}
                    {cells.map((day, i) => {
                      if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                      
                      const key = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                      const cDate = new Date(y, m, day);
                      let statusStr: DayStatus = heatmap[key]?.status || "free";
                      if (cDate < today) statusStr = "free";

                      const st = STATUS[statusStr];
                      const isPast = cDate < today;
                      
                      const isCheckIn = checkIn && checkIn.getTime() === cDate.getTime();
                      const isCheckOut = checkOut && checkOut.getTime() === cDate.getTime();
                      const inRange = checkIn && checkOut && cDate > checkIn && cDate < checkOut;
                      
                      let cellBg = isPast ? "opacity-30 cursor-not-allowed bg-gray-50" : "cursor-pointer hover:border-[#ff758f] " + st.bg;
                      if (isCheckIn || isCheckOut) cellBg = "bg-[#ff758f] text-white shadow-md transform scale-105";
                      else if (inRange) cellBg = "bg-pink-50 border-pink-100";

                      return (
                        <div 
                          key={key} 
                          onClick={() => !isPast && handleDateClick(cDate, statusStr)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${cellBg} ${st.border}`}
                        >
                           <span className={`text-lg md:text-xl font-black ${isCheckIn||isCheckOut ? "text-white" : st.text}`}>{day}</span>
                           {!isPast && statusStr !== "free" && !(isCheckIn||isCheckOut) && (
                             <span className={`text-[10px] md:text-xs font-bold mt-1 px-1.5 py-0.5 rounded-md text-white ${st.labelColor}`}>{st.label}</span>
                           )}
                           {!isPast && statusStr === "free" && !(isCheckIn||isCheckOut) && (
                             <span className="text-[9px] md:text-[10px] text-gray-400 font-semibold mt-1">{house.price/1000}k</span>
                           )}
                        </div>
                      );
                    })}
                  </div>

                  {checkIn && checkOut && (
                    <div className="mt-8 p-4 bg-pink-50 rounded-2xl border border-pink-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-700">วันที่เลือก</p>
                        <p className="text-lg font-black text-[#ff758f]">
                          {checkIn.toLocaleDateString('th-TH')} - {checkOut.toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700">จำนวน</p>
                        <p className="text-lg font-black text-[#ff758f]">{priceDetails.nights} คืน</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Contact Form */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm focus:border-pink-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm focus:border-pink-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ผู้ใหญ่ <span className="text-red-500">*</span></label>
                      <input type="number" min="1" value={formData.adult} onChange={e => setFormData({...formData, adult: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">เด็ก</label>
                      <input type="number" min="0" value={formData.child} onChange={e => setFormData({...formData, child: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">สัตว์เลี้ยง</label>
                      <input type="number" min="0" value={formData.pet} onChange={e => setFormData({...formData, pet: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-3 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Summary */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-black text-lg text-gray-900 mb-4">สรุปรายละเอียดการจอง</h3>
                    <div className="space-y-2 text-sm font-semibold text-gray-600">
                      <div className="flex justify-between"><span className="text-gray-500">บ้านพัก:</span> <span className="text-gray-900">CITY-{house.hId}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">เช็คอิน:</span> <span className="text-gray-900">{checkIn?.toLocaleDateString('th-TH')} (14:00)</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">เช็คเอาท์:</span> <span className="text-gray-900">{checkOut?.toLocaleDateString('th-TH')} (12:00)</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">จำนวนคืน:</span> <span className="text-gray-900">{priceDetails.nights} คืน</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">ผู้เข้าพัก:</span> <span className="text-gray-900">ผู้ใหญ่ {formData.adult} เด็ก {formData.child} สัตว์เลี้ยง {formData.pet}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-700">ยอดรวมค่าที่พัก</span>
                      <span className="font-black text-xl text-gray-900">{priceDetails.totalPrice.toLocaleString()} บาท</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#ff758f]">ยอดมัดจำ (60%)</span>
                      <span className="font-black text-2xl text-[#ff758f]">{(Math.ceil((priceDetails.totalPrice * 0.6) / 100) * 100).toLocaleString()} บาท</span>
                    </div>
                    <p className="text-xs text-pink-600 font-semibold mt-4 text-center">
                      *ยอดคงเหลือ 40% และค่าประกันความเสียหายชำระในวันเช็คอิน
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="bg-white border-t border-gray-100 p-6 flex justify-between gap-4">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">ย้อนกลับ</button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button onClick={handleNext} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#ff758f] hover:bg-[#ff5c77] transition-colors shadow-lg shadow-pink-200">ดำเนินการต่อ</button>
              ) : (
                <button onClick={handleConfirm} className="flex-1 px-6 py-3 rounded-xl font-black text-white bg-[#00B900] hover:bg-[#009900] transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z"/></svg>
                  ยืนยันและจองผ่าน LINE
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
