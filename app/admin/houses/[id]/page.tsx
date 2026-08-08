"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

const TABS = ["ข้อมูลพื้นฐาน", "รูปภาพ", "ราคา", "สิ่งอำนวยความสะดวก", "รายละเอียดเพิ่มเติม"];

const AMENITY_LIST = [
  { key: "wifi", label: "WiFi", icon: "📶" },
  { key: "grill", label: "บาร์บีคิว/เตาปิ้ง", icon: "🔥" },
  { key: "pet", label: "รับสัตว์เลี้ยง", icon: "🐾" },
  { key: "karaoke", label: "คาราโอเกะ", icon: "🎤" },
  { key: "jacuzzi", label: "จากุซซี่", icon: "♨️" },
  { key: "snooker", label: "โต๊ะสนุ้กเกอร์", icon: "🎱" },
  { key: "discotech", label: "ดิสโก้เทค", icon: "🪩" },
  { key: "slider", label: "สไลเดอร์", icon: "🌊" },
  { key: "billard", label: "โต๊ะบิลเลียด", icon: "🎱" },
  { key: "swimmingKid", label: "สระเด็ก", icon: "🏊" },
  { key: "bath", label: "อ่างอาบน้ำ", icon: "🛁" },
];

const ZONES = ["pattaya", "sattahip", "other"];
const CATEGORIES = ["NORMAL", "RECOMMENDED", "PROMOTION", "OTHER"];
const SWIM_TYPES = [
  { value: "chlorine", label: "คลอรีน (Chlorine)" },
  { value: "salt", label: "เกลือ (Salt Water)" },
  { value: "natural", label: "ธรรมชาติ" },
];

