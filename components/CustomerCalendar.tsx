"use client";

import * as React from "react";
import axios from "axios";

const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const THAI_MONTHS_FULL = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const THAI_DAYS = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];

const STATUS = {
  booked:  { label: "ติดจอง", bg: "bg-red-100", border: "border-red-200", text: "text-red-500", labelColor: "bg-red-500" },
  waiting: { label: "รอชำระ", bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-500", labelColor: "bg-orange-500" },
  repair:  { label: "ปิดซ่อม", bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-500", labelColor: "bg-gray-500" },
  holiday: { label: "วันหยุด", bg: "bg-pink-50", border: "border-pink-200", text: "text-[#ff758f]", labelColor: "bg-[#ff758f]" },
  hotpro:  { label: "โปรโมชั่น", bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-500", labelColor: "bg-fuchsia-500" },
  free:    { label: "ว่าง", bg: "bg-white", border: "border-gray-100", text: "text-gray-700", labelColor: "bg-emerald-500" },
} as const;

type DayStatus = keyof typeof STATUS;

export function CustomerCalendar({ hId }: { hId: string }) {
  const [month, setMonth] = React.useState(new Date());
  const [heatmap, setHeatmap] = React.useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = React.useState(false);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const y = month.getFullYear();
      const m = month.getMonth();
      const d = new Date(y, m, 1);
      
      const { data } = await axios.get(`/api/houses/${hId}/date-info`, {
        params: { y: d.getFullYear(), m: d.getMonth() + 1 }
      });
      setHeatmap(data.heatmap || {});
    } catch (e) {
      console.error("Failed to fetch calendar", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHeatmap();
  }, [month, hId]);

  const navMonth = (dir: number) => {
    setMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + dir);
      return next;
    });
  };

  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">เช็ควันว่าง</h3>
        
        <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1">
          <button onClick={() => navMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500 font-bold">&lsaquo;</button>
          <span className="font-bold text-gray-800 text-sm">{THAI_MONTHS_FULL[m]} {y + 543}</span>
          <button onClick={() => navMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-500 font-bold">&rsaquo;</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold text-gray-500 justify-center">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>ว่าง</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>ติดจอง</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>รอชำระ</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff758f]"></span>ราคาพิเศษ</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {THAI_DAYS.map((d, i) => (
          <div key={d} className={`text-center text-sm font-bold pb-2 ${i===0||i===6 ? "text-[#ff758f]" : "text-gray-400"}`}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
          
          const key = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          let statusStr: DayStatus = heatmap[key] || "free";
          
          const cellDate = new Date(y, m, day);
          if (cellDate < today) statusStr = "free"; // past days are visually "free" or grayed out? Actually let's just show them as they are but disabled.

          const st = STATUS[statusStr];
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          
          const isPast = cellDate < today;

          return (
            <div key={key} className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all ${st.bg} ${st.border} ${isPast ? "opacity-40" : "hover:-translate-y-0.5 hover:shadow-md"}`}>
               <span className={`text-lg font-black ${st.text} ${isWeekend && statusStr === "free" ? "text-[#ff758f]" : ""}`}>{day}</span>
               {statusStr !== "free" && !isPast && (
                 <span className={`text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-md text-white ${st.labelColor}`}>{st.label}</span>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
