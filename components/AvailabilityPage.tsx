"use client";
import * as React from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { House } from "@/lib/api/houses";

const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function HouseCard({ house }: { house: House }) {
  const h = house as any;
  const price = parseInt(h.price || "0");
  const bed = h.hBedroom ?? h.h_bedroom ?? "?";
  const toilet = h.hToilet ?? h.h_toilet ?? "?";
  const people = h.people ?? "?";
  const img = h.imgName || h.img_name || "";
  const farsea = h.hFarsea || h.h_farsea || "";
  const swim = h.swim || "chlorine";
  const yn = (k: string) => h[k] === true || h[k] === "y";
  return (
    <a href={`https://www.poolvilla-pwth.com/houses/${(house as any).hId || house.h_id}`} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl border border-white/8 bg-[#111113] overflow-hidden hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
      <div className="relative h-44 overflow-hidden bg-[#1c1c1e]">
        {img
          ? <img src={img} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🏠</div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
        <span className="absolute top-2.5 right-2.5 text-xs font-semibold bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 px-2.5 py-1 rounded-full">DV-{(house as any).hId || house.h_id}</span>
        {swim !== "n" && <span className={`absolute top-2.5 left-2.5 text-xs px-2.5 py-1 rounded-full font-medium border backdrop-blur-sm ${swim === "salt" ? "bg-blue-500/20 border-blue-400/30 text-blue-200" : "bg-cyan-500/20 border-cyan-400/30 text-cyan-200"}`}>{swim === "salt" ? "🧂 Salt" : "🏊 Pool"}</span>}
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <p className="text-xs text-[#6b6b78]">{farsea ? `🌊 ${farsea}` : "พัทยา"}</p>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-xl leading-none">฿{price.toLocaleString()}</p>
            <p className="text-xs text-[#6b6b78]">/คืน</p>
          </div>
        </div>
        <div className="flex gap-3 text-sm text-[#a1a1aa]">
          <span>🛏 {bed} ห้อง</span><span>🚿 {toilet}</span><span>👥 {people} คน</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {yn("wifi") && <span className="text-xs bg-white/5 border border-white/8 text-[#a1a1aa] px-2 py-0.5 rounded-full">📶 WiFi</span>}
          {yn("pet") && <span className="text-xs bg-white/5 border border-white/8 text-[#a1a1aa] px-2 py-0.5 rounded-full">🐾 Pet</span>}
          {yn("karaoke") && <span className="text-xs bg-white/5 border border-white/8 text-[#a1a1aa] px-2 py-0.5 rounded-full">🎤 คาราโอเกะ</span>}
          {yn("jacuzzi") && <span className="text-xs bg-white/5 border border-white/8 text-[#a1a1aa] px-2 py-0.5 rounded-full">🛁 จากุซซี่</span>}
          {yn("grill") && <span className="text-xs bg-white/5 border border-white/8 text-[#a1a1aa] px-2 py-0.5 rounded-full">🍖 ปิ้งย่าง</span>}
        </div>
      </div>
    </a>
  );
}

// สถานะแต่ละวันจาก API
type DayInfo = { booked: number; waiting: number; repair: number; holiday: number; hotpro: number; free: number; available: number };

function CalGrid({ month, sel, heatmap, today, onSelect }: {
  month: Date; sel: Date | null;
  heatmap: Record<string, DayInfo | number>;
  today: Date; onSelect: (d: Date) => void;
}) {
  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  // รับ DayInfo จาก heatmap
  const getInfo = (key: string): DayInfo | null => {
    const v = heatmap[key];
    if (!v) return null;
    if (typeof v === "number") return { booked: 0, waiting: 0, repair: 0, holiday: 0, hotpro: 0, free: v, available: v };
    return v as DayInfo;
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {THAI_DAYS.map((d, i) => (
        <div key={d} className={`text-center text-xs font-semibold py-1 ${i === 0 || i === 6 ? "text-red-400" : "text-[#6b6b78]"}`}>{d}</div>
      ))}
      {cells.map((day, i) => {
        if (!day) return <div key={`e${i}`} />;
        const date = new Date(y, m, day);
        const yKey = date.getFullYear();
        const mKey = String(date.getMonth() + 1).padStart(2, "0");
        const dKey = String(date.getDate()).padStart(2, "0");
        const key = `${yKey}-${mKey}-${dKey}`;
        const isSel = sel?.toDateString() === date.toDateString();
        const isPast = date < today;
        const isToday = date.toDateString() === today.toDateString();
        const isWknd = date.getDay() === 0 || date.getDay() === 6;
        const info = getInfo(key);

        // กำหนดสีตามลำดับความสำคัญ (เหมือนต้นฉบับ)
        // repair > booked > waiting > hotpro > holiday > free
        let bg = "", textCls = "", icon = "";
        if (isSel) {
          bg = "bg-emerald-500 shadow-lg shadow-emerald-500/30 scale-110";
          textCls = "text-white font-bold";
        } else if (isPast) {
          bg = "";
          textCls = "text-[#3a3a3a] cursor-not-allowed";
        } else if (info) {
          const total = (info.booked || 0) + (info.waiting || 0) + (info.repair || 0);
          if (info.repair > 0) {
            // ปิดซ่อม
            bg = "bg-orange-500"; textCls = "text-white font-bold";
          } else if (info.booked > 0) {
            // ติดจอง
            bg = "bg-red-500"; textCls = "text-white font-bold";
          } else if (info.waiting > 0) {
            // รอโอน
            bg = "bg-pink-500"; textCls = "text-white font-bold";
          } else if (info.hotpro > 0) {
            // โปรโมชั่น
            bg = "bg-orange-400/20 border border-orange-400/40"; textCls = "text-orange-300 font-semibold"; icon = "🔥";
          } else if (info.holiday > 0) {
            // วันหยุด
            bg = "bg-yellow-400/20 border border-yellow-400/40"; textCls = "text-yellow-300 font-semibold";
          } else {
            // ว่าง
            bg = "bg-teal-500/15 border border-teal-500/30"; textCls = `${isWknd ? "text-red-300" : "text-teal-300"} font-medium`;
          }
        } else {
          textCls = `${isWknd ? "text-red-400" : "text-[#a1a1aa]"}`;
        }

        const isToday2 = isToday && !isSel ? "ring-2 ring-emerald-400" : "";
        const canClick = !isPast && info !== null || !isPast;

        return (
          <button
            key={key}
            onClick={() => !isPast && onSelect(date)}
            disabled={isPast}
            className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all duration-150 ${bg} ${textCls} ${isToday2} ${canClick && !isPast ? "hover:opacity-90 cursor-pointer" : ""}`}
          >
            {icon && <span className="absolute top-0.5 right-0.5 text-[8px] leading-none">{icon}</span>}
            <span>{day}</span>
            {info && !isSel && info.available > 0 && !isPast && (
              <span className="text-[8px] opacity-60 leading-none">{info.available}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AvailabilityPage() {
  const [month, setMonth] = React.useState(new Date());
  const [sel, setSel] = React.useState<Date | null>(null);
  const [houses, setHouses] = React.useState<House[]>([]);
  const [heatmap, setHeatmap] = React.useState<Record<string, number>>({});
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [dbMode, setDbMode] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState({
    beds: [] as number[], maxPrice: 0, peoples: [] as number[], swim: "" as "" | "salt" | "chlorine",
    pet: false, karaoke: false, jacuzzi: false, wifi: false, grill: false,
    snooker: false, discotech: false, slider: false, billard: false,
    sort: "price_asc" as "price_asc" | "price_desc" | "bed_asc" | "bed_desc",
  });
  const [filtersOpen, setFiltersOpen] = React.useState(true);
  const [mobileSheet, setMobileSheet] = React.useState<"calendar" | "filter" | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "repair" | "booked" | "waiting" | "free" | "hotpro" | "holiday">("all");
  const exactMatchId = React.useMemo(() => {
    if (!search) return null;
    const match = search.match(/(?:dv-?)?(\d+)/i);
    if (match && match[1].length >= 1) return match[1];
    return null;
  }, [search]);
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  React.useEffect(() => {
    const y = month.getFullYear(), m2 = month.getMonth() + 1;
    Promise.all([
      axios.get("/api/availability").then(r => r.data),
      axios.get(`/api/availability?year=${y}&month=${m2}`).then(r => r.data).catch(() => ({})),
    ]).then(([hr, cr]) => {
      setHouses(hr.houses || []); setTotal(hr.houses?.length || 0); setDbMode(hr.dbMode ?? false);
      if (cr.heatmap) { setHeatmap(cr.heatmap); setTotal(cr.totalHouses || hr.houses?.length || 0); }
    }).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    const y = month.getFullYear(), m2 = month.getMonth() + 1;
    const url = `/api/availability?year=${y}&month=${m2}` + (exactMatchId ? `&houseId=${exactMatchId}` : "");
    axios.get(url).then(r => r.data)
      .then(d => { if (d.heatmap) { setHeatmap(d.heatmap); if (d.totalHouses && !exactMatchId) setTotal(d.totalHouses); } }).catch(() => { });
  }, [month, exactMatchId]);

  const handleDate = async (date: Date) => {
    setSel(date); setLoading(true);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    const res = await axios.get(`/api/availability?date=${key}`).then(r => r.data).catch(() => null);
    if (res?.houses) { setHouses(res.houses); setDbMode(res.dbMode ?? false); }
    setLoading(false);
  };

  const yn = (h: any, k: string) => h[k] === true || h[k] === "y";
  const activeCount = [filters.beds.length, filters.maxPrice, filters.peoples.length, filters.swim, filters.pet, filters.karaoke, filters.jacuzzi, filters.wifi, filters.grill, filters.snooker, filters.discotech, filters.slider, filters.billard].filter(Boolean).length;
  const reset = () => { setSearch(""); setStatusFilter("all"); setFilters({ beds: [], maxPrice: 0, peoples: [], swim: "", pet: false, karaoke: false, jacuzzi: false, wifi: false, grill: false, snooker: false, discotech: false, slider: false, billard: false, sort: "price_asc" }); };

  const filtered = React.useMemo(() => {
    return [...houses].filter(h => {
      const ha = h as any;
      const id = `DV-${ha.hId || ha.h_id}`.toLowerCase();
      const zone = (ha.hFarsea || ha.h_farsea || "").toLowerCase();
      if (sel) {
        const ds = ha.dayStatus || "free";
        if (statusFilter !== "all" && ds !== statusFilter) return false;
        if (statusFilter === "all" && ["booked", "waiting", "repair"].includes(ds)) return false;
      }
      if (search && !id.includes(search.toLowerCase()) && !zone.includes(search.toLowerCase())) return false;
      const bed = parseInt(ha.hBedroom ?? ha.h_bedroom ?? "0");
      if (filters.beds.length > 0) {
        const match = filters.beds.some(n => n === 8 ? bed >= 8 : bed === n);
        if (!match) return false;
      }
      const price = parseInt(ha.price ?? "0");
      if (filters.maxPrice && price > filters.maxPrice) return false;
      const ppl = parseInt(ha.people ?? "0");
      if (filters.peoples.length > 0) {
        const minP = Math.min(...filters.peoples);
        if (ppl < minP) return false;
      }
      if (filters.swim && (ha.swim || "chlorine") !== filters.swim) return false;
      for (const k of ["pet", "karaoke", "jacuzzi", "wifi", "grill", "snooker", "discotech", "slider", "billard"] as const)
        if (filters[k] && !yn(ha, k)) return false;
      return true;
    }).sort((a, b) => {
      const ap = parseInt((a as any).price ?? "0"), bp = parseInt((b as any).price ?? "0");
      const ab = parseInt((a as any).hBedroom ?? (a as any).h_bedroom ?? "0");
      const bb = parseInt((b as any).hBedroom ?? (b as any).h_bedroom ?? "0");
      if (filters.sort === "price_asc") return ap - bp;
      if (filters.sort === "price_desc") return bp - ap;
      if (filters.sort === "bed_asc") return ab - bb;
      if (filters.sort === "bed_desc") return bb - ab;
      return 0;
    });
  }, [houses, search, filters]);

  const navM = (d: number) => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + d); return n; });
  const btnCls = (on: boolean) => `text-md py-1.5 px-2 rounded-lg border transition-all ${on ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-white/5 border-white/10 text-white hover:border-white/20"}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#09090b]/95 backdrop-blur-xl">
        <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/20">🏊</span>
            <div>
              <p className="font-semibold text-sm leading-none">Pool Villa Praewa</p>
              <p className="text-xs text-[#6b6b78] mt-0.5">พัทยา</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dbMode
              ? <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">🟢 Live DB</Badge>
              : <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">⚡ Real-time</Badge>}
            <span className="text-xs text-[#6b6b78]">{total} หลัง</span>
          </div>
        </div>
      </header>

      {/* Mobile bottom navbar - แสดงเฉพาะมือถือ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#09090b]/95 backdrop-blur-xl">
        <div className="flex items-center h-16">
          <button onClick={() => setMobileSheet(s => s === "calendar" ? null : "calendar")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${mobileSheet === "calendar" ? "text-emerald-400" : "text-[#6b6b78] hover:text-white"}`}>
            <span className="text-xl">📅</span>
            <span className="text-[10px] font-medium">ปฏิทิน</span>
            {sel && <span className="text-[9px] text-emerald-400">{sel.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</span>}
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button onClick={() => setMobileSheet(s => s === "filter" ? null : "filter")}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${mobileSheet === "filter" ? "text-emerald-400" : "text-[#6b6b78] hover:text-white"}`}>
            <span className="text-xl">🔍</span>
            <span className="text-[10px] font-medium">ค้นหา / กรอง</span>
            {activeCount > 0 && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 rounded-full px-1.5">{activeCount}</span>}
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button onClick={() => { if (sel) { setSel(null); axios.get("/api/availability").then(r => setHouses(r.data.houses || [])); } }}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${!sel ? "text-[#3a3a3a]" : "text-[#6b6b78] hover:text-red-400"}`}
            disabled={!sel}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-medium">ดูทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Sheet ปฏิทิน (mobile) */}
      <Sheet open={mobileSheet === "calendar"} onOpenChange={o => !o && setMobileSheet(null)}>
        <SheetContent side="top" className="bg-[#0f0f12] border-b border-white/10 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-sm">📅 เลือกวันที่ต้องการเช็คห้องว่าง</SheetTitle>
          </SheetHeader>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-white/8 bg-[#111113] p-3 text-center">
              <p className="text-xs text-[#6b6b78]">บ้านทั้งหมด</p>
              <p className="text-2xl font-bold text-white">{total}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#111113] p-3 text-center">
              <p className="text-xs text-[#6b6b78]">{sel ? `ว่าง ${sel.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}` : "แสดงอยู่"}</p>
              <p className="text-2xl font-bold text-emerald-400">{filtered.length}</p>
            </div>
          </div>
          {/* Calendar */}
          <div className="rounded-xl border border-white/8 bg-[#111113] p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navM(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-[#a1a1aa] hover:text-white transition-colors">‹</button>
              <div className="text-center">
                <p className="font-semibold text-sm text-white">{THAI_MONTHS[month.getMonth()]} {month.getFullYear() + 543}</p>
                {!dbMode && <p className="text-xs text-amber-400 mt-0.5">⚠ ยังไม่มีข้อมูล DB</p>}
              </div>
              <button onClick={() => navM(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-[#a1a1aa] hover:text-white transition-colors">›</button>
            </div>
            <CalGrid month={month} sel={sel} heatmap={heatmap} today={today}
              onSelect={d => { handleDate(d); setMobileSheet(null); }} />
            <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-2 gap-x-4 gap-y-2">
              {([["bg-orange-500", "ปิดซ่อม"], ["bg-red-500", "ติดจอง"], ["bg-pink-500", "รอโอน"], ["bg-teal-500/15 border border-teal-500/30", "ว่าง"], ["bg-orange-400/20 border border-orange-400/40", "โปรโมชั่น 🔥"], ["bg-yellow-400/20 border border-yellow-400/40", "วันหยุด"]] as const).map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${c} inline-block shrink-0`} />
                  <span className="text-xs text-[#a1a1aa]">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet กรอง (mobile) */}
      <Sheet open={mobileSheet === "filter"} onOpenChange={o => !o && setMobileSheet(null)}>
        <SheetContent side="top" className="bg-[#0f0f12] border-b border-white/10 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white text-sm flex items-center gap-2">
              🔍 ค้นหาและกรอง
              {activeCount > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">{activeCount}</span>}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b78] text-sm">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา DV-XXXX, โซน..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#6b6b78] focus:outline-none focus:border-emerald-500/50 transition-colors" />
            </div>
            {sel && <div className="mb-3">
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">สถานะบ้าน</p>
              <div className="grid grid-cols-2 gap-1">
                {(Object.entries({ "all": "ทั้งหมด", "repair": "ปิดซ่อม", "booked": "ติดจอง", "waiting": "รอโอน", "free": "ว่าง", "hotpro": "โปรโมชั่น 🔥", "holiday": "วันหยุด" }) as [typeof statusFilter, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setStatusFilter(v)} className={btnCls(statusFilter === v)}>{l}</button>
                ))}
              </div>
            </div>}
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">เรียงลำดับ</p>
              <div className="grid grid-cols-2 gap-1">
                {([["price_asc", "💰 ราคา ↑"], ["price_desc", "💰 ราคา ↓"], ["bed_asc", "🛏 ห้อง ↑"], ["bed_desc", "🛏 ห้อง ↓"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFilters(f => ({ ...f, sort: v }))} className={btnCls(filters.sort === v)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">ห้องนอน</p>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <button key={n} onClick={() => setFilters(f => ({ ...f, beds: f.beds.includes(n) ? f.beds.filter(x => x !== n) : [...f.beds, n] }))} className={btnCls(filters.beds.includes(n))}>{n === 8 ? "8+" : n}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">รับได้ (คน)</p>
              <div className="grid grid-cols-4 gap-1">
                {[4, 6, 8, 10, 12, 15, 20, 25].map(n => (
                  <button key={n} onClick={() => setFilters(f => ({ ...f, peoples: f.peoples.includes(n) ? f.peoples.filter(x => x !== n) : [...f.peoples, n] }))} className={btnCls(filters.peoples.includes(n))}>{n}+</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">ราคา/คืน (สูงสุด)</p>
              <div className="grid grid-cols-3 gap-1">
                {[0, 2000, 4000, 6000, 8000, 12000, 20000].map(n => (
                  <button key={n} onClick={() => setFilters(f => ({ ...f, maxPrice: f.maxPrice === n ? 0 : n }))} className={btnCls(filters.maxPrice === n && n > 0)}>{n === 0 ? "ทั้งหมด" : `≤${(n / 1000).toFixed(0)}K`}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">ประเภทสระ</p>
              <div className="grid grid-cols-3 gap-1">
                {([["", "🏊 ทั้งหมด"], ["chlorine", "🧪 Chlorine"], ["salt", "🧂 Salt"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFilters(f => ({ ...f, swim: v }))} className={btnCls(filters.swim === v && v !== "" || filters.swim === "" && v === "")}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6b6b78] uppercase tracking-wider mb-1.5">สิ่งอำนวยความสะดวก</p>
              <div className="grid grid-cols-3 gap-1">
                {([["wifi", "📶 WiFi"], ["pet", "🐾 Pet"], ["grill", "🍖 ปิ้งย่าง"], ["karaoke", "🎤 คาราโอเกะ"], ["jacuzzi", "🛁 จากุซซี่"], ["snooker", "🎱 สนุกเกอร์"], ["discotech", "🕺 ดิสโก้"], ["slider", "🛝 สไลเดอร์"], ["billard", "🎯 บิลเลียด"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setFilters(f => ({ ...f, [k]: !f[k] }))} className={btnCls(!!filters[k as keyof typeof filters])}>{l}</button>
                ))}
              </div>
            </div>
            {(search || activeCount > 0) && (
              <button onClick={() => { setSearch(""); reset(); }} className="w-full py-2 text-xs text-red-400 border border-red-500/20 rounded-xl transition-all">✕ ล้างตัวกรองทั้งหมด ({activeCount})</button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <div className="max-w-screen-xl mx-auto px-5 py-6 pb-20 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-[#111113] p-4">
                <p className="text-xs text-[#6b6b78] mb-1">บ้านทั้งหมด</p>
                <p className="text-2xl font-bold text-white">{total}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#111113] p-4">
                <p className="text-xs text-[#6b6b78] mb-1">{sel ? `ว่าง ${sel.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}` : "แสดงอยู่"}</p>
                <p className="text-2xl font-bold text-emerald-400">{filtered.length}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#111113] p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navM(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-[#a1a1aa] hover:text-white transition-colors">‹</button>
                <div className="text-center">
                  <p className="font-semibold text-sm text-white">{THAI_MONTHS[month.getMonth()]} {month.getFullYear() + 543}</p>
                  {!dbMode && <p className="text-xs text-amber-400 mt-0.5">⚠ ยังไม่มีข้อมูล DB</p>}
                </div>
                <button onClick={() => navM(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-[#a1a1aa] hover:text-white transition-colors">›</button>
              </div>
              <CalGrid month={month} sel={sel} heatmap={heatmap} today={today} onSelect={handleDate} />
              <div className="mt-4 pt-3 border-t border-white/8 grid grid-cols-2 gap-x-4 gap-y-2">
                {([["bg-orange-500", "ปิดซ่อม"], ["bg-red-500", "ติดจอง"], ["bg-pink-500", "รอโอน"], ["bg-teal-500/15 border border-teal-500/30", "ว่าง"], ["bg-orange-400/20 border border-orange-400/40", "โปรโมชั่น 🔥"], ["bg-yellow-400/20 border border-yellow-400/40", "วันหยุด"]] as const).map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-sm ${c} inline-block shrink-0`} />
                    <span className="text-xs text-[#a1a1aa]">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#111113] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">ค้นหาและกรอง</p>
                  {activeCount > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5">{activeCount}</span>}
                </div>
                <button onClick={() => setFiltersOpen(o => !o)} className="text-sm text-white hover:text-white transition-colors">{filtersOpen ? "▲ ซ่อน" : "▼ แสดง"}</button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b78] text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา DV-XXXX, โซน..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#6b6b78] focus:outline-none focus:border-emerald-500/50 transition-colors" />
              </div>

              {filtersOpen && <>
                {sel && <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">สถานะบ้าน</p>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {(Object.entries({ "all": "ทั้งหมด", "repair": "ปิดซ่อม", "booked": "ติดจอง", "waiting": "รอโอน", "free": "ว่าง", "hotpro": "โปรโมชั่น 🔥", "holiday": "วันหยุด" }) as [typeof statusFilter, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setStatusFilter(v)} className={btnCls(statusFilter === v)}>{l}</button>
                    ))}
                  </div>
                </div>}
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">เรียงลำดับ</p>
                  <div className="grid grid-cols-2 gap-1">
                    {([["price_asc", "💰 ราคา ↑"], ["price_desc", "💰 ราคา ↓"], ["bed_asc", "🛏 ห้อง ↑"], ["bed_desc", "🛏 ห้อง ↓"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setFilters(f => ({ ...f, sort: v }))} className={btnCls(filters.sort === v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">ห้องนอน</p>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <button key={n} onClick={() => setFilters(f => ({ ...f, beds: f.beds.includes(n) ? f.beds.filter(x => x !== n) : [...f.beds, n] }))} className={btnCls(filters.beds.includes(n))}>{n === 8 ? "8+" : n}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">รับได้ (คน)</p>
                  <div className="grid grid-cols-4 gap-1">
                    {[4, 6, 8, 10, 12, 15, 20, 25].map(n => (
                      <button key={n} onClick={() => setFilters(f => ({ ...f, peoples: f.peoples.includes(n) ? f.peoples.filter(x => x !== n) : [...f.peoples, n] }))} className={btnCls(filters.peoples.includes(n))}>{n}+</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">ราคา/คืน (สูงสุด)</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[0, 2000, 4000, 6000, 8000, 12000, 20000].map(n => (
                      <button key={n} onClick={() => setFilters(f => ({ ...f, maxPrice: f.maxPrice === n ? 0 : n }))} className={btnCls(filters.maxPrice === n && n > 0)}>{n === 0 ? "ทั้งหมด" : `≤${(n / 1000).toFixed(0)}K`}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">ประเภทสระ</p>
                  <div className="grid grid-cols-3 gap-1">
                    {([["", "🏊 ทั้งหมด"], ["chlorine", "🧪 Chlorine"], ["salt", "🧂 Salt"]] as const).map(([v, l]) => (
                      <button key={v} onClick={() => setFilters(f => ({ ...f, swim: v }))} className={btnCls(filters.swim === v && v !== "" || filters.swim === "" && v === "")}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-md font-medium text-white uppercase tracking-wider mb-1.5">สิ่งอำนวยความสะดวก</p>
                  <div className="grid grid-cols-3 gap-1">
                    {([["wifi", "📶 WiFi"], ["pet", "🐾 Pet"], ["grill", "🍖 ปิ้งย่าง"], ["karaoke", "🎤 คาราโอเกะ"], ["jacuzzi", "🛁 จากุซซี่"], ["snooker", "🎱 สนุกเกอร์"], ["discotech", "🕺 ดิสโก้"], ["slider", "🛝 สไลเดอร์"], ["billard", "🎯 บิลเลียด"]] as const).map(([k, l]) => (
                      <button key={k} onClick={() => setFilters(f => ({ ...f, [k]: !f[k] }))} className={btnCls(!!filters[k])}>{l}</button>
                    ))}
                  </div>
                </div>
                {(search || activeCount > 0) && (
                  <button onClick={reset} className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all">
                    ✕ ล้างตัวกรองทั้งหมด {activeCount > 0 && `(${activeCount})`}
                  </button>
                )}
              </>}
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-bold text-xl text-white">
                  {sel ? `บ้านว่าง — ${sel.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "long" })}` : "บ้านพูลวิลล่าทั้งหมด"}
                </h1>
                <p className="text-xs text-[#6b6b78] mt-0.5">แสดง {filtered.length} จาก {total} หลัง</p>
              </div>
              {sel && <button onClick={() => { setSel(null); axios.get("/api/availability").then(r => r.data).then(d => setHouses(d.houses || [])); }}
                className="text-xs text-[#6b6b78] hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors">✕ ดูทั้งหมด</button>}
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-2xl border border-white/8 bg-[#111113] h-60 animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-[#111113] p-16 text-center">
                <p className="text-4xl mb-3">🏖️</p>
                <p className="text-sm text-[#a1a1aa]">ไม่พบบ้านที่ตรงเงื่อนไข</p>
                <button onClick={reset} className="mt-3 text-xs text-emerald-400">ล้างตัวกรอง</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(h => <HouseCard key={(h as any).hId || (h as any).h_id} house={h} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