export default function HouseEditorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const hId = params?.id as string;
  const isNew = hId === "new";

  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.publicMetadata?.isAdmin === true;

  // Form state
  const [form, setForm] = useState({
    hId: "", name: "", description: "", hZone: "pattaya",
    hBedroom: 3, hToilet: 3, price: 0, people: 8,
    images: [] as string[], swim: "chlorine",
    wifi: false, grill: false, pet: false, karaoke: false,
    jacuzzi: false, snooker: false, discotech: false, slider: false,
    billard: false, swimmingKid: false, bath: false,
    category: "NORMAL", isPublished: true, isActive: true,
    manualOverride: true,
    // detail
    checkin: "14:00", checkout: "12:00", extra: 0, insurance: 0,
    peopleMax: 8, location: "", parking: "", kitchen: "",
    fullDescription: "", amenities: [] as string[], nearbyPlaces: "",
    rules: "", mapUrl: "", alert: "", bedroomDetail: "",
    // pricing
    priceSun: 0, priceMon: 0, priceTue: 0, priceWed: 0,
    priceThu: 0, priceFri: 0, priceSat: 0,
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }
    if (!isAdmin) { router.push("/"); return; }
    if (!isNew) loadHouse();
  }, [isLoaded, isAdmin, user]);

  const loadHouse = async () => {
    try {
      const { data } = await axios.get(`/api/admin/houses/${hId}`);
      const d = data.detail || {};
      const bp = data.basePrices?.[0] || {};
      setForm({
        hId: data.hId || "", name: data.name || "", description: data.description || "",
        hZone: data.hZone || "pattaya", hBedroom: data.hBedroom || 3,
        hToilet: data.hToilet || 3, price: data.price || 0, people: data.people || 8,
        images: data.images || [], swim: data.swim || "chlorine",
        wifi: !!data.wifi, grill: !!data.grill, pet: !!data.pet, karaoke: !!data.karaoke,
        jacuzzi: !!data.jacuzzi, snooker: !!data.snooker, discotech: !!data.discotech,
        slider: !!data.slider, billard: !!data.billard, swimmingKid: !!data.swimmingKid,
        bath: !!data.bath, category: data.category || "NORMAL",
        isPublished: data.isPublished !== false, isActive: data.isActive !== false,
        manualOverride: data.manualOverride !== false,
        checkin: d.checkin || "14:00", checkout: d.checkout || "12:00",
        extra: d.extra || 0, insurance: d.insurance || 0,
        peopleMax: d.peopleMax || data.people || 8,
        location: d.location || "", parking: d.parking || "",
        kitchen: d.kitchen || "", fullDescription: d.fullDescription || "",
        amenities: d.amenities || [], nearbyPlaces: d.nearbyPlaces || "",
        rules: d.rules || "", mapUrl: d.mapUrl || "",
        alert: d.alert || "", bedroomDetail: d.bedroomDetail || "",
        priceSun: bp.priceSun || data.price || 0,
        priceMon: bp.priceMon || data.price || 0,
        priceTue: bp.priceTue || data.price || 0,
        priceWed: bp.priceWed || data.price || 0,
        priceThu: bp.priceThu || data.price || 0,
        priceFri: bp.priceFri || data.price || 0,
        priceSat: bp.priceSat || data.price || 0,
      });
    } catch { toast.error("โหลดข้อมูลล้มเหลว"); }
  };

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));
  const num = (key: string, val: string) => set(key, val === "" ? 0 : Number(val));

  // Handle image upload
  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fileArr.forEach(f => fd.append("files", f));
      const { data } = await axios.post("/api/admin/upload", fd);
      set("images", [...form.images, ...data.urls]);
      toast.success(`อัปโหลด ${data.urls.length} รูปสำเร็จ`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || "อัปโหลดล้มเหลว");
    } finally { setUploading(false); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }, [form.images]);

  const removeImage = (idx: number) => {
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (from: number, to: number) => {
    const imgs = [...form.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    set("images", imgs);
  };

  const handleSave = async () => {
    if (!form.hId && isNew) { toast.error("กรุณาใส่รหัสบ้าน"); return; }
    if (!form.price) { toast.error("กรุณาใส่ราคา"); return; }
    setSaving(true);
    try {
      if (isNew) {
        await axios.post("/api/admin/houses", form);
        toast.success("สร้างบ้านใหม่สำเร็จ!");
        router.push("/admin/houses");
      } else {
        await axios.patch(`/api/admin/houses/${hId}`, form);
        toast.success("บันทึกสำเร็จ!");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "บันทึกล้มเหลว");
    } finally { setSaving(false); }
  };

  if (!isLoaded || !isAdmin) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin/houses" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              จัดการบ้านพัก
            </Link>
            <h1 className="text-xl font-black text-gray-900">{isNew ? "➕ เพิ่มบ้านใหม่" : `✏️ แก้ไข ${form.name || `#${hId}`}`}</h1>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-60">
            {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-8 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`flex-1 min-w-max py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${activeTab === i ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Basic Info */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
              <h2 className="text-lg font-black text-gray-800">ข้อมูลพื้นฐาน</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {isNew && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสบ้าน (hId) <span className="text-red-500">*</span></label>
                    <input value={form.hId} onChange={e => set("hId", e.target.value)} placeholder="เช่น BT-001, A1, VILLA-101"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <p className="text-xs text-gray-400 mt-1">รหัสนี้จะใช้เป็น URL: /villas/BT-001</p>
                  </div>
                )}
                <div className={isNew ? "" : "sm:col-span-2"}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ชื่อบ้าน <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="เช่น Pool Villa Luxury พัทยา A1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">คำอธิบายสั้น</label>
                <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="เช่น บ้านพักพูลวิลล่าส่วนตัว วิวทะเล พัทยา สัตหีบ"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ห้องนอน</label>
                  <input type="number" min="1" value={form.hBedroom} onChange={e => num("hBedroom", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ห้องน้ำ</label>
                  <input type="number" min="1" value={form.hToilet} onChange={e => num("hToilet", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">คนได้มาตรฐาน</label>
                  <input type="number" min="1" value={form.people} onChange={e => num("people", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">คนสูงสุด</label>
                  <input type="number" min="1" value={form.peopleMax} onChange={e => num("peopleMax", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">โซน</label>
                  <select value={form.hZone} onChange={e => set("hZone", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">หมวดหมู่</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ประเภทสระ</label>
                  <select value={form.swim} onChange={e => set("swim", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
                    {SWIM_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                {[
                  { key: "isPublished", label: "📢 เผยแพร่บนเว็บ", desc: "ลูกค้าจะเห็นบ้านนี้" },
                  { key: "isActive", label: "✅ รับจองได้", desc: "ปุ่มจองจะปรากฏ" },
                  { key: "manualOverride", label: "🔒 ล็อกข้อมูล", desc: "ป้องกัน Sync ทับ" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors flex-1 min-w-48 ${(form as any)[key] ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-white"}`}>
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${(form as any)[key] ? "bg-purple-600" : "bg-gray-300"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <input type="checkbox" hidden checked={(form as any)[key]} onChange={e => set(key, e.target.checked)} />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Images */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-black text-gray-800 mb-5">รูปภาพบ้าน ({form.images.length} รูป)</h2>
              
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-6 ${
                  isDragging ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={e => e.target.files && uploadFiles(e.target.files)} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
                    <p className="text-purple-600 font-bold">กำลังอัปโหลด...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    </div>
                    <div>
                      <p className="font-black text-gray-700">ลากวางรูปหรือคลิกเพื่อเลือก</p>
                      <p className="text-sm text-gray-400">รองรับ JPG, PNG, WEBP — อัปโหลดได้หลายรูปพร้อมกัน</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Grid */}
              {form.images.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-3 font-semibold">รูปแรกจะเป็นรูปหน้าปก • ลากเพื่อเรียงลำดับ</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                        <img src={url} alt={`รูป ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">ปก</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx > 0 && (
                            <button onClick={() => moveImage(idx, idx - 1)} className="bg-white text-gray-800 p-1.5 rounded-lg hover:bg-gray-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                          )}
                          <button onClick={() => removeImage(idx)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                          {idx < form.images.length - 1 && (
                            <button onClick={() => moveImage(idx, idx + 1)} className="bg-white text-gray-800 p-1.5 rounded-lg hover:bg-gray-100">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
              <h2 className="text-lg font-black text-gray-800">ราคา</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ราคามาตรฐาน/คืน (฿) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.price || ""} onChange={e => num("price", e.target.value)} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                  <p className="text-xs text-gray-400 mt-1">ราคากลางที่แสดงบนหน้าเว็บ</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ค่าคนเสริม/คืน (฿)</label>
                  <input type="number" min="0" value={form.extra || ""} onChange={e => num("extra", e.target.value)} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ค่าประกันความเสียหาย (฿)</label>
                  <input type="number" min="0" value={form.insurance || ""} onChange={e => num("insurance", e.target.value)} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-700 mb-1">ราคาตามวันในสัปดาห์</h3>
                <p className="text-xs text-gray-400 mb-4">ระบุราคาแต่ละวัน (ถ้าเว้นไว้จะใช้ราคามาตรฐาน)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {[
                    { key: "priceSun", label: "อา." },
                    { key: "priceMon", label: "จ." },
                    { key: "priceTue", label: "อ." },
                    { key: "priceWed", label: "พ." },
                    { key: "priceThu", label: "พฤ." },
                    { key: "priceFri", label: "ศ." },
                    { key: "priceSat", label: "ส." },
                  ].map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                      <input type="number" min="0" value={(form as any)[key] || ""} onChange={e => num(key, e.target.value)} placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Amenities */}
        {activeTab === 3 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-lg font-black text-gray-800 mb-5">สิ่งอำนวยความสะดวก</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITY_LIST.map(({ key, label, icon }) => (
                <label key={key} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${(form as any)[key] ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <input type="checkbox" hidden checked={(form as any)[key]} onChange={e => set(key, e.target.checked)} />
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${(form as any)[key] ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                      {(form as any)[key] && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Details */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
              <h2 className="text-lg font-black text-gray-800">รายละเอียดเพิ่มเติม</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">เช็กอิน</label>
                  <input type="time" value={form.checkin} onChange={e => set("checkin", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">เช็กเอาท์</label>
                  <input type="time" value={form.checkout} onChange={e => set("checkout", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">รายละเอียดบ้านแบบเต็ม</label>
                <textarea value={form.fullDescription} onChange={e => set("fullDescription", e.target.value)} rows={5}
                  placeholder="บรรยายบ้านอย่างละเอียด วิว ตำแหน่ง บรรยากาศ..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">รายละเอียดห้องนอน</label>
                <textarea value={form.bedroomDetail} onChange={e => set("bedroomDetail", e.target.value)} rows={3}
                  placeholder="เช่น ห้องนอนใหญ่ 1 ห้อง เตียง King Size, ห้องนอนเล็ก 2 ห้อง เตียง Double..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">สถานที่ใกล้เคียง</label>
                <textarea value={form.nearbyPlaces} onChange={e => set("nearbyPlaces", e.target.value)} rows={2}
                  placeholder="เช่น ห่างจากหาดพัทยา 10 นาที, ใกล้ห้างสรรพสินค้า Terminal 21..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ที่จอดรถ</label>
                  <input value={form.parking} onChange={e => set("parking", e.target.value)} placeholder="เช่น จอดรถได้ 3 คัน"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">ครัวและเครื่องครัว</label>
                  <input value={form.kitchen} onChange={e => set("kitchen", e.target.value)} placeholder="เช่น ครัวพร้อมเครื่องครัวครบ"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">กฎบ้าน / ข้อควรระวัง</label>
                <textarea value={form.rules} onChange={e => set("rules", e.target.value)} rows={3}
                  placeholder="เช่น ห้ามสูบบุหรี่ในบ้าน, ห้ามจัดปาร์ตี้..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">ข้อความแจ้งเตือน (alert box)</label>
                <input value={form.alert} onChange={e => set("alert", e.target.value)} placeholder="เช่น กรุณาตรวจสอบบัญชีก่อนโอนเงิน"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Google Maps Embed URL</label>
                <input value={form.mapUrl} onChange={e => set("mapUrl", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                <p className="text-xs text-gray-400 mt-1">ไปที่ Google Maps → Share → Embed a map → Copy HTML → เอาเฉพาะ src="..."</p>
              </div>
            </div>
          </div>
        )}

        {/* Save button at bottom */}
        <div className="mt-6 flex justify-end gap-3">
          <Link href="/admin/houses" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-60">
            {saving ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
