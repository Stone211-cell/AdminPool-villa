// app/api/cron/sync/route.ts
// Vercel Cron Job — sync ข้อมูลบ้านและการจองจาก poolvilla-pwth.com ทุก 10 นาที
// 
// ตั้งค่าใน vercel.json:
//   { "crons": [{ "path": "/api/cron/sync", "schedule": "*/10 * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 นาที timeout สำหรับ Vercel Pro

// ── Types ─────────────────────────────────────────────────────────────────────
interface HouseRaw {
  _id: string; h_id: string; h_zone: string;
  h_bedroom: string; h_toilet: string; h_farsea: string;
  wifi: string; grill: string; pet: string; snooker: string;
  discotech: string; slider: string; billard: string;
  swimming_kid: string; swim: string; karaoke: string;
  airhockey: string; jacuzzi: string; bath: string;
  img_name: string; price: string; people: string;
}
interface BookingRaw { book_checkin: string; book_checkout: string; book_type: string; }
interface HolidayRaw { holiday_start: string; holiday_end: string; holiday_type: string; holiday_price: number; holiday_people: string; holiday_alert: string; }
interface BasePriceRaw { price_sun: number; price_mon: number; price_tue: number; price_wed: number; price_thu: number; price_fri: number; price_sat: number; }

const RSC_HEADERS = { RSC: "1", Accept: "text/x-component", "User-Agent": "Mozilla/5.0" };
const isValidDate = (d: Date) => !isNaN(d.getTime());

// ── Fetch รายการบ้านทั้งหมด ──────────────────────────────────────────────────
async function fetchAllHouses(): Promise<HouseRaw[]> {
  const { data: text } = await axios.get<string>("https://www.poolvilla-pwth.com/houses", {
    headers: RSC_HEADERS, responseType: "text", timeout: 30000,
  });
  const all: HouseRaw[] = [];
  let pos = 0;
  while (true) {
    const idx = text.indexOf('"data":[{"_id"', pos);
    if (idx === -1) break;
    const arrStart = idx + '"data":'.length;
    let depth = 0, arrEnd = arrStart;
    for (let i = arrStart; i < text.length; i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]") { depth--; if (depth === 0) { arrEnd = i; break; } }
    }
    try { all.push(...JSON.parse(text.slice(arrStart, arrEnd + 1))); } catch { /**/ }
    pos = arrEnd + 1;
  }
  return Array.from(new Map(all.filter(h => h.h_id).map(h => [h.h_id, h])).values());
}

