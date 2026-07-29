"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export function ProfileSetupModal() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      checkProfile();
    } else {
      setShowModal(false);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const checkProfile = async () => {
    try {
      const { data } = await axios.get("/api/user/profile");
      if (!data.user || !data.user.firstName || !data.user.phone) {
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      await axios.post("/api/user/profile", formData);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!showModal || loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
        <div className="p-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-3xl mb-6 text-[#ff758f]">
            👤
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">ยินดีต้อนรับสมาชิกใหม่!</h2>
          <p className="text-gray-500 mb-8 text-sm">กรุณากรอกข้อมูลติดต่อพื้นฐาน เพื่อความสะดวกในการจองบ้านพักพูลวิลล่าในครั้งต่อไป</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อจริง <span className="text-red-500">*</span></label>
                <input 
                  required 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  type="text" 
                  placeholder="ชื่อ" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">นามสกุล <span className="text-red-500">*</span></label>
                <input 
                  required 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  type="text" 
                  placeholder="นามสกุล" 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input 
                required 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                type="tel" 
                placeholder="08-xxxx-xxxx" 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff758f] focus:ring-1 focus:ring-[#ff758f]" 
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#ff758f] hover:bg-[#ff5c77] disabled:bg-gray-300 text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg shadow-pink-200"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
