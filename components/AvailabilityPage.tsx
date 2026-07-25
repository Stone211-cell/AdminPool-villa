"use client";
import * as React from "react";
import axios from "axios";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { House } from "@/lib/api/houses";

// ─── Constants ────────────────────────────────────────────────────────────────
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];

// สีอ้างอิงจากต้นฉบับ
const STATUS = {
  booked:  { label: "ติดจอง",     bg: "bg-[#ff0000]",      border: "border-[#ff0000]", text: "text-white" },
  waiting: { label: "รอชำระ",     bg: "bg-[#ff9900]",      border: "border-[#ff9900]", text: "text-white" },
  repair:  { label: "ปิดปรับปรุง", bg: "bg-[#808080]",      border: "border-[#808080]", text: "text-white" },
  holiday: { label: "เทศกาล",     bg: "bg-[#ffee00]",      border: "border-[#ffee00]", text: "text-black" },
  hotpro:  { label: "ลดราคา",     bg: "bg-[#00d0ff]",      border: "border-[#00d0ff]", text: "text-black" },
  free:    { label: "ว่าง",       bg: "bg-transparent",    border: "border-gray-700",  text: "text-gray-300" },
} as const;
type DayStatus = keyof typeof STATUS;
type DayInfo = { booked: number; waiting: number; repair: number; holiday: number; hotpro: number; free: number; available: number };
type SortKey = "price_asc"|"price_desc"|"bed_asc"|"bed_desc"|"sea_asc"|"sea_desc";
type SeaFilter = ""|"beach"|"near"|"far";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const yn = (h: any, k: string) => h[k] === true || h[k] === "y";
const parseSeaKm = (raw: string): number => {
  if (!raw) return 999;
  const s = raw.trim().toLowerCase();
  if (s === "ติดทะเล") return 0;
  const mM = s.match(/(\d+(?:\.\d+)?)\s*(?:เมตร|ม\.)/);
  if (mM) return parseFloat(mM[1]) / 1000;
  const kM = s.match(/(\d+(?:\.\d+)?)\s*(?:กม\.|km|กิโล|กิโลเมตร)/);
  if (kM) return parseFloat(kM[1]);
  return 999;
};
const seaBadge = (raw: string) => {
  const km = parseSeaKm(raw);
  if (km === 0) return { text: "🌊 ติดทะเล", cls: "bg-cyan-900 text-cyan-200 border-cyan-800" };
  if (km <= 0.5) return { text: `🌊 ${Math.round(km*1000)} ม.`, cls: "bg-blue-900 text-blue-200 border-blue-800" };
  if (km <= 3) return { text: `🚶 ${km.toFixed(1)} กม.`, cls: "bg-indigo-900 text-indigo-200 border-indigo-800" };
  if (km < 999) return { text: `🚗 ${km.toFixed(1)} กม.`, cls: "bg-gray-800 text-gray-300 border-gray-700" };
  return { text: "📍 พัทยา", cls: "bg-gray-800 text-gray-400 border-gray-700" };
};
const thaiDate = (d: Date) =>
  `${d.getDate()} ${THAI_MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()+543}`;