// ── Fetch detail + bookings ของแต่ละบ้าน ─────────────────────────────────────
async function fetchDetail(hId: string) {
  const { data: text } = await axios.get<string>(
    `https://www.poolvilla-pwth.com/houses/${hId}`,
    { headers: RSC_HEADERS, responseType: "text", timeout: 20000 }
  );
  for (const line of text.split("\n")) {
    if (!line.includes('"bk"') || !line.includes('"acc"')) continue;
    const start = line.indexOf("{");
    if (start === -1) continue;
    try {
      let depth = 0, end = start;
      for (let i = start; i < line.length; i++) {
        if (line[i] === "{") depth++;
        else if (line[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
      }
      const obj = JSON.parse(line.slice(start, end + 1));
      if (obj.acc && obj.bk) return obj as {
        acc: any;
        bk: { bookings: BookingRaw[]; holidays: HolidayRaw[]; hot_holidays: HolidayRaw[]; base_price: BasePriceRaw };
      };
    } catch { /**/ }
  }
  return null;
}

// ── Sync บ้าน 1 หลัง ─────────────────────────────────────────────────────────
async function syncHouse(h: HouseRaw): Promise<{ bookings: number; holidays: number }> {
  const y = (v: string) => v === "y";

  // Upsert house info
  await prisma.house.upsert({
    where: { hId: h.h_id },
    create: {
      hId: h.h_id, hZone: h.h_zone || "pattaya",
      hBedroom: parseInt(h.h_bedroom) || 0, hToilet: parseInt(h.h_toilet) || 0,
      hFarsea: h.h_farsea || "", price: parseInt(h.price) || 0,
      people: parseInt(h.people) || 0, imgName: h.img_name || "",
      swim: h.swim || "chlorine",
      wifi: y(h.wifi), grill: y(h.grill), pet: y(h.pet),
      karaoke: y(h.karaoke), jacuzzi: y(h.jacuzzi), snooker: y(h.snooker),
      discotech: y(h.discotech), slider: y(h.slider), billard: y(h.billard),
      swimmingKid: y(h.swimming_kid), bath: y(h.bath),
    },
    update: {
      hZone: h.h_zone || "pattaya",
      hBedroom: parseInt(h.h_bedroom) || 0, hToilet: parseInt(h.h_toilet) || 0,
      hFarsea: h.h_farsea || "", price: parseInt(h.price) || 0,
      people: parseInt(h.people) || 0, imgName: h.img_name || "",
      swim: h.swim || "chlorine",
      wifi: y(h.wifi), grill: y(h.grill), pet: y(h.pet),
      karaoke: y(h.karaoke), jacuzzi: y(h.jacuzzi), snooker: y(h.snooker),
      discotech: y(h.discotech), slider: y(h.slider), billard: y(h.billard),
      swimmingKid: y(h.swimming_kid), bath: y(h.bath),
    },
  });

  // Fetch detail
  await new Promise(r => setTimeout(r, 200)); // rate limit
  const detail = await fetchDetail(h.h_id);
  if (!detail?.acc || !detail?.bk) return { bookings: 0, holidays: 0 };

  const { acc, bk } = detail;

  // Upsert HouseDetail
  const detailData = {
    checkin: (acc.h_time_checkin || "14:00:00").slice(0, 5),
    checkout: (acc.h_time_checkout || "12:00:00").slice(0, 5),
    extra: parseInt(acc.h_extra) || 0,
    insurance: parseInt(acc.h_insurance) || 0,
    peopleMax: parseInt(acc.h_people_max) || 0,
    location: acc.location || "", sea: acc.sea || "",
    parking: acc.h_parking || "",
    kitchen: acc.h_kitchen_ware || acc.h_kitchen || "",
    additionalCosts: acc.h_additional_costs || "",
    moreDetail: acc.h_moredetail || "",
    bedroomDetail: acc.h_bedroom_detail || "",
    alert: acc.h_alert || "",
  };
  await prisma.houseDetail.upsert({
    where: { houseId: h.h_id },
    create: { houseId: h.h_id, ...detailData },
    update: detailData,
  });

  // Bookings — replace all
  await prisma.booking.deleteMany({ where: { houseId: h.h_id } });
  const validBookings = (bk.bookings || []).filter(b => {
    const ci = new Date(b.book_checkin), co = new Date(b.book_checkout);
    return isValidDate(ci) && isValidDate(co);
  });
  if (validBookings.length > 0) {
    await prisma.booking.createMany({
      data: validBookings.map(b => ({
        houseId: h.h_id,
        checkIn: new Date(b.book_checkin),
        checkOut: new Date(b.book_checkout),
        bookType: b.book_type || "guest",
      })),
    });
  }

  // Holidays — replace all
  await prisma.holiday.deleteMany({ where: { houseId: h.h_id } });
  const allHolidays = [...(bk.holidays || []), ...(bk.hot_holidays || [])].filter(h => {
    const s = new Date(h.holiday_start), e = new Date(h.holiday_end);
    return isValidDate(s) && isValidDate(e);
  });
  if (allHolidays.length > 0) {
    await prisma.holiday.createMany({
      data: allHolidays.map(hol => ({
        houseId: h.h_id, start: new Date(hol.holiday_start), end: new Date(hol.holiday_end),
        type: hol.holiday_type || "holiday", price: hol.holiday_price || 0,
        people: parseInt(hol.holiday_people) || 0, alert: hol.holiday_alert || "",
      })),
    });
  }

  // BasePrice
  if (bk.base_price) {
    const bp = bk.base_price;
    const bpData = { priceSun: bp.price_sun, priceMon: bp.price_mon, priceTue: bp.price_tue, priceWed: bp.price_wed, priceThu: bp.price_thu, priceFri: bp.price_fri, priceSat: bp.price_sat };
    await prisma.basePrice.upsert({
      where: { houseId: h.h_id },
      create: { houseId: h.h_id, ...bpData },
      update: bpData,
    });
  }

  return { bookings: validBookings.length, holidays: allHolidays.length };
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // ตรวจสอบ Authorization (ป้องกัน abuse)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const results: { hId: string; bookings: number; holidays: number; error?: string }[] = [];

  try {
    const houses = await fetchAllHouses();
    console.log(`[cron/sync] Fetched ${houses.length} houses`);

    // Process in batches of 20 concurrently
    const concurrency = 20;
    for (let i = 0; i < houses.length; i += concurrency) {
      const batch = houses.slice(i, i + concurrency);
      
      await Promise.all(batch.map(async (h) => {
        try {
          const r = await syncHouse(h);
          results.push({ hId: h.h_id, ...r });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          results.push({ hId: h.h_id, bookings: 0, holidays: 0, error: msg });
          console.error(`[cron/sync] Error house ${h.h_id}:`, msg);
        }
      }));
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const successCount = results.filter(r => !r.error).length;
    const totalBookings = results.reduce((s, r) => s + r.bookings, 0);
    
    console.log(`[cron/sync] Done: ${successCount}/${houses.length} houses, ${totalBookings} bookings, ${elapsed}s`);

    return NextResponse.json({
      ok: true,
      synced: successCount,
      total: houses.length,
      totalBookings,
      elapsed: `${elapsed}s`,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[cron/sync] Fatal error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
