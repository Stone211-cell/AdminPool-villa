"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminHousesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }
    if (!isAdmin) { router.push("/"); return; }
    fetchHouses();
  }, [isLoaded, isAdmin, user, router]);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/houses");
      setHouses(data);
    } catch { toast.error("ดึงข้อมูลบ้านล้มเหลว"); }
    finally { setLoading(false); }
  };

  const handleDelete = (hId: string, name: string) => {
    toast(`ยืนยันการลบบ้าน "${name || hId}"?`, {
      description: "⚠️ ข้อมูลทั้งหมดจะหายถาวร ไม่สามารถกู้คืนได้",
      action: {
        label: "ยืนยันลบทิ้ง",
        onClick: async () => {
          setDeletingId(hId);
          try {
            await axios.delete(`/api/admin/houses/${encodeURIComponent(hId)}`);
            toast.success("ลบบ้านสำเร็จ");
            window.location.reload();
          } catch (e: any) {
            toast.error(e.response?.data?.error || "ลบล้มเหลว");
            setDeletingId(null);
          }
        }
      },
      cancel: { label: "ยกเลิก", onClick: () => {} },
      duration: 10000,
    });
  };

  const togglePublish = async (hId: string, current: boolean) => {
    try {
      setHouses(prev => prev.map(h => h.hId === hId ? { ...h, isPublished: !current } : h));
      await axios.patch(`/api/admin/houses/${hId}`, { isPublished: !current });
      toast.success(!current ? "เผยแพร่บ้านแล้ว" : "ซ่อนบ้านจากหน้าเว็บแล้ว");
    } catch { toast.error("อัปเดตล้มเหลว"); fetchHouses(); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบ้านจำนวน ${selectedIds.length} หลังที่เลือก?`)) return;
    
    setIsProcessingBulk(true);
    try {
      for (const id of selectedIds) {
        await axios.delete(`/api/admin/houses/${encodeURIComponent(id)}`);
      }
      toast.success(`ลบบ้านสำเร็จ ${selectedIds.length} หลัง`);
      window.location.reload();
    } catch (e: any) {
      toast.error("เกิดข้อผิดพลาดในการลบบางรายการ");
      setIsProcessingBulk(false);
    }
  };

  const handleBulkTogglePublish = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการ${publish ? 'แสดง' : 'ซ่อน'}บ้านจำนวน ${selectedIds.length} หลังที่เลือก?`)) return;
    
    setIsProcessingBulk(true);
    try {
      for (const id of selectedIds) {
        await axios.patch(`/api/admin/houses/${encodeURIComponent(id)}`, { isPublished: publish });
      }
      toast.success(`${publish ? 'แสดง' : 'ซ่อน'}บ้านสำเร็จ ${selectedIds.length} หลัง`);
      setSelectedIds([]);
      fetchHouses();
    } catch (e: any) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตบางรายการ");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === houses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(houses.map(h => h.hId));
    }
  };

  if (!isLoaded || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Loading Overlay */}
      {(deletingId || isProcessingBulk) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-6"></div>
            <p className="text-xl font-black text-gray-900">กำลังประมวลผล...</p>
            <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่ ห้ามปิดหน้าต่างนี้</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              หน้าแอดมิน
            </Link>
            <h1 className="text-2xl font-black text-gray-900">🏠 จัดการบ้านพัก</h1>
            <p className="text-sm text-gray-500">ทั้งหมด {houses.length} หลัง</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {houses.length > 0 && (
              <button 
                onClick={toggleSelectAll}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                {selectedIds.length === houses.length ? (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg> เลิกเลือกทั้งหมด</>
                ) : (
                  <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> เลือกทั้งหมด</>
                )}
              </button>
            )}
            <Link
              href="/admin/houses/new"
              className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex-1 sm:flex-none"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            เพิ่มบ้านใหม่
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : houses.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🏚️</div>
            <h2 className="text-xl font-black text-gray-700 mb-2">ยังไม่มีบ้านในระบบ</h2>
            <p className="text-gray-400 mb-6">กดปุ่ม "เพิ่มบ้านใหม่" เพื่อเริ่มต้น</p>
            <Link href="/admin/houses/new" className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              เพิ่มบ้านใหม่
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {houses.map(house => (
              <div 
                key={house.hId} 
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative ${selectedIds.includes(house.hId) ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200'} ${!house.isPublished ? 'opacity-60 border-dashed border-gray-300' : 'border-gray-200'}`}
              >
                {/* Bulk Select Checkbox */}
                <div 
                  className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-gray-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); toggleSelection(house.hId); }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(house.hId)}
                    onChange={() => {}} 
                    className="w-5 h-5 text-purple-600 rounded cursor-pointer border-gray-300 focus:ring-purple-500"
                  />
                </div>

                {/* Cover Image */}
                <div className="relative h-44 bg-gradient-to-br from-purple-100 to-pink-100">
                  {house.images?.[0] ? (
                    <img src={house.images[0]} alt={house.name || house.hId} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {!house.isPublished && (
                      <span className="bg-gray-800/80 text-white text-[10px] font-black px-2 py-0.5 rounded-full">ซ่อนอยู่</span>
                    )}
                    {house.category !== "NORMAL" && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        house.category === "PROMOTION" ? "bg-orange-500 text-white" :
                        house.category === "RECOMMENDED" ? "bg-purple-600 text-white" : "bg-gray-600 text-white"
                      }`}>{house.category}</span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-full">#{house.hId}</span>
                  </div>
                  {/* Photo count */}
                  {house.images?.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {house.images.length}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-black text-gray-900 text-sm line-clamp-1 mb-0.5">{house.name || `บ้าน #${house.hId}`}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-3">{house.description || "ไม่มีคำอธิบาย"}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-0.5">🛏️ {house.hBedroom}</span>
                    <span className="flex items-center gap-0.5">🚿 {house.hToilet}</span>
                    <span className="flex items-center gap-0.5">👥 {house.people}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-purple-700 text-base">{Number(house.price).toLocaleString()} ฿<span className="text-xs font-normal text-gray-400">/คืน</span></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/houses/${house.hId}`}
                      className="flex-1 text-center py-2 bg-purple-50 text-purple-700 font-bold rounded-lg text-xs hover:bg-purple-100 transition-colors"
                    >
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => togglePublish(house.hId, house.isPublished)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                        house.isPublished ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={house.isPublished ? "คลิกเพื่อซ่อน" : "คลิกเพื่อเผยแพร่"}
                    >
                      {house.isPublished ? "📢" : "🔒"}
                    </button>
                    <button
                      onClick={() => handleDelete(house.hId, house.name)}
                      disabled={deletingId === house.hId}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === house.hId ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-200 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-500">เลือกแล้ว</span>
            <span className="text-xl font-black text-purple-600">{selectedIds.length} <span className="text-sm font-bold text-gray-700">รายการ</span></span>
          </div>
          
          <div className="w-px h-10 bg-gray-200"></div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkTogglePublish(true)}
              className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              👁️ แสดง
            </button>
            <button 
              onClick={() => handleBulkTogglePublish(false)}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              👁️‍🗨️ ซ่อน
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              🗑️ ลบที่เลือก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
