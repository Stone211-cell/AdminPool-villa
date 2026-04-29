"use client";
import * as React from "react";

export type Filters = {
  minBed: number; maxBed: number; minPrice: number; maxPrice: number; minPeople: number;
  swim: "" | "salt" | "chlorine";
  pet: boolean; karaoke: boolean; jacuzzi: boolean; wifi: boolean;
  grill: boolean; snooker: boolean; discotech: boolean; slider: boolean; billard: boolean;
  sort: "price_asc" | "price_desc" | "bed_asc" | "bed_desc";
};

export const defaultFilters: Filters = {
  minBed: 0, maxBed: 0, minPrice: 0, maxPrice: 0, minPeople: 0, swim: "",
  pet: false, karaoke: false, jacuzzi: false, wifi: false,
  grill: false, snooker: false, discotech: false, slider: false, billard: false,
  sort: "price_asc",
};

export function FilterPanel({ search, setSearch, filters, setFilters, activeCount, onReset }: {
  search: string; setSearch: (v: string) => void;
  filters: Filters; setFilters: (f: Filters) => void;
  activeCount: number; onReset: () => void;
}) {
  const set = (k: keyof Filters, v: unknown) => setFilters({ ...filters, [k]: v });
  const tog = (k: keyof Filters) => setFilters({ ...filters, [k]: !filters[k] });
  const btn = (active: boolean) =>
    `text-xs py-1.5 px-2 rounded-lg border transition-all ${active ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-white/5 border-white/10 text-[#a1a1aa] hover:border-white/20"}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b78] text-sm">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหา DV-XXXX, โซน..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-[#6b6b78] focus:outline-none focus:border-emerald-500/50 transition-colors" />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">เรียงลำดับ</p>
        <div className="grid grid-cols-2 gap-1">
          {([["price_asc", "💰 ราคา ↑"], ["price_desc", "💰 ราคา ↓"], ["bed_asc", "🛏 ห้อง ↑"], ["bed_desc", "🛏 ห้อง ↓"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => set("sort", v)} className={btn(filters.sort === v)}>{l}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">ห้องนอน (ขั้นต่ำ)</p>
        <div className="grid grid-cols-4 gap-1">
          {[0, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <button key={n} onClick={() => set("minBed", filters.minBed === n ? 0 : n)}
              className={btn(filters.minBed === n && n > 0)}>{n === 0 ? "ทั้งหมด" : `${n}+`}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">รับได้ (คนขั้นต่ำ)</p>
        <div className="grid grid-cols-4 gap-1">
          {[0, 4, 6, 8, 10, 12, 15, 20].map(n => (
            <button key={n} onClick={() => set("minPeople", filters.minPeople === n ? 0 : n)}
              className={btn(filters.minPeople === n && n > 0)}>{n === 0 ? "ทั้งหมด" : `${n}+`}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">ราคา/คืน (สูงสุด)</p>
        <div className="grid grid-cols-3 gap-1">
          {[0, 2000, 4000, 6000, 8000, 12000, 20000].map(n => (
            <button key={n} onClick={() => set("maxPrice", filters.maxPrice === n ? 0 : n)}
              className={btn(filters.maxPrice === n && n > 0)}>{n === 0 ? "ทั้งหมด" : `≤${(n / 1000).toFixed(0)}K`}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">ประเภทสระ</p>
        <div className="grid grid-cols-3 gap-1">
          {([["", "🏊 ทั้งหมด"], ["chlorine", "🧪 Chlorine"], ["salt", "🧂 Salt"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => set("swim", v)} className={btn(filters.swim === v && v !== "" || filters.swim === "" && v === "")}>{l}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#6b6b78] uppercase tracking-wider mb-1.5">สิ่งอำนวยความสะดวก</p>
        <div className="grid grid-cols-3 gap-1">
          {([["wifi", "📶 WiFi"], ["pet", "🐾 Pet"], ["grill", "🍖 ปิ้งย่าง"], ["karaoke", "🎤 คาราโอเกะ"], ["jacuzzi", "🛁 จากุซซี่"], ["snooker", "🎱 สนุกเกอร์"], ["discotech", "🕺 ดิสโก้"], ["slider", "🛝 สไลเดอร์"], ["billard", "🎯 บิลเลียด"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => tog(k)} className={btn(!!filters[k])}>{l}</button>
          ))}
        </div>
      </div>

      {(search || activeCount > 0) && (
        <button onClick={onReset}
          className="w-full py-2 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all">
          ✕ ล้างตัวกรองทั้งหมด {activeCount > 0 && `(${activeCount})`}
        </button>
      )}
    </div>
  );
}
