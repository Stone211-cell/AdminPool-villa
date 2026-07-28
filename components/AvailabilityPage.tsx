"use client";
import * as React from "react";
import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];

const STATUS = {
  booked:  { label: "ติดจอง",       bg: "bg-red-600",     border: "border-red-500",    text: "text-white",  dot: "bg-red-500" },
  waiting: { label: "รอชำระ",       bg: "bg-orange-500",  border: "border-orange-400", text: "text-white",  dot: "bg-orange-400" },
  repair:  { label: "ปิดปรับปรุง",  bg: "bg-gray-600",    border: "border-gray-500",   text: "text-white",  dot: "bg-gray-400" },
  holiday: { label: "เทศกาล",       bg: "bg-yellow-500",  border: "border-yellow-400", text: "text-black",  dot: "bg-yellow-400" },
  hotpro:  { label: "ลดราคา",       bg: "bg-cyan-500",    border: "border-cyan-400",   text: "text-black",  dot: "bg-cyan-400" },
  free:    { label: "ว่าง",         bg: "bg-transparent", border: "border-gray-700",   text: "text-gray-400", dot: "bg-emerald-500" },
} as const;
type DayStatus = keyof typeof STATUS;
type House = Record<string, any>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const yn = (h: any, k: string) => h[k] === true || h[k] === "y";
const thaiDate = (d: Date) => `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()+543}`;
const thaiDateTime = (iso: string | null) => {
  if (!iso) return "ยังไม่มีข้อมูล";
  return new Date(iso).toLocaleString("th-TH", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
};

// ─── Mini Calendar (per house) ────────────────────────────────────────────────
function MiniCalendar({ hMap, month, onDateClick }: { hMap: Record<string, DayStatus>; month: Date; onDateClick?: (date: string) => void }) {
  const [off, setOff] = React.useState(0);
  const base = new Date(month.getFullYear(), month.getMonth() + off, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days  = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-[#1a1e29] rounded-xl p-3 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <button onClick={(e) => { e.preventDefault(); setOff(o => Math.max(0, o - 1)); }} disabled={off === 0}
          className="w-8 h-8 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-30 text-lg font-bold flex items-center justify-center transition-colors">‹</button>
        <span className="text-sm md:text-base font-bold text-gray-200">{THAI_MONTHS_FULL[m]} {y + 543}</span>
        <button onClick={(e) => { e.preventDefault(); setOff(o => Math.min(2, o + 1)); }} disabled={off === 2}
          className="w-8 h-8 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-30 text-lg font-bold flex items-center justify-center transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-1.5">
        {THAI_DAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs md:text-[15px] font-bold py-1.5 ${i===0||i===6?"text-red-400":"text-gray-400"}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const key = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const st = STATUS[hMap[key] || "free"];
          const isWknd = i % 7 === 0 || i % 7 === 6;
          return (
            <button key={key} title={st.label} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDateClick?.(key); }}
              className={`aspect-square flex items-center justify-center text-sm md:text-lg font-bold rounded-md border shadow-sm cursor-pointer hover:scale-105 hover:opacity-80 transition-transform ${st.bg} ${st.border} ${st.text} ${st.border === "border-gray-700" && isWknd ? "text-red-400" : ""} ${hMap[key] === "hotpro" ? "animated-rainbow" : ""}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── House Card ───────────────────────────────────────────────────────────────
function HouseCard({ house, selectedDate, houseHeatmap, month, onSynced, onDateClick }: {
  house: House; selectedDate: Date|null;
  houseHeatmap: Record<string, Record<string, DayStatus>>;
  month: Date; onSynced?: () => void;
  onDateClick?: (hId: string, date: string) => void;
}) {
  const hId    = house.hId || house.h_id || "";
  const price  = parseInt(house.price || "0");
  const bed    = parseInt(house.hBedroom ?? "0");
  const bath   = parseInt(house.hToilet  ?? "0");
  const ppl    = parseInt(house.people   ?? "0");
  const img    = house.imgName || "";
  const swim   = house.swim || "chlorine";
  const dayStatus: DayStatus = (house.dayStatus as DayStatus) || "free";
  const st     = STATUS[dayStatus];
  const busy   = ["booked","waiting","repair"].includes(dayStatus);
  const hMap   = houseHeatmap[hId] || {};
  const amenities = [
    yn(house,"wifi")      && "📶 WiFi",
    yn(house,"pet")       && "🐾 Pet",
    yn(house,"karaoke")   && "🎤 คาราโอเกะ",
    yn(house,"jacuzzi")   && "🛁 จากุซซี่",
    yn(house,"grill")     && "🍖 ปิ้งย่าง",
    yn(house,"slider")    && "🛝 สไลเดอร์",
    yn(house,"snooker")   && "🎱 สนุกเกอร์",
  ].filter(Boolean) as string[];

  // Link to specific house detail
  const detailUrl = `https://poolvillacity.co.th/CITY-${hId}`;

  const [syncing, setSyncing] = React.useState(false);
  const [syncDone, setSyncDone] = React.useState(false);
  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setSyncing(true); setSyncDone(false);
    try {
      const { data } = await axios.post(`/api/houses/${hId}/sync`);
      setSyncDone(true);
      if (data.deleted) {
        alert(data.message);
      }
      if (onSynced) onSynced();
    } catch (e: any) {
      alert(e.response?.data?.error || "ไม่สามารถดึงข้อมูลได้");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`group flex flex-col rounded-2xl overflow-hidden bg-[#0f1219] border transition-all duration-300 shadow-md
      ${busy ? "border-gray-800 opacity-70" : "border-gray-800 hover:border-emerald-500/60 hover:shadow-emerald-900/20 hover:shadow-xl"}`}>

      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-900 flex-shrink-0">
        {img
          ? <img src={img} alt={`CITY-${hId}`} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl text-gray-800">🏠</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
            CITY-{hId}
          </span>
        </div>
        <span className={`absolute top-2.5 right-2.5 text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-sm
          ${swim === "salt" ? "bg-blue-600/90 border-blue-500 text-white" : "bg-cyan-600/90 border-cyan-500 text-white"}`}>
          {swim === "salt" ? "🧂 Salt" : "🏊 Chlorine"}
        </span>

        {/* Status badge on date */}
        {selectedDate && (
          <div className={`absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl border ${st.bg} ${st.border} flex items-center gap-2`}>
            <span className={`font-bold text-sm ${st.text}`}>{st.label}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { icon: "🛏", val: bed, label: "ห้องนอน" },
            { icon: "🚿", val: bath, label: "ห้องน้ำ" },
            { icon: "👥", val: ppl || "?", label: "คนสูงสุด" },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex flex-col items-center bg-[#1a1e29] rounded-xl py-3 border border-gray-700 shadow-sm">
              <span className="text-2xl">{icon}</span>
              <span className="font-bold text-white text-lg md:text-xl leading-none mt-2">{val}</span>
              <span className="text-gray-400 text-xs md:text-sm mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1 mb-1">
            {amenities.slice(0, 4).map(a => (
              <span key={a} className="text-xs md:text-sm font-medium text-gray-300 bg-gray-800/80 border border-gray-600 px-3 py-1 rounded-full shadow-sm">{a}</span>
            ))}
            {amenities.length > 4 && <span className="text-xs md:text-sm text-gray-400 font-medium px-3 py-1">+{amenities.length - 4}</span>}
          </div>
        )}

        {/* Mini Calendar (always show) */}
        <div className="mt-4">
          <MiniCalendar hMap={hMap} month={month} onDateClick={(d) => onDateClick?.(hId, d)} />
        </div>

        {/* Price + Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl md:text-3xl font-black text-emerald-400">฿{price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm ml-1">/คืน</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={handleSync} disabled={syncing}
              className={`h-12 flex items-center justify-center gap-1 text-sm md:text-base font-bold rounded-xl border transition-all
                ${syncDone ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : syncing ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse cursor-wait"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/25 hover:text-white cursor-pointer"}`}>
              {syncDone ? "✅ อัพเดทแล้ว" : syncing ? "⏳ กำลังอัพ..." : "🔄 อัพเดทก่อนดู"}
            </button>
            <a href={detailUrl} target="_blank" rel="noopener noreferrer"
              className="h-10 flex items-center justify-center text-sm md:text-base font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 hover:text-white rounded-xl transition-all">
              ดูรายละเอียด →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Big Calendar ─────────────────────────────────────────────────────────────
function BigCalendar({ month, heatmap, totalHouses, onSelectDate, selectedDate }: {
  month: Date; heatmap: Record<string, any>; totalHouses: number;
  onSelectDate: (d: Date | null) => void; selectedDate: Date | null;
}) {
  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days  = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-4 shadow-xl">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-500"></span>ว่างมาก</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500 border border-yellow-400"></span>ว่างปานกลาง</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-700 border border-red-600"></span>เต็มมาก</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {THAI_DAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-bold py-1.5 ${i===0||i===6 ? "text-red-400" : "text-gray-500"}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="aspect-square" />;
          const key = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const info = heatmap[key];
          const avail = info?.available ?? totalHouses;
          const ratio = totalHouses > 0 ? avail / totalHouses : 1;
          const isWknd = i % 7 === 0 || i % 7 === 6;
          const dayDate = new Date(y, m, day);
          const isPast = dayDate < today;
          const isSel  = selectedDate?.toDateString() === dayDate.toDateString();
          const isToday = today.toDateString() === dayDate.toDateString();

          let bg = "bg-transparent border-gray-800";
          let txt = isWknd ? "text-red-300" : "text-gray-300";
          if (!isPast && info) {
            if (ratio >= 0.7) { bg = "bg-emerald-900/60 border-emerald-700"; txt = "text-emerald-200"; }
            else if (ratio >= 0.4) { bg = "bg-yellow-900/60 border-yellow-700"; txt = "text-yellow-200"; }
            else { bg = "bg-red-900/60 border-red-800"; txt = "text-red-200"; }
          }
          if (isPast) { bg = "bg-transparent border-gray-800/30"; txt = "text-gray-700"; }
          if (isSel) { bg = "bg-emerald-600 border-emerald-500"; txt = "text-white"; }
          if (isToday && !isSel) { bg += " ring-1 ring-emerald-400"; txt = "text-emerald-300 font-black"; }

          return (
            <button key={key} disabled={isPast}
              onClick={() => { isSel ? onSelectDate(null) : onSelectDate(dayDate); }}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all text-xs font-semibold ${bg} ${txt} ${!isPast ? "hover:scale-105 hover:z-10 cursor-pointer" : "cursor-default"}`}
              title={info ? `${thaiDate(dayDate)} — ว่าง ${avail} / ${totalHouses} หลัง` : thaiDate(dayDate)}>
              <span>{day}</span>
              {info && !isPast && (
                <span className={`text-[8px] font-bold mt-0.5 ${isSel ? "text-white/80" : ratio >= 0.7 ? "text-emerald-400" : ratio >= 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                  {avail}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sync Button ──────────────────────────────────────────────────────────────
function GlobalSyncButton({ lastSyncAt, onSync }: { lastSyncAt: string|null; onSync: () => void }) {
  const [syncing, setSyncing] = React.useState(false);
  const [msg, setMsg] = React.useState<{type:"ok"|"err", text: string}|null>(null);
  const handle = async () => {
    setSyncing(true); setMsg(null);
    try {
      const r = await axios.post("/api/auto-sync?secret=pool-villa-sync-2024-secret", {}, { timeout: 120000 });
      setMsg({ type: "ok", text: `✅ ${r.data.message}` });
      onSync();
    } catch (e: any) {
      setMsg({ type: "err", text: `❌ ${e?.response?.data?.error || "error"}` });
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div className="flex flex-col items-end gap-0.5">
      <button onClick={handle} disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all
          ${syncing ? "bg-amber-500/20 border-amber-500/40 text-amber-400 cursor-wait animate-pulse"
          : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-emerald-500 hover:text-white active:scale-95 cursor-pointer"}`}>
        <span className={syncing ? "animate-spin" : ""}>{syncing ? "⟳" : "🔄"}</span>
        {syncing ? "กำลัง sync..." : "Sync ข้อมูล"}
      </button>
      <span className="text-[11px] text-gray-500">
        {msg
          ? <span className={msg.type === "ok" ? "text-emerald-400" : "text-red-400"}>{msg.text}</span>
          : lastSyncAt ? `อัพเดท: ${thaiDateTime(lastSyncAt)}` : "ไม่มีข้อมูล"
        }
      </span>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all
        ${active ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30"
        : "bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"}`}>
      {children}
    </button>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap
        ${on ? "bg-emerald-600/90 border-emerald-500 text-white" : "bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AvailabilityPage() {
  const today = React.useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [month, setMonth]     = React.useState(new Date());
  const [sel, setSel]         = React.useState<Date|null>(null);
  const [tab, setTab]         = React.useState<"houses"|"calendar">("houses");
  const [houses, setHouses]   = React.useState<House[]>([]);
  const [heatmap, setHeatmap] = React.useState<Record<string, any>>({});
  const [houseMap, setHouseMap] = React.useState<Record<string, Record<string, DayStatus>>>({});
  const [holidays, setHolidays] = React.useState<any[]>([]);
  const [totalHouses, setTotalHouses] = React.useState(0);
  const [total, setTotal]     = React.useState(0);
  const [page, setPage]       = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastSyncAt, setLastSyncAt]   = React.useState<string|null>(null);
  const [search, setSearch]   = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [bed, setBed]         = React.useState<number|null>(null);
  const [maxPrice, setMaxPrice] = React.useState<number|null>(null);
  const [swim, setSwim]       = React.useState<""|"salt"|"chlorine">("");
  const [mobileMenu, setMobileMenu] = React.useState(false);
  
  // Popup state
  const [popupData, setPopupData] = React.useState<any>(null);
  const LIMIT = 12;

  // ── Fetch houses ─────────────────────────────────────────────────────────
  const fetchHouses = React.useCallback(async (pg: number, replace = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (bed) params.set("bed", String(bed));
      if (maxPrice) params.set("maxPrice", String(maxPrice));
      if (swim) params.set("swim", swim);
      if (sel) {
        const key = `${sel.getFullYear()}-${String(sel.getMonth()+1).padStart(2,"0")}-${String(sel.getDate()).padStart(2,"0")}`;
        params.set("date", key);
      }
      const { data } = await axios.get(`/api/availability?${params}`);
      const newHouses: House[] = data.houses || [];
      setHouses(prev => replace || pg === 1 ? newHouses : [...prev, ...newHouses]);
      setTotal(data.total || 0);
      setTotalHouses(data.totalHouses || data.total || 0);
      setHasMore(data.hasMore ?? false);
      if (data.lastSyncAt) setLastSyncAt(data.lastSyncAt);
    } catch { /* ignore */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [search, bed, maxPrice, swim, sel]);

  // ── Fetch heatmap ──────────────────────────────────────────────────────────
  const fetchHeatmap = React.useCallback(async () => {
    const y = month.getFullYear(), m2 = month.getMonth() + 1;
    try {
      const { data } = await axios.get(`/api/availability?year=${y}&month=${m2}`);
      if (data.heatmap) setHeatmap(data.heatmap);
      if (data.houseHeatmap) setHouseMap(data.houseHeatmap);
      if (data.holidays) setHolidays(data.holidays);
      if (data.totalHouses) setTotalHouses(data.totalHouses);
      if (data.lastSyncAt) setLastSyncAt(data.lastSyncAt);
    } catch { /* ignore */ }
  }, [month]);

  // Initial
  React.useEffect(() => { setPage(1); fetchHouses(1, true); }, [search, bed, maxPrice, swim, sel]);
  React.useEffect(() => { fetchHeatmap(); }, [month]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHouses(next);
  };

  const navM = (d: number) => setMonth(m => { const n = new Date(m); n.setMonth(n.getMonth() + d); return n; });

  const handleSelectDate = (d: Date | null) => {
    setSel(d);
    setTab("houses");
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDateClick = (hId: string, dateStr: string) => {
    const house = houses.find(h => h.hId === hId);
    if (!house) return;

    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayOfWeek = dayStart.getUTCDay();

    const detail = (house as any).detail;
    const basePrice = (house as any).basePrices?.[0];
    const status = houseMap[hId]?.[dateStr] || "free";

    let currentPrice = house.price;
    let oldPrice = null;
    let people = house.people;

    if (basePrice) {
      const prices = [basePrice.priceSun, basePrice.priceMon, basePrice.priceTue, basePrice.priceWed, basePrice.priceThu, basePrice.priceFri, basePrice.priceSat];
      if (prices[dayOfWeek] > 0) currentPrice = prices[dayOfWeek];
    }

    if (status === "hotpro" || status === "holiday") {
      const hday = holidays.find(h => h.houseId === hId && dateStr >= h.start.slice(0, 10) && dateStr <= h.end.slice(0, 10));
      if (hday) {
        if (status === "hotpro") oldPrice = currentPrice;
        currentPrice = hday.price;
        people = hday.people || people;
      }
    }

    setPopupData({
      hId, date: dateStr, status, price: currentPrice, oldPrice, people,
      extraAdult: detail?.extra || 0,
      extraChild: detail?.extraChild || 0,
      extraPet: detail?.extraPet || 0,
      petFriendly: house.pet,
      loading: false
    });
  };

  const clearFilters = () => {
    setSearch(""); setSearchInput(""); setBed(null); setMaxPrice(null); setSwim(""); setSel(null); setPage(1);
  };

  const activeFilters = [search, bed, maxPrice, swim, sel].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100" style={{ fontFamily: "'Noto Sans Thai', 'Inter', sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#080a0f]/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl shadow-lg flex-shrink-0">🏊</div>
            <div className="min-w-0">
              <p className="font-extrabold text-base text-white leading-none truncate">Pool Villa City</p>
              <p className="text-xs text-emerald-400 font-medium">Admin Dashboard</p>
            </div>
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="ค้นหาเลขห้อง เช่น 293"
                className="w-full bg-[#1a1e29] border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              {searchInput && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">✕</button>}
            </div>
          </form>

          <div className="flex items-center gap-3">
            <GlobalSyncButton lastSyncAt={lastSyncAt} onSync={() => { setPage(1); fetchHouses(1, true); fetchHeatmap(); }} />
          </div>
        </div>
      </header>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 pb-24 lg:pb-8">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-4 text-center">
            <p className="text-3xl font-black text-white">{totalHouses}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">บ้านทั้งหมด</p>
          </div>
          <div className={`rounded-2xl border p-4 text-center ${sel ? "bg-emerald-950/30 border-emerald-600/50" : "bg-[#0f1219] border-gray-800"}`}>
            <p className={`text-3xl font-black ${sel ? "text-emerald-400" : "text-white"}`}>{total}</p>
            <p className={`text-xs mt-1 font-semibold ${sel ? "text-emerald-400/70" : "text-gray-500"}`}>
              {sel ? `ว่าง ${thaiDate(sel)}` : "แสดงอยู่"}
            </p>
          </div>
          <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-4 text-center">
            <p className="text-lg font-black text-white">
              {month.getMonth() + 1}/{month.getFullYear()}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">เดือนปฏิทิน</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <Tab active={tab === "houses"} onClick={() => setTab("houses")}>🏠 รายการบ้าน</Tab>
          <Tab active={tab === "calendar"} onClick={() => setTab("calendar")}>🗓️ ปฏิทินภาพรวม</Tab>
          {sel && (
            <button onClick={() => setSel(null)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-orange-300 border border-orange-800 bg-orange-950/30 hover:bg-orange-900/40 transition-all whitespace-nowrap">
              📅 {thaiDate(sel)} ✕
            </button>
          )}
        </div>

        {/* ── CALENDAR TAB ─────────────────────────────────────── */}
        {tab === "calendar" && (
          <div className="flex flex-col gap-6">
            {/* Month nav */}
            <div className="flex items-center justify-between bg-[#0f1219] rounded-2xl border border-gray-800 p-4">
              <button onClick={() => navM(-1)} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-700 text-sm">‹ เดือนก่อน</button>
              <h2 className="text-lg font-black text-white">{THAI_MONTHS_FULL[month.getMonth()]} {month.getFullYear() + 543}</h2>
              <button onClick={() => navM(1)}  className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-700 text-sm">เดือนหน้า ›</button>
            </div>

            <BigCalendar month={month} heatmap={heatmap} totalHouses={totalHouses}
              onSelectDate={handleSelectDate} selectedDate={sel} />

            {/* Legend + tip */}
            <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-4">
              <p className="text-sm text-gray-400 mb-3 font-semibold">💡 วิธีใช้: กดวันไหนในปฏิทินเพื่อดูบ้านที่ว่างวันนั้น ตัวเลขในแต่ละวันคือจำนวนบ้านที่ว่าง</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {Object.entries(STATUS).filter(([k]) => k !== "free").map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded border ${v.bg} ${v.border}`} />
                    <span className="text-gray-300">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HOUSES TAB ───────────────────────────────────────── */}
        {tab === "houses" && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar filters (desktop) */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-[#0f1219] rounded-2xl border border-gray-800 p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-white text-base">⚙️ ตัวกรอง</p>
                  {activeFilters > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 font-bold">ล้างทั้งหมด ({activeFilters})</button>
                  )}
                </div>

                {/* Search */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">🔍 รหัสบ้าน</label>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                      placeholder="เช่น 293 หรือ CITY-293"
                      className="flex-1 bg-[#1a1e29] border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500 min-w-0" />
                    <button type="submit" className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-500">🔍</button>
                  </form>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">🛏 ห้องนอน</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[1,2,3,4,5,6].map(n => (
                      <Chip key={n} on={bed === n} onClick={() => setBed(b => b === n ? null : n)}>{n} ห้อง</Chip>
                    ))}
                    <Chip on={bed === 7} onClick={() => setBed(b => b === 7 ? null : 7)}>7+</Chip>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">💰 ราคาสูงสุด</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[2000,4000,6000,8000,12000].map(n => (
                      <Chip key={n} on={maxPrice === n} onClick={() => setMaxPrice(p => p === n ? null : n)}>≤{(n/1000).toFixed(0)}K</Chip>
                    ))}
                  </div>
                </div>

                {/* Pool type */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">🏊 ประเภทสระ</label>
                  <div className="flex gap-2">
                    {([["","ทั้งหมด"],["chlorine","🧪 คลอรีน"],["salt","🧂 น้ำเกลือ"]] as const).map(([v, l]) => (
                      <Chip key={v} on={swim === v} onClick={() => setSwim(s => s === v ? "" : v)}>{l}</Chip>
                    ))}
                  </div>
                </div>

                {/* Date selected */}
                {sel && (
                  <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl p-3">
                    <p className="text-xs text-emerald-400 font-bold mb-1">📅 กรองตามวันที่</p>
                    <p className="text-sm text-emerald-300 font-bold">{thaiDate(sel)}</p>
                    <button onClick={() => setSel(null)} className="text-xs text-red-400 mt-1 hover:text-red-300">ยกเลิก</button>
                  </div>
                )}
              </div>
            </aside>

            {/* Main grid */}
            <div className="flex-1 min-w-0">
              {/* Result header */}
              <div className="flex items-center justify-between mb-4 bg-[#0f1219] rounded-2xl border border-gray-800 px-5 py-4">
                <div>
                  <h1 className="text-lg font-black text-white">
                    {sel ? `🏠 บ้านว่าง — ${thaiDate(sel)}` : search ? `🔍 ค้นหา "${search}"` : "🏠 บ้านพักล่าสุด"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    แสดง <strong className="text-emerald-400">{houses.length}</strong> / <strong className="text-gray-300">{total}</strong> หลัง
                    {activeFilters > 0 && <span className="text-yellow-400"> (กรอง {activeFilters} อย่าง)</span>}
                  </p>
                </div>
                {(activeFilters > 0) && (
                  <button onClick={clearFilters} className="text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 px-3 py-1.5 rounded-xl hover:bg-red-900/50 transition-all">
                    ✕ ล้าง
                  </button>
                )}
              </div>

              {/* Cards */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
                  {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className="h-[420px] rounded-2xl bg-[#1a1e29] animate-pulse border border-gray-800" />
                  ))}
                </div>
              ) : houses.length === 0 ? (
                <div className="bg-[#0f1219] rounded-2xl border border-gray-800 p-16 text-center">
                  <p className="text-6xl mb-4">🏖️</p>
                  <p className="text-xl font-bold text-white mb-2">ไม่พบบ้านที่ตรงเงื่อนไข</p>
                  <p className="text-gray-500 mb-6">ลองเปลี่ยนการค้นหาหรือลดเงื่อนไข</p>
                  <button onClick={clearFilters} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all">
                    ล้างตัวกรอง
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
                    {houses.map(h => (
                      <HouseCard key={h.hId} house={h} selectedDate={sel}
                        houseHeatmap={houseMap} month={month}
                        onDateClick={handleDateClick}
                        onSynced={() => { setPage(1); fetchHouses(1, true); fetchHeatmap(); }} />
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="mt-6 flex justify-center">
                      <button onClick={loadMore} disabled={loadingMore}
                        className="px-8 py-3 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 hover:border-emerald-500 font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2">
                        {loadingMore ? <><span className="animate-spin">⟳</span> กำลังโหลด...</> : "⬇️ โหลดเพิ่มอีก 12 หลัง"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0f1219]/95 backdrop-blur-md border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-4">
          <button onClick={() => setTab("houses")}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${tab==="houses" ? "text-emerald-400" : "text-gray-500"}`}>
            <span className="text-2xl">🏠</span>
            <span className="text-[10px] font-bold">รายการบ้าน</span>
          </button>
          <button onClick={() => setTab("calendar")}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${tab==="calendar" ? "text-emerald-400" : "text-gray-500"}`}>
            <span className="text-2xl">🗓️</span>
            <span className="text-[10px] font-bold">ปฏิทิน</span>
          </button>
          <button onClick={() => setMobileMenu(v => !v)}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${mobileMenu ? "text-emerald-400" : "text-gray-500"}`}>
            <span className="text-2xl">☰</span>
            <span className="text-[10px] font-bold">เมนู & กรอง</span>
          </button>
        </div>
      </nav>

      {/* Mobile filter sheet */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
          <div className="relative bg-[#0f1219] rounded-t-3xl border-t border-gray-800 p-5 max-h-[80vh] overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-extrabold text-white text-lg">⚙️ ตัวกรอง</p>
              <button onClick={() => setMobileMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Mobile search */}
            <form onSubmit={(e) => { handleSearch(e); setMobileMenu(false); }} className="flex gap-2">
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="ค้นหาเลขห้อง เช่น 293"
                className="flex-1 bg-[#1a1e29] border border-gray-700 rounded-xl px-4 py-3 text-base text-gray-100 placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
              <button type="submit" className="px-4 bg-emerald-600 text-white font-bold rounded-xl">🔍</button>
            </form>

            <div className="w-full h-px bg-gray-800 my-1"></div>

            <div className="w-full">
              <GlobalSyncButton lastSyncAt={lastSyncAt} onSync={() => { setPage(1); fetchHouses(1, true); fetchHeatmap(); setMobileMenu(false); }} />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">🛏 ห้องนอน</label>
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,6,7].map(n => (
                  <Chip key={n} on={bed === n} onClick={() => setBed(b => b === n ? null : n)}>{n}{n===7?"+":" "} ห้อง</Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">💰 ราคาสูงสุด</label>
              <div className="flex flex-wrap gap-2">
                {[2000,4000,6000,8000,12000].map(n => (
                  <Chip key={n} on={maxPrice === n} onClick={() => setMaxPrice(p => p === n ? null : n)}>≤{(n/1000).toFixed(0)}K</Chip>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 mb-2 block">🏊 ประเภทสระ</label>
              <div className="flex gap-2">
                {([["","ทั้งหมด"],["chlorine","🧪 คลอรีน"],["salt","🧂 น้ำเกลือ"]] as const).map(([v, l]) => (
                  <Chip key={v} on={swim === v} onClick={() => setSwim(s => s === v ? "" : v)}>{l}</Chip>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { clearFilters(); setMobileMenu(false); }} className="w-full py-3 font-bold text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl hover:bg-red-900/50">
                ✕ ล้างตัวกรองทั้งหมด
              </button>
            )}
            <button onClick={() => setMobileMenu(false)} className="w-full py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500">
              ✅ ดูผลลัพธ์ ({total} หลัง)
            </button>
          </div>
        </div>
      )}

      {/* Date Popup Modal */}
      {popupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-[320px] text-center flex flex-col items-center gap-2 relative border border-gray-200">
            <h2 className="text-xl font-black text-gray-800 font-sans tracking-wide">CITY-{popupData.hId}</h2>
            <p className="text-gray-600 text-sm font-medium mb-1">
              {(() => {
                const [y, m, d] = popupData.date.split("-");
                return `${parseInt(d)}/${parseInt(m)}/${parseInt(y)+543}`;
              })()}
            </p>
            
            {popupData.loading ? (
              <div className="py-8"><span className="animate-spin text-3xl block text-gray-400">⟳</span></div>
            ) : (
              <div className="flex flex-col gap-2 w-full mt-2">
                {popupData.status === "hotpro" && popupData.oldPrice ? (
                  <>
                    <p className="text-red-600 font-bold text-base line-through">ลดราคาจาก {popupData.oldPrice.toLocaleString()} / {popupData.people} ท่าน</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-[#f26522] font-extrabold text-[1.1rem]">
                        ลดราคาเหลือ {popupData.price?.toLocaleString()} บาท / {popupData.people} ท่าน
                      </p>
                      <button className="text-gray-400 hover:text-[#f26522] transition-colors" title="คัดลอกราคา" onClick={() => navigator.clipboard.writeText(popupData.price?.toString()||"")}>📋</button>
                    </div>
                  </>
                ) : popupData.status === "holiday" || popupData.status === "free" ? (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-[#f26522] font-extrabold text-[1.1rem]">
                      {popupData.price?.toLocaleString()} บาท / {popupData.people} ท่าน
                    </p>
                    <button className="text-gray-400 hover:text-[#f26522] transition-colors" title="คัดลอกราคา" onClick={() => navigator.clipboard.writeText(popupData.price?.toString()||"")}>📋</button>
                  </div>
                ) : (
                  <p className={`font-extrabold text-lg mb-3 tracking-wide
                    ${popupData.status === "booked" ? "text-red-600" : popupData.status === "repair" ? "text-gray-500" : "text-[#f26522]"}`}>
                    {popupData.status === "booked" ? "ติดจอง" : popupData.status === "repair" ? "ปิดปรับปรุง" : "รอชำระ"}
                  </p>
                )}

                {(popupData.status === "hotpro" || popupData.status === "holiday" || popupData.status === "free") && (
                  <div className="text-[11px] text-gray-500 font-medium flex flex-col gap-0.5 mt-1 border-t border-gray-100 pt-3">
                    <p>เสริมผู้ใหญ่ท่านละ {popupData.extraAdult} บาท/คืน</p>
                    <p>เสริมเด็กท่านละ {popupData.extraChild} บาท/คืน</p>
                    {popupData.petFriendly && <p>เสริมสัตว์เลี้ยงตัวละ {popupData.extraPet} บาท/คืน</p>}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={() => setPopupData(null)} 
              className="mt-4 w-full py-2.5 bg-[#f00] hover:bg-[#d00] text-white font-bold rounded-lg transition-colors">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