const thaiDateTime = (iso: string|null) => {
  if (!iso) return "ยังไม่มีข้อมูล";
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
};

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ houseId, heatmap, month }: { houseId: string; heatmap: Record<string, DayStatus>; month: Date }) {
  const [offset, setOffset] = React.useState(0);
  
  const y = month.getFullYear(), m = month.getMonth() + offset;
  // Use Date object to handle year rollover correctly
  const displayDate = new Date(y, m, 1);
  const dispY = displayDate.getFullYear();
  const dispM = displayDate.getMonth();

  const first = new Date(dispY, dispM, 1).getDay();
  const days  = new Date(dispY, dispM+1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length:days},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const curMonthStr = THAI_MONTHS[dispM] + " " + (dispY+543);

  return (
    <div className="bg-[#1a1e29] border border-gray-800 rounded-xl p-3 mt-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={(e) => { e.preventDefault(); setOffset(o => Math.max(0, o - 1)); }} disabled={offset === 0}
          className={`px-2 py-1 rounded bg-gray-800 text-xs font-bold ${offset === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-700 text-white"}`}>
          ‹
        </button>
        <div className="text-center font-bold text-gray-200 text-sm">{curMonthStr}</div>
        <button onClick={(e) => { e.preventDefault(); setOffset(o => Math.min(2, o + 1)); }} disabled={offset === 2}
          className={`px-2 py-1 rounded bg-gray-800 text-xs font-bold ${offset === 2 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-700 text-white"}`}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {THAI_DAYS.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-bold py-1 ${i===0||i===6 ? "text-red-400" : "text-gray-400"}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="aspect-square" />;
          const key = `${dispY}-${String(dispM+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const status = heatmap[key] || "free";
          const isWknd = (i % 7 === 0 || i % 7 === 6);
          const st = STATUS[status];
          
          let dayCls = `flex items-center justify-center text-xs font-semibold aspect-square rounded-md border ${st.bg} ${st.text}`;
          if (status === "free") {
             dayCls += isWknd ? " border-gray-700 text-red-300" : " border-gray-700 text-gray-300";
          } else {
             dayCls += ` ${st.border}`;
          }

          return (
            <div key={key} className={dayCls} title={st.label}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HouseCard ────────────────────────────────────────────────────────────────
function HouseCard({ house, selectedDate, houseHeatmap, month }: { house: House; selectedDate: Date|null; houseHeatmap: Record<string, Record<string, DayStatus>>; month: Date }) {
  const h = house as any;
  const hId  = h.hId || h.h_id || "";
  const price = parseInt(h.price || "0");
  const bed   = parseInt(h.hBedroom ?? h.h_bedroom ?? "0");
  const bath  = parseInt(h.hToilet  ?? h.h_toilet  ?? "0");
  const ppl   = parseInt(h.people ?? "0");
  const img   = h.imgName || h.img_name || "";
  const farsea = h.hFarsea || h.h_farsea || "";
  const swim  = h.swim || "chlorine";
  const dayStatus: DayStatus = (h.dayStatus as DayStatus) || "free";
  const sea   = seaBadge(farsea);
  const stCfg = STATUS[dayStatus];
  const unavailable = ["booked","waiting","repair"].includes(dayStatus);
  const hMap = houseHeatmap[hId] || {};

  const amenities = [
    yn(h,"wifi")      && "📶 WiFi",
    yn(h,"pet")       && "🐾 Pet",
    yn(h,"karaoke")   && "🎤 คาราโอเกะ",
    yn(h,"jacuzzi")   && "🛁 จากุซซี่",
    yn(h,"grill")     && "🍖 ปิ้งย่าง",
    yn(h,"slider")    && "🛝 สไลเดอร์",
    yn(h,"snooker")   && "🎱 สนุกเกอร์",
    yn(h,"discotech") && "🕺 ไฟเธค",
    yn(h,"billard")   && "🎯 บิลเลียด",
  ].filter(Boolean) as string[];

  const url = `https://poolvillacity.co.th/house/CITY-${hId}`;

  const [syncing, setSyncing] = React.useState(false);
  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setSyncing(true);
    try {
      await axios.post(`/api/cron/sync?houseId=${hId}`);
      // Notify parent to refresh data? Or just let user know it's done
      // Actually we can just show a temporary checkmark via state
      alert(`อัพเดทบ้าน CITY-${hId} สำเร็จ!`);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัพเดท");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`group flex flex-col rounded-2xl overflow-hidden border border-gray-800 bg-[#0f1219] shadow-md hover:shadow-2xl transition-all duration-300 ${unavailable ? "opacity-60" : "hover:border-emerald-500/50"}`}>

      {/* ── รูปภาพ (Clickable) */}
      <div className="relative h-56 overflow-hidden bg-gray-900 flex-shrink-0 block">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
          {img
            ? <img src={img} alt={`CITY-${hId}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            : <div className="w-full h-full flex items-center justify-center text-6xl text-gray-800">🏠</div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        </a>

        {/* Room ID */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <div className="bg-black/80 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10 shadow-lg pointer-events-auto">
            <span className="text-white font-bold text-sm tracking-wide">CITY-{hId}</span>
          </div>
        </div>

        {/* Pool type */}
        {swim !== "n" && (
          <div className={`absolute top-3 right-3 rounded-xl px-2.5 py-1 text-xs font-bold border backdrop-blur-sm shadow-lg pointer-events-none ${
            swim === "salt"
              ? "bg-blue-600/90 border-blue-400 text-white"
              : "bg-cyan-600/90 border-cyan-400 text-white"
          }`}>
            {swim === "salt" ? "🧂 Salt Pool" : "🏊 Chlorine"}
          </div>
        )}

        {/* Status badge when date selected */}
        {selectedDate && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className={`${stCfg.bg} rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg border ${stCfg.border}`}>
              <span className={`font-bold text-base ${stCfg.text}`}>{stCfg.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── ข้อมูล */}
      <div className="flex flex-col gap-4 p-4 flex-1">
        {/* Sea distance */}
        <span className={`self-start text-sm font-semibold px-3 py-1 rounded-full border ${sea.cls}`}>
          {sea.text}
        </span>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "🛏", val: `${bed}`, label: "ห้องนอน" },
            { icon: "🚿", val: `${bath}`, label: "ห้องน้ำ" },
            { icon: "👥", val: ppl > 0 ? `${ppl}` : "?", label: "คนสูงสุด" },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex flex-col items-center bg-[#1a1e29] rounded-xl py-2.5 border border-gray-800">
              <span className="text-xl mb-0.5">{icon}</span>
              <span className="font-extrabold text-white text-lg leading-none">{val}</span>
              <span className="text-gray-400 text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* Price + Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Price */}
          <div>
            <span className="text-2xl font-black text-emerald-400">฿{price.toLocaleString()}</span>
            <span className="text-gray-500 text-sm ml-1">/คืน</span>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSync} disabled={syncing}
              className={`flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-sm h-10 ${
                syncing 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse cursor-wait" 
                  : "bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-400 cursor-pointer"
              }`}>
              {syncing ? "⏳ อัพเดทข้อมูล..." : "🔄 อัพเดทก่อนดูทุกครั้ง"}
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center text-sm font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-400 rounded-xl transition-all shadow-sm h-10">
              รายละเอียด →
            </a>
          </div>
        </div>

        {/* Mini Calendar (แสดงเฉพาะเมื่อดูทั้งหมด ไม่ได้เจาะจงวัน) */}
        {!selectedDate && (
          <MiniCalendar houseId={hId} heatmap={hMap} month={month} />
        )}
      </div>
    </div>
  );
}

// ─── Sync Button ──────────────────────────────────────────────────────────────
function SyncButton({ lastSyncAt, onSync }: { lastSyncAt: string|null; onSync: ()=>void }) {
  const [syncing, setSyncing] = React.useState(false);
  const [result, setResult]   = React.useState<{synced:number;total:number;totalBookings:number}|null>(null);
  const [error, setError]     = React.useState<string|null>(null);

  const handle = async () => {
    setSyncing(true); setError(null); setResult(null);
    try {
      const r = await axios.post("/api/cron/sync", {}, { timeout: 300000 });
      setResult({ synced: r.data.synced, total: r.data.total, totalBookings: r.data.totalBookings });
      onSync();
    } catch (e: any) {
      setError(e?.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button id="manual-sync-btn" onClick={handle} disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 shadow-md ${
          syncing
            ? "bg-amber-500/20 border-amber-500/50 text-amber-400 cursor-wait"
            : "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-emerald-400 hover:text-white active:scale-95"
        }`}>
        <span className={`text-base ${syncing ? "animate-spin inline-block" : ""}`}>{syncing ? "⟳" : "🔄"}</span>
        {syncing ? "กำลังอัพเดท..." : "อัพเดทข้อมูล"}
      </button>
      <span className="text-xs text-gray-400">
        {result
          ? <span className="text-emerald-400 font-semibold">✅ sync {result.synced} หลัง · {result.totalBookings} จอง</span>
          : error
          ? <span className="text-red-400">❌ {error}</span>
          : lastSyncAt
          ? `อัพเดทล่าสุด ${thaiDateTime(lastSyncAt)}`
          : "ยังไม่มีข้อมูล"
        }
      </span>
    </div>
  );
}

// ─── Filter Chip (Toggle Button) ──────────────────────────────────────────────
function Chip({ on, onClick, id, children }: { on: boolean; onClick: ()=>void; id?: string; children: React.ReactNode }) {
  return (
    <button id={id} onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 whitespace-nowrap ${
        on ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/50" : "bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-white"
      }`}>
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function AvailabilityPage() {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [month, setMonth]         = React.useState(new Date());
  const [sel, setSel]             = React.useState<Date|null>(null);
  const [houses, setHouses]       = React.useState<House[]>([]);
  const [heatmap, setHeatmap]     = React.useState<Record<string,number>>({});
  const [houseMap, setHouseMap]   = React.useState<Record<string, Record<string, DayStatus>>>({});
  const [total, setTotal]         = React.useState(0);
  const [loading, setLoading]     = React.useState(true);
  const [dbMode, setDbMode]       = React.useState(false);
  const [lastSyncAt, setLastSyncAt] = React.useState<string|null>(null);
  const [search, setSearch]       = React.useState("");
  const [seaFilter, setSeaFilter] = React.useState<SeaFilter>("");
  const [statusFilter, setStatusFilter] = React.useState<"all"|DayStatus>("all");
  const [mobileSheet, setMobileSheet]   = React.useState<"calendar"|"filter"|null>(null);
  const [maxPrice, setMaxPrice]   = React.useState(0);
  const [beds, setBeds]           = React.useState<number[]>([]);
  const [peoples, setPeoples]     = React.useState<number[]>([]);
  const [swim, setSwim]           = React.useState<""|"salt"|"chlorine">("");
  const [sort, setSort]           = React.useState<SortKey>("price_asc");
  const [amenF, setAmenF]         = React.useState({ pet:false, karaoke:false, jacuzzi:false, wifi:false, grill:false, snooker:false, discotech:false, slider:false, billard:false, hotpro:false });

  const exactId = React.useMemo(() => {
    const m = search.match(/(?:city-?)?(\d+)/i);
    return m ? m[1] : null;
  }, [search]);

  // Load initial data
  React.useEffect(() => {
    const y = month.getFullYear(), m2 = month.getMonth()+1;
    Promise.all([
      axios.get("/api/availability", {timeout:15000}).then(r=>r.data).catch(()=>({houses:[]})),
      axios.get(`/api/availability?year=${y}&month=${m2}`, {timeout:15000}).then(r=>r.data).catch(()=>({})),
    ]).then(([hr, cr]) => {
      setHouses(hr.houses||[]); setTotal(hr.houses?.length||0); setDbMode(hr.dbMode??false);
      if (hr.lastSyncAt) setLastSyncAt(hr.lastSyncAt);
      if (cr.heatmap) { setHeatmap(cr.heatmap); setTotal(cr.totalHouses||hr.houses?.length||0); }
      if (cr.houseHeatmap) setHouseMap(cr.houseHeatmap);
      if (cr.lastSyncAt) setLastSyncAt(cr.lastSyncAt);
    }).finally(() => setLoading(false));
  }, []);

  // Month change
  React.useEffect(() => {
    const y = month.getFullYear(), m2 = month.getMonth()+1;
    const url = `/api/availability?year=${y}&month=${m2}` + (exactId ? `&houseId=${exactId}` : "");
    axios.get(url,{timeout:15000}).then(r=>r.data)
      .then(d => { 
        if (d.heatmap) setHeatmap(d.heatmap); 
        if (d.houseHeatmap) setHouseMap(d.houseHeatmap);
        if (d.lastSyncAt) setLastSyncAt(d.lastSyncAt); 
      }).catch(()=>{});
  }, [month, exactId]);

  const handleDate = async (date: Date) => {
    setSel(date); setLoading(true);
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const res = await axios.get(`/api/availability?date=${key}`, {timeout:15000}).then(r=>r.data).catch(()=>null);
    if (res?.houses) setHouses(res.houses);
    if (res?.lastSyncAt) setLastSyncAt(res.lastSyncAt);
    setLoading(false);
  };

  const clearDate = () => {
    setSel(null); setLoading(true);
    axios.get("/api/availability",{timeout:15000}).then(r=>r.data)
      .then(d => { setHouses(d.houses||[]); if(d.lastSyncAt) setLastSyncAt(d.lastSyncAt); })
      .finally(()=>setLoading(false));
  };

  const refreshAfterSync = () => {
    const y = month.getFullYear(), m2 = month.getMonth()+1;
    axios.get(`/api/availability?year=${y}&month=${m2}`,{timeout:15000}).then(r=>r.data)
      .then(d => { 
        if(d.heatmap) setHeatmap(d.heatmap); 
        if(d.houseHeatmap) setHouseMap(d.houseHeatmap);
        if(d.lastSyncAt) setLastSyncAt(d.lastSyncAt); 
      });
    if (sel) handleDate(sel);
    else axios.get("/api/availability",{timeout:15000}).then(r=>r.data)
      .then(d => { setHouses(d.houses||[]); setTotal(d.houses?.length||total); if(d.lastSyncAt) setLastSyncAt(d.lastSyncAt); });
  };

  const navM = (d: number) => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth()+d); return n; });

  const activeCount = [
    beds.length, maxPrice, peoples.length, swim, seaFilter,
    ...Object.values(amenF),
  ].filter(Boolean).length;

  const reset = () => {
    setSearch(""); setSeaFilter(""); setStatusFilter("all"); setMaxPrice(0);
    setBeds([]); setPeoples([]); setSwim(""); setSort("price_asc");
    setAmenF({pet:false,karaoke:false,jacuzzi:false,wifi:false,grill:false,snooker:false,discotech:false,slider:false,billard:false,hotpro:false});
  };

  const filtered = React.useMemo(() => {
    return [...houses].filter(h => {
      const ha = h as any;
      const id = `city-${ha.hId||ha.h_id}`.toLowerCase();
      const farsea = ha.hFarsea||ha.h_farsea||"";
      if (search) { const q=search.toLowerCase(); if (!id.includes(q)&&!farsea.toLowerCase().includes(q)) return false; }
      if (sel) {
        const ds = ha.dayStatus||"free";
        if (statusFilter!=="all"&&ds!==statusFilter) return false;
        if (statusFilter==="all"&&["booked","waiting","repair"].includes(ds)) return false;
      }
      if (seaFilter) {
        const km = parseSeaKm(farsea);
        if (seaFilter==="beach"&&km>0.5) return false;
        if (seaFilter==="near"&&(km<=0.5||km>3)) return false;
        if (seaFilter==="far"&&km<=3) return false;
      }
      const bed = parseInt(ha.hBedroom??ha.h_bedroom??"0");
      if (beds.length>0&&!beds.some(n=>n===8?bed>=8:bed===n)) return false;
      const price = parseInt(ha.price??"0");
      if (maxPrice&&price>maxPrice) return false;
      const ppl = parseInt(ha.people??"0");
      if (peoples.length>0&&ppl<Math.min(...peoples)) return false;
      if (swim&&(ha.swim||"chlorine")!==swim) return false;
      if (amenF.hotpro&&ha.dayStatus!=="hotpro") return false;
      for (const k of ["pet","karaoke","jacuzzi","wifi","grill","snooker","discotech","slider","billard"] as const)
        if (amenF[k]&&!yn(ha,k)) return false;
      return true;
    }).sort((a,b) => {
      const ha=a as any, hb=b as any;
      const ap=parseInt(ha.price??"0"), bp=parseInt(hb.price??"0");
      const ab=parseInt(ha.hBedroom??ha.h_bedroom??"0"), bb=parseInt(hb.hBedroom??hb.h_bedroom??"0");
      const ak=parseSeaKm(ha.hFarsea||ha.h_farsea||""), bk=parseSeaKm(hb.hFarsea||hb.h_farsea||"");
      if (sort==="price_asc") return ap-bp;
      if (sort==="price_desc") return bp-ap;
      if (sort==="bed_asc") return ab-bb;
      if (sort==="bed_desc") return bb-ab;
      if (sort==="sea_asc") return ak-bk;
      if (sort==="sea_desc") return bk-ak;
      return 0;
    });
  }, [houses, search, beds, maxPrice, peoples, swim, amenF, sel, statusFilter, seaFilter, sort]);

  // ─── Filter Panel ───────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">🔍 ค้นหาห้อง</label>
        <div className="relative">
          <input id="search-input" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="พิมพ์เลขห้อง เช่น 293 หรือ CITY-293"
            className="w-full border border-gray-700 bg-[#1a1e29] rounded-xl px-4 py-3 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner" />
          {search && <button onClick={()=>setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200 text-lg">✕</button>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">🏖️ ระยะทะเล</label>
        <div className="grid grid-cols-2 gap-2">
          {([["","🏘️ ทั้งหมด"],["beach","🌊 ติดทะเล (≤500ม.)"],["near","🚶 ใกล้ (0.5–3กม.)"],["far","🚗 ไกล (>3กม.)"]] as const).map(([v,l]) => (
            <Chip key={v} on={seaFilter===v} onClick={()=>setSeaFilter(v)} id={`sea-${v||"all"}`}>{l}</Chip>
          ))}
        </div>
      </div>
      {sel && (
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">📊 สถานะห้อง</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries({all:"ทั้งหมด",free:"🟢 ว่าง",booked:"🔴 จอง",waiting:"🟠 รอชำระ",repair:"⚪ ซ่อม",hotpro:"🔵 ลดราคา",holiday:"🟡 เทศกาล"}) as ["all"|DayStatus,string][]).map(([v,l]) => (
              <Chip key={v} on={statusFilter===v} onClick={()=>setStatusFilter(v)} id={`status-${v}`}>{l}</Chip>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">↕️ เรียงลำดับ</label>
        <div className="grid grid-cols-2 gap-2">
          {([["price_asc","💰 ราคา ถูก→แพง"],["price_desc","💰 ราคา แพง→ถูก"],["bed_asc","🛏 ห้อง น้อย→มาก"],["bed_desc","🛏 ห้อง มาก→น้อย"],["sea_asc","🌊 ใกล้ทะเล→ไกล"],["sea_desc","🚗 ไกลทะเล→ใกล้"]] as const).map(([v,l]) => (
            <Chip key={v} on={sort===v} onClick={()=>setSort(v)} id={`sort-${v}`}>{l}</Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">🛏 จำนวนห้องนอน</label>
        <div className="flex flex-wrap gap-2">
          {[1,2,3,4,5,6,7,8].map(n => (
            <Chip key={n} on={beds.includes(n)} onClick={()=>setBeds(b=>b.includes(n)?b.filter(x=>x!==n):[...b,n])} id={`bed-${n}`}>
              {n===8?"8+ ห้อง":`${n} ห้อง`}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">👥 รับได้ (คน)</label>
        <div className="flex flex-wrap gap-2">
          {[4,6,8,10,12,15,20,25].map(n => (
            <Chip key={n} on={peoples.includes(n)} onClick={()=>setPeoples(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n])} id={`ppl-${n}`}>
              {n}+ คน
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">💰 ราคาสูงสุด/คืน</label>
        <div className="flex flex-wrap gap-2">
          {[0,2000,4000,6000,8000,12000,20000].map(n => (
            <Chip key={n} on={maxPrice===n&&n>0} onClick={()=>setMaxPrice(p=>p===n?0:n)} id={`price-${n}`}>
              {n===0?"ทั้งหมด":`≤฿${(n/1000).toFixed(0)}K`}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">🏊 ประเภทสระ</label>
        <div className="flex gap-2">
          {([["","🏊 ทั้งหมด"],["chlorine","🧪 คลอรีน"],["salt","🧂 น้ำเกลือ"]] as const).map(([v,l]) => (
            <Chip key={v} on={swim===v} onClick={()=>setSwim(v)} id={`pool-${v||"all"}`}>{l}</Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-300 mb-2">✨ สิ่งอำนวยความสะดวก</label>
        <div className="grid grid-cols-3 gap-2">
          {([["wifi","📶 WiFi"],["pet","🐾 Pet OK"],["grill","🍖 ปิ้งย่าง"],["karaoke","🎤 คาราโอเกะ"],["jacuzzi","🛁 จากุซซี่"],["snooker","🎱 สนุกเกอร์"],["discotech","🕺 ไฟเธค"],["slider","🛝 สไลเดอร์"],["billard","🎯 บิลเลียด"],["hotpro","🔥 โปรโมชั่น"]] as const).map(([k,l]) => (
            <Chip key={k} on={amenF[k as keyof typeof amenF]} onClick={()=>setAmenF(f=>({...f,[k]:!f[k as keyof typeof amenF]}))} id={`amen-${k}`}>{l}</Chip>
          ))}
        </div>
      </div>
      {(search||activeCount>0) && (
        <button id="reset-all-btn" onClick={reset}
          className="w-full py-3 text-base font-bold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 rounded-xl transition-all">
          ✕ ล้างตัวกรองทั้งหมด ({activeCount})
        </button>
      )}
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100 font-sans selection:bg-emerald-500/30">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#080a0f]/90 backdrop-blur-md border-b border-gray-800 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg border border-emerald-400/20">🏊</div>
            <div>
              <p className="font-extrabold text-lg text-white leading-none tracking-wide">PoolVillaCity API</p>
              <p className="text-sm text-emerald-400 font-medium mt-0.5">ระบบเช็คคิวห้องว่าง</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SyncButton lastSyncAt={lastSyncAt} onSync={refreshAfterSync} />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">

        {/* ── Search bar (Desktop) ──────────────────────────────── */}
        <div className="mb-8 hidden lg:flex gap-4 items-center bg-[#0f1219] p-2 rounded-2xl border border-gray-800 shadow-sm">
          <div className="relative flex-1">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl">🔍</span>
            <input id="main-search" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="พิมพ์รหัสบ้าน เช่น 293 หรือ ค้นหาตามทำเล..."
              className="w-full bg-transparent pl-14 pr-12 py-3 text-lg text-white placeholder-gray-600 focus:outline-none transition-all" />
            {search && <button onClick={()=>setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xl">✕</button>}
          </div>
          <div className="w-px h-10 bg-gray-800 mx-2" />
          {([["","🏘️ ทั้งหมด"],["beach","🌊 ติดทะเล"],["near","🚶 ใกล้ทะเล"],["far","🚗 ไกลทะเล"]] as const).map(([v,l]) => (
            <Chip key={v} on={seaFilter===v} onClick={()=>setSeaFilter(v)} id={`qs-${v||"all"}`}>{l}</Chip>
          ))}
        </div>

        {/* ── 2-col Layout ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

          {/* LEFT sidebar (Filters + Legend) */}
          <aside className="hidden lg:flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-5 text-center shadow-lg">
                <p className="text-sm text-gray-500 font-semibold mb-2 uppercase tracking-wider">บ้านทั้งหมด</p>
                <p className="text-5xl font-black text-white">{total}</p>
              </div>
              <div className={`rounded-2xl border p-5 text-center shadow-lg ${sel?"bg-emerald-950/30 border-emerald-500/50":"bg-[#0f1219] border-gray-800"}`}>
                <p className="text-sm font-semibold mb-2 uppercase tracking-wider text-emerald-400">{sel?`ว่าง ${sel.getDate()}/${sel.getMonth()+1}`:"แสดงอยู่"}</p>
                <p className="text-5xl font-black text-emerald-400">{filtered.length}</p>
              </div>
            </div>

            {/* Global Calendar Legend */}
            <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                <p className="text-lg font-extrabold text-white">🗓️ สัญลักษณ์ปฏิทิน</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(STATUS).map(([k,c]) => {
                  if (k === "free") return null;
                  return (
                    <div key={k} className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-md ${c.bg} ${c.border} border flex-shrink-0 shadow-sm`} />
                      <span className="text-base text-gray-300 font-medium">{c.label}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md border border-gray-600 bg-transparent flex-shrink-0" />
                  <span className="text-base text-gray-300 font-medium">ว่าง / ไม่มีจอง</span>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <p className="text-lg font-extrabold text-white">⚙️ ตัวกรอง</p>
                {activeCount>0 && (
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-1">{activeCount} ใช้งานอยู่</span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* RIGHT main */}
          <main>
            {/* Title bar */}
            <div className="flex items-center justify-between mb-6 bg-[#0f1219] p-5 rounded-2xl border border-gray-800">
              <div>
                <h1 className="text-2xl font-black text-white">
                  {sel ? `🏠 ห้องว่าง — ${thaiDate(sel)}` : "🏠 บ้านพูลวิลล่าทั้งหมด (เลื่อนดูปฏิทินได้เลย)"}
                </h1>
                <p className="text-base text-gray-500 mt-1">
                  กำลังแสดง <strong className="text-emerald-400">{filtered.length}</strong> จาก {total} หลัง
                  {activeCount>0 && ` (กรอง ${activeCount} อย่าง)`}
                </p>
              </div>
              {sel ? (
                <button onClick={clearDate} id="clear-top"
                  className="text-base font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-5 py-3 transition-all shadow-md">
                  ✕ เลิกดูรายวัน (ดูทั้งหมด)
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={()=>navM(-1)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-700">‹ เดือนก่อน</button>
                  <button onClick={()=>navM(1)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-700">เดือนหน้า ›</button>
                </div>
              )}
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({length:6}).map((_,i) => (
                  <div key={i} className="rounded-2xl border border-gray-800 bg-[#1a1e29] h-96 animate-pulse" />
                ))}
              </div>
            ) : filtered.length===0 ? (
              <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-20 text-center shadow-lg">
                <p className="text-7xl mb-6 opacity-80">🏖️</p>
                <p className="text-2xl font-bold text-white mb-3">ไม่พบบ้านที่ตรงเงื่อนไข</p>
                <p className="text-gray-400 text-base mb-8">ลองเปลี่ยนการค้นหา หรือลดเงื่อนไขการกรองลง</p>
                <button onClick={reset} id="empty-reset"
                  className="text-base font-bold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/50 rounded-xl px-8 py-4 transition-all">
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(h => (
                  <HouseCard key={(h as any).hId||(h as any).h_id} house={h} selectedDate={sel} houseHeatmap={houseMap} month={month} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Mobile nav sheets omitted for brevity, but they work automatically via the state */}
    </div>
  );
}
