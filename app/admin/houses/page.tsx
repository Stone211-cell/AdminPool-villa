"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminHousesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      fetchHouses();
    }
  }, [isLoaded, isAdmin, router]);

  const fetchHouses = async () => {
    try {
      const { data } = await axios.get("/api/admin/houses");
      setHouses(data);
    } catch (e) {
      console.error(e);
      toast.error("ดึงข้อมูลบ้านล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const toggleOverride = async (hId: string, currentVal: boolean) => {
    try {
      setHouses(prev => prev.map(h => h.hId === hId ? { ...h, manualOverride: !currentVal } : h));
      await axios.patch(`/api/admin/houses/${hId}`, { manualOverride: !currentVal });
      toast.success(`เปลี่ยนสถานะ Manual Override เป็น ${!currentVal ? 'เปิด' : 'ปิด'}`);
    } catch (e) {
      toast.error("อัปเดตล้มเหลว");
      fetchHouses(); // revert
    }
  };

  const changeCategory = async (hId: string, newCat: string) => {
    try {
      setHouses(prev => prev.map(h => h.hId === hId ? { ...h, category: newCat } : h));
      await axios.patch(`/api/admin/houses/${hId}`, { category: newCat });
      toast.success("อัปเดตหมวดหมู่สำเร็จ");
    } catch (e) {
      toast.error("อัปเดตล้มเหลว");
      fetchHouses(); // revert
    }
  };

  const syncCalendar = async (hId: string) => {
    try {
      toast.loading(`กำลังดึงปฏิทิน BT-${hId}...`, { id: "sync" });
      await axios.post(`/api/admin/houses/${hId}`);
      toast.success(`ดึงปฏิทิน BT-${hId} สำเร็จ!`, { id: "sync" });
    } catch (e) {
      toast.error("ดึงข้อมูลล้มเหลว", { id: "sync" });
    }
  };

  if (!isLoaded || !isAdmin || loading) return <div className="p-8 text-center font-bold text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-black text-gray-900">จัดการบ้านพัก</h1>
            <p className="text-gray-500 mt-1">จำนวนบ้านทั้งหมด: {houses.length} หลัง</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map(h => (
            <div key={h.hId} className={`border rounded-2xl p-5 shadow-sm transition-all ${h.manualOverride ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-white'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  {h.imgName ? (
                    <img src={h.imgName} alt={h.hId} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                  )}
                  <div>
                    <h3 className="font-black text-lg text-gray-900">BT-{h.hId}</h3>
                    <p className="text-sm font-bold text-gray-500">{h.price.toLocaleString()} บาท</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Manual Override Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                  <div>
                    <p className="text-sm font-bold text-gray-800">ล็อกข้อมูล (Manual)</p>
                    <p className="text-xs text-gray-500">ไม่ให้ระบบทับข้อมูลที่แก้เอง</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={h.manualOverride} onChange={() => toggleOverride(h.hId, h.manualOverride)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">หมวดหมู่แนะนำหน้าแรก</label>
                  <select 
                    value={h.category} 
                    onChange={e => changeCategory(h.hId, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white font-semibold"
                  >
                    <option value="NORMAL">ปกติ (ซ่อน)</option>
                    <option value="PROMOTION">🔥 โปรโมชั่น (Promotion)</option>
                    <option value="RECOMMENDED">⭐️ แนะนำ (Recommended)</option>
                  </select>
                </div>

                {/* Sync Button */}
                <button 
                  onClick={() => syncCalendar(h.hId)}
                  className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  ดึงปฏิทินอัปเดตล่าสุด
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
