"use client";

import { useState, useEffect } from "react";

interface BookingFormProps {
  house: any;
}

export function BookingForm({ house }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    adult: 0,
    child: 0,
    pet: 0,
    note: "",
    checkIn: "",
    checkOut: ""
  });

  const [priceDetails, setPriceDetails] = useState<{
    status: string;
    totalPrice: number;
    nights: number;
    isCalculating: boolean;
  }>({
    status: "idle",
    totalPrice: 0,
    nights: 0,
    isCalculating: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNumberChange = (field: string, delta: number) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + delta) }));
  };

  // Calculate pricing when dates change
  useEffect(() => {
    const calculatePrice = async () => {
      if (!formData.checkIn || !formData.checkOut) {
        setPriceDetails(prev => ({ ...prev, status: "idle", totalPrice: 0, nights: 0 }));
        return;
      }

      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      if (start >= end) {
        setPriceDetails(prev => ({ ...prev, status: "error", totalPrice: 0, nights: 0 }));
        return;
      }

      setPriceDetails(prev => ({ ...prev, isCalculating: true }));

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let total = 0;
      let hasError = false;

      // Check each day
      for (let i = 0; i < diffDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        try {
          const res = await fetch(`/api/houses/${house.hId}/date-info?date=${dateString}`);
          const data = await res.json();
          if (data.status === "booked" || data.status === "repair" || data.status === "waiting") {
            hasError = true;
            break;
          }
          total += data.price || house.price;
        } catch (err) {
          console.error(err);
          total += house.price; // fallback
        }
      }

      if (hasError) {
        setPriceDetails({ status: "unavailable", totalPrice: 0, nights: 0, isCalculating: false });
      } else {
        setPriceDetails({ status: "success", totalPrice: total, nights: diffDays, isCalculating: false });
      }
    };

    calculatePrice();
  }, [formData.checkIn, formData.checkOut, house.hId, house.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (priceDetails.status !== "success") return;
    
    // Redirect to LINE OA with message
    const deposit = Math.ceil((priceDetails.totalPrice * 0.6) / 100) * 100;
    
    const message = `[จองบ้านพัก]\nบ้าน: CITY-${house.hId}\nเช็คอิน: ${formData.checkIn}\nเช็คเอาท์: ${formData.checkOut}\nจำนวนคืน: ${priceDetails.nights} คืน\nผู้เข้าพัก: ผู้ใหญ่ ${formData.adult} เด็ก ${formData.child} สัตว์เลี้ยง ${formData.pet}\nรวมยอดที่พัก: ${priceDetails.totalPrice.toLocaleString()} บาท\nยอดมัดจำ(60%): ${deposit.toLocaleString()} บาท\n\nชื่อลูกค้า: ${formData.name}\nเบอร์โทร: ${formData.phone}\n${formData.email ? `อีเมล: ${formData.email}\n` : ''}${formData.note ? `หมายเหตุ: ${formData.note}` : ''}`;
    
    window.location.href = `https://line.me/R/oaMessage/@villadd/?${encodeURIComponent(message)}`;
  };

  const insurance = house.detail?.insurance || 5000;
  const deposit = Math.ceil((priceDetails.totalPrice * 0.6) / 100) * 100; // 60% rounded

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Contact Info */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-[#ff758f] flex items-center justify-center text-sm">1</span>
          ข้อมูลการติดต่อ
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
            <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="กรุณาระบุชื่อ-นามสกุล" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="08-0000-0000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">อีเมล</label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="กรุณากรอกอีเมล" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-pink-100 text-[#ff758f] flex items-center justify-center text-sm">2</span>
          รายละเอียดการจอง
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">เช็คอิน <span className="text-red-500">*</span></label>
            <input required name="checkIn" value={formData.checkIn} onChange={handleInputChange} type="date" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#ff758f] bg-gray-50" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">เช็คเอาท์ <span className="text-red-500">*</span></label>
            <input required name="checkOut" value={formData.checkOut} onChange={handleInputChange} type="date" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#ff758f] bg-gray-50" min={formData.checkIn || new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">ผู้ใหญ่ <span className="text-red-500">*</span></label>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => handleNumberChange("adult", -1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">-</button>
              <input readOnly value={formData.adult} className="w-full text-center text-sm font-bold outline-none" />
              <button type="button" onClick={() => handleNumberChange("adult", 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">เด็ก</label>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => handleNumberChange("child", -1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">-</button>
              <input readOnly value={formData.child} className="w-full text-center text-sm font-bold outline-none" />
              <button type="button" onClick={() => handleNumberChange("child", 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">+</button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">สัตว์เลี้ยง</label>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => handleNumberChange("pet", -1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">-</button>
              <input readOnly value={formData.pet} className="w-full text-center text-sm font-bold outline-none" />
              <button type="button" onClick={() => handleNumberChange("pet", 1)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 font-bold">+</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">หมายเหตุ</label>
            <input name="note" value={formData.note} onChange={handleInputChange} type="text" placeholder="ระบุเหตุผล" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff758f]" />
          </div>
        </div>

        <div className="bg-[#f0f4ff] border border-blue-100 rounded-xl p-4 text-xs text-blue-700 font-medium space-y-1">
          <p>ℹ️ เด็กพักฟรีสูงสุด 3 คน (คิดเพิ่มคนละ 300 บาท/คน/คืน)</p>
          <p>ℹ️ นำสัตว์เลี้ยงเข้าพักได้สูงสุด 2 ตัว (ค่าบริการ 500 บาท/ตัว/คืน)</p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-100 p-6 sticky top-24">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
          สรุปการจอง
        </h3>
        
        {priceDetails.isCalculating ? (
          <div className="text-center text-sm font-bold text-[#ff758f] py-4">กำลังคำนวณราคา...</div>
        ) : priceDetails.status === "error" ? (
          <div className="text-center text-sm font-bold text-red-500 py-4">กรุณาเลือกวันที่ให้ถูกต้อง</div>
        ) : priceDetails.status === "unavailable" ? (
          <div className="text-center text-sm font-bold text-red-500 py-4">วันที่เลือกไม่ว่าง (มีผู้จองแล้ว)</div>
        ) : priceDetails.status === "success" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
              <div className="text-gray-600">
                <span className="font-bold text-[#ff758f]">ราคาที่พัก</span> จำนวน {priceDetails.nights} คืน
                <p className="text-xs mt-1 text-gray-400">เข้าพัก {new Date(formData.checkIn).toLocaleDateString('th-TH')}</p>
              </div>
              <span className="font-black text-gray-900">{priceDetails.totalPrice.toLocaleString()} บาท</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-4">
              <div className="text-gray-600 w-2/3">
                <span className="font-bold text-purple-600">ค่าประกันที่พัก</span>
                <p className="text-xs mt-1 text-gray-400 leading-tight">(ชำระเมื่อ Check In กับเจ้าของบ้านและจะได้รับคืนหลัง Check Out)</p>
              </div>
              <span className="font-black text-gray-900">{insurance.toLocaleString()} บาท</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-600">ราคารวม (ไม่รวมค่าประกันที่พัก)</span>
              <span className="font-black text-gray-900">{priceDetails.totalPrice.toLocaleString()} บาท</span>
            </div>
            
            <div className="flex justify-between items-center text-lg bg-pink-50 p-3 rounded-xl border border-pink-100">
              <span className="font-black text-[#ff758f]">ราคารวมสุทธิ</span>
              <span className="font-black text-[#ff758f]">{priceDetails.totalPrice.toLocaleString()} บาท</span>
            </div>

            <div className="flex justify-between items-center text-base">
              <span className="font-bold text-gray-700">ราคามัดจำ (60%)</span>
              <span className="font-black text-gray-900">{deposit.toLocaleString()} บาท</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 py-4">กรุณาเลือกวันเช็คอินและเช็คเอาท์เพื่อคำนวณราคา</div>
        )}

        <div className="bg-yellow-50 rounded-xl p-4 mt-6 text-[10px] text-yellow-800 space-y-1 mb-6">
          <p className="font-bold mb-1">หมายเหตุ:</p>
          <p>1. ราคารวมสุทธิเป็นราคาที่รวมเซอร์วิสชาร์จ 10%, ภาษีท้องถิ่น 2%, ภาษีท้องถิ่น 0.5%, ภาษี 7% เรียบร้อยแล้ว</p>
          <p>2. ราคามัดจำจะเป็นการจ่ายเพื่อสำรองห้องพักไว้ เมื่อไปถึงที่พักจะต้องทำการส่วนที่เหลือกับเจ้าหน้าที่ดูแลบ้านพัก</p>
          <p>3. ค่าประกันที่พัก ชำระเมื่อ Check In จะได้รับคืนหลังจากลูกค้า Check out และเจ้าหน้าที่ทำการตรวจสอบความเรียบร้อย ของที่พักเรียบร้อยแล้ว โดยจะทำการโอนคืนกลับไปยังบัญชีที่ลูกค้าโอนเข้ามา</p>
        </div>

        <button 
          type="submit" 
          disabled={priceDetails.status !== "success" || formData.adult === 0 || !formData.name || !formData.phone}
          className="w-full bg-[#5b5bfe] hover:bg-[#4a4ae6] disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ยืนยันการจอง
        </button>
      </div>
    </form>
  );
}
