"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const THAI_MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];

const STATUS = {
  booked:  { label: "ติดจอง", bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700", labelColor: "bg-purple-500" },
  waiting: { label: "รอชำระ", bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-600", labelColor: "bg-orange-500" },
  repair:  { label: "ปิดปรับปรุง", bg: "bg-red-50", border: "border-red-200", text: "text-red-500", labelColor: "bg-red-500" },
  holiday: { label: "ราคาพิเศษ", bg: "bg-green-50", border: "border-green-200", text: "text-green-600", labelColor: "bg-green-500" },
  free:    { label: "", bg: "bg-white", border: "border-gray-100", text: "text-gray-700", labelColor: "" },
  hotpro:  { label: "ลดราคา", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-600", labelColor: "bg-cyan-500" },
} as const;

type DayStatus = keyof typeof STATUS;

export function BookingFlowModal({ house }: { house: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { isSignedIn } = useAuth();
  
  // Step 1: Calendar
  const [month, setMonth] = useState(new Date());
  const [heatmap, setHeatmap] = useState<Record<string, {status: DayStatus, price: number, oldPrice?: number, people: number}>>({});
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
  const [priceDetails, setPriceDetails] = useState({ nights: 0, totalPrice: 0, totalOldPrice: 0, hasDiscount: false });
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState<{ refCode: string; lineUrl: string } | null>(null);

  // Open modal & fetch data
  const handleOpen = () => {
    setIsOpen(true);
    setStep(1);
    setBookingDone(null);
    fetchHeatmap(month, false);
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

  const fetchHeatmap = async (d: Date, forceLoad = false) => {
    // ถ้าเคยโหลดเดือนนี้มาแล้ว หรือกำลังโหลดอยู่เบื้องหลัง ไม่ต้องขึ้น Spinner หมุนๆ ให้ลูกค้าเห็น
    const sampleKey = toDateKey(new Date(d.getFullYear(), d.getMonth(), 15));
    const shouldShowLoading = forceLoad || !heatmap[sampleKey];
    
    if (shouldShowLoading) setLoadingCal(true);
    try {
      const { data } = await axios.get(`/api/houses/${house.hId}/date-info`, {
        params: { y: d.getFullYear(), m: d.getMonth() + 1 }
      });
      setHeatmap(prev => ({ ...prev, ...(data.heatmap || {}) }));
      
      // แอบโหลดเดือนถัดไปมารอไว้เลย (Silent prefetch)
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      axios.get(`/api/houses/${house.hId}/date-info`, { params: { y: nextMonth.getFullYear(), m: nextMonth.getMonth() + 1 } })
        .then(res => setHeatmap(prev => ({ ...prev, ...(res.data.heatmap || {}) })))
        .catch(() => {});
        
    } catch (e) {
      console.error(e);
    } finally {
      if (shouldShowLoading) setLoadingCal(false);
    }
  };

  // แอบโหลดปฏิทินตั้งแต่ตอนที่ลูกค้าเข้ามาดูหน้ารายละเอียดบ้าน (Component Mount)
  useEffect(() => {
    fetchHeatmap(month, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navMonth = (dir: number) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + dir);
    setMonth(next);
    fetchHeatmap(next);
  };

  // Helper to format Date to YYYY-MM-DD
  const toDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleDateClick = (date: Date, status: DayStatus) => {
    const isBlocked = status === "booked" || status === "repair" || status === "waiting";
    
    if (isBlocked && !checkIn) {
      return toast.error("วันนี้ไม่ว่างให้เข้าพักครับ");
    }
    
    if (!checkIn || (checkIn && checkOut)) {
      if (isBlocked) return toast.error("วันนี้ไม่ว่างให้เข้าพักครับ");
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      // Check if there are any blocked dates in between
      let hasBlockedDate = false;
      const curr = new Date(checkIn);
      while (curr < date) {
        const key = toDateKey(curr);
        const s = heatmap[key]?.status || "free";
        if (s === "booked" || s === "repair" || s === "waiting") {
          hasBlockedDate = true;
          break;
        }
        curr.setDate(curr.getDate() + 1);
      }
      
      if (hasBlockedDate) {
        toast.error("มีวันที่ติดจองในช่วงที่คุณเลือก กรุณาเลือกใหม่ครับ");
        setCheckIn(date); // Reset to new checkIn
        setCheckOut(null);
        return;
      }
      setCheckOut(date);
    } else {
      if (isBlocked) return toast.error("วันนี้ไม่ว่างให้เข้าพักครับ");
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  useEffect(() => {
    if (checkIn && checkOut) {
      let totalPrice = 0;
      let totalOldPrice = 0;
      let hasDiscount = false;
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const curr = new Date(checkIn);
      for (let i = 0; i < diffDays; i++) {
        const key = toDateKey(curr);
        const dayInfo = heatmap[key];
        const p = dayInfo?.price || house.price;
        const oldP = dayInfo?.oldPrice || p;
        
        totalPrice += p;
        totalOldPrice += oldP;
        if (dayInfo?.oldPrice && dayInfo.oldPrice > p) hasDiscount = true;
        
        curr.setDate(curr.getDate() + 1);
      }
      
      setPriceDetails({ nights: diffDays, totalPrice, totalOldPrice, hasDiscount });
    }
  }, [checkIn, checkOut, heatmap, house.price]);

  const handleNext = () => {
    if (step === 1 && (!checkIn || !checkOut)) return toast.error("กรุณาเลือกวันเช็คอินและเช็คเอาท์");
    if (step === 2 && (!formData.name || !formData.phone)) return toast.error("กรุณากรอกข้อมูลติดต่อให้ครบถ้วน");
    setStep(s => s + 1);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post("/api/web/booking", {
        houseId: house.hId,
        checkIn,
        checkOut,
        adult: formData.adult,
        child: formData.child,
        pet: formData.pet,
        totalPrice: priceDetails.totalPrice,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        note: formData.note
      });

      if (res.data.success) {
        const message = `ยืนยันการจอง ${res.data.refCode}`;
        const lineUrl = `https://line.me/R/oaMessage/@villadd/?text=${encodeURIComponent(message)}`;

        if (res.data.lineSent) {
          // ลือคอินอยู่ และเราผูก LINE ได้ ส่ง push สำเร็จแล้ว
          toast.success("ส่งข้อมูลการจองไป LINE ของคุณเรียบร้อยแล้ว!");
          setBookingDone({ refCode: res.data.refCode, lineUrl });
        } else {
          // ไม่ได้ล็อคอิน หรือล็อคอินแต่ไม่มี LINE ID — ให้กดปุ่มเปิด LINE เอง
          setBookingDone({ refCode: res.data.refCode, lineUrl });
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
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
              <h2 className="text-xl font-black text-gray-900 mb-6">จองบ้านพัก พูลวิลล่า BT-{house.hId}</h2>
              
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
                <div className="relative">
                  {loadingCal && (
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                      <div className="w-10 h-10 border-4 border-pink-200 border-t-[#ff758f] rounded-full animate-spin"></div>
                    </div>
                  )}
                  
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
                      
                      if (isCheckIn) cellBg = "bg-[#ff758f] text-white shadow-md transform scale-105 border-[#ff758f]";
                      else if (isCheckOut) cellBg = "bg-white border-2 border-[#ff758f] text-[#ff758f] shadow-md transform scale-105";
                      else if (inRange) cellBg = "bg-pink-50 border-pink-100";

                      return (
                        <div 
                          key={key} 
                          onClick={() => !isPast && handleDateClick(cDate, statusStr)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${cellBg} ${st.border}`}
                        >
                           <span className={`text-lg md:text-xl font-black ${isCheckIn ? "text-white" : isCheckOut ? "text-[#ff758f]" : st.text}`}>{day}</span>
                           {!isPast && statusStr !== "free" && !(isCheckIn||isCheckOut) && (
                             <span className={`text-[10px] md:text-xs font-bold mt-1 px-1.5 py-0.5 rounded-md text-white ${st.labelColor}`}>{st.label}</span>
                           )}
                           
                           {!isPast && !(isCheckIn||isCheckOut) && (
                             <div className="flex flex-col items-center mt-1">
                               {(heatmap[key]?.oldPrice ?? 0) > (heatmap[key]?.price ?? 0) && (
                                 <span className="text-[9px] text-gray-400 line-through leading-none">
                                   {(heatmap[key]?.oldPrice || 0)/1000}k
                                 </span>
                               )}
                               <span className={`text-[9px] md:text-[10px] font-semibold leading-none mt-0.5 ${(heatmap[key]?.oldPrice ?? 0) > (heatmap[key]?.price ?? 0) ? "text-red-500 font-bold" : "text-gray-400"}`}>
                                 {(heatmap[key]?.price || house.price)/1000}k
                               </span>
                             </div>
                           )}
                           {isCheckIn && <span className="text-[9px] text-white/90 font-bold mt-0.5">Check-in</span>}
                           {isCheckOut && <span className="text-[9px] text-[#ff758f] font-bold mt-0.5">Check-out</span>}
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
                      <div className="flex justify-between"><span className="text-gray-500">บ้านพัก:</span> <span className="text-gray-900">BT-{house.hId}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">เช็คอิน:</span> <span className="text-gray-900">{checkIn?.toLocaleDateString('th-TH')} (14:00)</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">เช็คเอาท์:</span> <span className="text-gray-900">{checkOut?.toLocaleDateString('th-TH')} (12:00)</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">จำนวนคืน:</span> <span className="text-gray-900">{priceDetails.nights} คืน</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">ผู้เข้าพัก:</span> <span className="text-gray-900">ผู้ใหญ่ {formData.adult} เด็ก {formData.child} สัตว์เลี้ยง {formData.pet}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
                    {priceDetails.hasDiscount && (
                      <div className="flex justify-between items-center mb-1 text-gray-500">
                        <span className="font-bold">ราคาปกติ</span>
                        <span className="font-bold line-through">{priceDetails.totalOldPrice.toLocaleString()} บาท</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-700">
                        {priceDetails.hasDiscount ? "ยอดรวมราคาโปรโมชั่น" : "ยอดรวมค่าที่พัก"}
                      </span>
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
            <div className="bg-white border-t border-gray-100 p-6">
              {bookingDone ? (
                /* หลังจองสำเร็จ */
                <div className="text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="font-black text-gray-900 text-lg mb-1">จองสำเร็จแล้ว!</p>
                  <p className="text-sm text-gray-500 mb-1">รหัสการจอง: <span className="font-black text-[#ff758f]">{bookingDone.refCode}</span></p>
                  <p className="text-sm text-gray-500 mb-4">กดปุ่มด้านล่างเพื่อส่งข้อมูลยืนยันผ่าน LINE</p>
                  <a
                    href={bookingDone.lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-6 py-4 rounded-xl font-black text-white bg-[#00B900] hover:bg-[#009900] transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z"/></svg>
                    กดที่นี่เพื่อยืนยันผ่าน LINE
                  </a>
                  <button onClick={() => setIsOpen(false)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline">ปิดหน้าต่างนี้</button>
                </div>
              ) : (
                <div className="flex justify-between gap-4">
                  {step > 1 ? (
                    <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">ย้อนกลับ</button>
                  ) : <div></div>}

                  {step < 3 ? (
                    <button onClick={handleNext} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#ff758f] hover:bg-[#ff5c77] transition-colors shadow-lg shadow-pink-200">ดำเนินการต่อ</button>
                  ) : (
                    <button onClick={handleConfirm} disabled={submitting} className="flex-1 px-6 py-3 rounded-xl font-black text-white bg-[#00B900] hover:bg-[#009900] disabled:bg-gray-400 disabled:shadow-none transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                      {submitting ? (
                        <span className="animate-spin text-xl">⏳</span>
                      ) : (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.04.792.019 1.077l-.145.894c-.035.21-.163.805.706.438.869-.367 4.697-2.766 6.945-5.132 2.309-2.427 3.382-4.996 3.382-7.477z"/></svg>
                      )}
                      ยืนยันและจองผ่าน LINE
                    </button>
                  )}
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </>
  );
}
