/**
 * scripts/scrape-houses.ts
 * ดึงข้อมูลบ้านพูลวิลล่าทั้งหมด + รายละเอียด/ปฏิทิน แล้วบันทึกลง PostgreSQL
 *
 * วิธีใช้:
 *   npx tsx scripts/scrape-houses.ts
 *
 * Options:
 *   --house=2866       scrape แค่หลังเดียว
 *   --detail           ดึง detail + booking ด้วย (ช้ากว่า)
 *   --limit=50         จำกัดจำนวนบ้านที่จะ scrape
 */

import "dotenv/config";
import axios from "axios";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---- Types ----
interface HouseRaw {
  _id: string; h_id: string; h_zone: string;
  h_bedroom: string; h_toilet: string; h_farsea: string;
  wifi: string; grill: string; pet: string; snooker: string;
  discotech: string; slider: string; billard: string;
  swimming_kid: string; swim: string; karaoke: string;
  airhockey: string; jacuzzi: string; bath: string;
  img_name: string; price: string; people: string;
}

interface Booking {
  book_checkin: string; book_checkout: string; book_type: string;
}
interface Holiday {
  holiday_start: string; holiday_end: string;
  holiday_type: string; holiday_price: number;
  holiday_people: string; holiday_alert: string;
}
interface BasePrice {
  price_sun: number; price_mon: number; price_tue: number;
  price_wed: number; price_thu: number; price_fri: number; price_sat: number;
}
interface HouseAcc {
  h_time_checkin: string; h_time_checkout: string;
  h_extra: string; h_insurance: string; h_people_max: string;
  location: string; sea: string;
  h_parking: string | null; h_kitchen_ware: string | null;
  h_additional_costs: string | null; h_moredetail: string | null;
  h_bedroom_detail: string | null; h_alert: string | null;
}

// ---- Fetch รายการบ้านทั้งหมด ----
async function fetchAllHouses(): Promise<HouseRaw[]> {
  console.log("🔍 กำลังดึงรายการบ้านทั้งหมด...");
  const { data: text } = await axios.get<string>("https://www.poolvilla-pwth.com/houses", {
    headers: { RSC: "1", Accept: "text/x-component", "User-Agent": "Mozilla/5.0" },
    responseType: "text", timeout: 20000,
  });

  const all: HouseRaw[] = [];
  let pos = 0;
  while (true) {
    const marker = '"data":[{"_id"';
    const idx = text.indexOf(marker, pos);
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

// ---- Fetch detail + booking ของบ้านแต่ละหลัง ----
async function fetchDetail(hId: string) {
  try {
    const { data: text } = await axios.get<string>(
      `https://www.poolvilla-pwth.com/houses/${hId}`,
      { headers: { RSC: "1", Accept: "text/x-component", "User-Agent": "Mozilla/5.0" }, responseType: "text", timeout: 15000 }
    );
    const marker = '"bk":{"bookings"';
    const idx = text.indexOf(marker);
    if (idx === -1) return null;
    let start = idx;
    while (start > 0 && text[start] !== "{") start--;
    let depth = 0, end = start;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    return JSON.parse(text.slice(start, end + 1)) as { acc: HouseAcc; bk: { bookings: Booking[]; holidays: Holiday[]; hot_holidays: Holiday[]; base_price: BasePrice } };
  } catch { return null; }
}

// ---- Upsert บ้านลง DB ----
async function upsertHouse(h: HouseRaw) {
  const y = (v: string) => v === "y";
  await prisma.house.upsert({
    where: { hId: h.h_id },
    create: {
      hId: h.h_id, hZone: h.h_zone || "pattaya",
      hBedroom: parseInt(h.h_bedroom) || 0,
      hToilet: parseInt(h.h_toilet) || 0,
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
      hBedroom: parseInt(h.h_bedroom) || 0,
      hToilet: parseInt(h.h_toilet) || 0,
      hFarsea: h.h_farsea || "", price: parseInt(h.price) || 0,
      people: parseInt(h.people) || 0, imgName: h.img_name || "",
      swim: h.swim || "chlorine",
      wifi: y(h.wifi), grill: y(h.grill), pet: y(h.pet),
      karaoke: y(h.karaoke), jacuzzi: y(h.jacuzzi), snooker: y(h.snooker),
      discotech: y(h.discotech), slider: y(h.slider), billard: y(h.billard),
      swimmingKid: y(h.swimming_kid), bath: y(h.bath),
    },
  });
}

// ---- Upsert detail + bookings ----
async function upsertDetail(hId: string, acc: HouseAcc, bk: { bookings: Booking[]; holidays: Holiday[]; hot_holidays: Holiday[]; base_price: BasePrice }) {
  // HouseDetail
  await prisma.houseDetail.upsert({
    where: { houseId: hId },
    create: {
      houseId: hId,
      checkin: (acc.h_time_checkin || "14:00:00").slice(0, 5),
      checkout: (acc.h_time_checkout || "12:00:00").slice(0, 5),
      extra: parseInt(acc.h_extra) || 0,
      insurance: parseInt(acc.h_insurance) || 0,
      peopleMax: parseInt(acc.h_people_max) || 0,
      location: acc.location || "", sea: acc.sea || "",
      parking: acc.h_parking || "", kitchen: acc.h_kitchen_ware || "",
      additionalCosts: acc.h_additional_costs || "",
      moreDetail: acc.h_moredetail || "",
      bedroomDetail: acc.h_bedroom_detail || "",
      alert: acc.h_alert || "",
    },
    update: {
      checkin: (acc.h_time_checkin || "14:00:00").slice(0, 5),
      checkout: (acc.h_time_checkout || "12:00:00").slice(0, 5),
      extra: parseInt(acc.h_extra) || 0,
      insurance: parseInt(acc.h_insurance) || 0,
      peopleMax: parseInt(acc.h_people_max) || 0,
      location: acc.location || "", sea: acc.sea || "",
      parking: acc.h_parking || "", kitchen: acc.h_kitchen_ware || "",
      additionalCosts: acc.h_additional_costs || "",
      moreDetail: acc.h_moredetail || "",
      bedroomDetail: acc.h_bedroom_detail || "",
      alert: acc.h_alert || "",
    },
  });

  // Bookings — ลบเก่าแล้วสร้างใหม่
  await prisma.booking.deleteMany({ where: { houseId: hId } });
  if (bk.bookings.length > 0) {
    await prisma.booking.createMany({
      data: bk.bookings.map(b => ({
        houseId: hId,
        checkIn: new Date(b.book_checkin),
        checkOut: new Date(b.book_checkout),
        bookType: b.book_type || "guest",
      })),
    });
  }

  // Holidays
  await prisma.holiday.deleteMany({ where: { houseId: hId } });
  const allHolidays = [...(bk.holidays || []), ...(bk.hot_holidays || [])];
  if (allHolidays.length > 0) {
    await prisma.holiday.createMany({
      data: allHolidays.map(h => ({
        houseId: hId,
        start: new Date(h.holiday_start),
        end: new Date(h.holiday_end),
        type: h.holiday_type || "holiday",
        price: h.holiday_price || 0,
        people: parseInt(h.holiday_people) || 0,
        alert: h.holiday_alert || "",
      })),
    });
  }

  // BasePrice
  const bp = bk.base_price;
  if (bp) {
    await prisma.basePrice.upsert({
      where: { houseId: hId },
      create: { houseId: hId, priceSun: bp.price_sun, priceMon: bp.price_mon, priceTue: bp.price_tue, priceWed: bp.price_wed, priceThu: bp.price_thu, priceFri: bp.price_fri, priceSat: bp.price_sat },
      update: { priceSun: bp.price_sun, priceMon: bp.price_mon, priceTue: bp.price_tue, priceWed: bp.price_wed, priceThu: bp.price_thu, priceFri: bp.price_fri, priceSat: bp.price_sat },
    });
  }
}

// ---- Main ----
async function main() {
  const args = process.argv.slice(2);
  const singleHouse = args.find(a => a.startsWith("--house="))?.split("=")[1];
  const withDetail = args.includes("--detail");
  const limit = parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "0");

  try {
    let houses: HouseRaw[];

    if (singleHouse) {
      // scrape แค่หลังเดียว
      houses = [{ h_id: singleHouse, h_zone: "pattaya", h_bedroom: "0", h_toilet: "0", h_farsea: "", wifi: "n", grill: "n", pet: "n", snooker: "n", discotech: "n", slider: "n", billard: "n", swimming_kid: "n", swim: "chlorine", karaoke: "n", airhockey: "n", jacuzzi: "n", bath: "n", img_name: "", price: "0", people: "0", _id: "" }];
    } else {
      houses = await fetchAllHouses();
      if (limit > 0) houses = houses.slice(0, limit);
    }

    console.log(`📦 พบ ${houses.length} หลัง — กำลังบันทึกลง DB...`);

    let saved = 0, failed = 0;
    for (const h of houses) {
      try {
        if (!singleHouse) await upsertHouse(h);

        if (withDetail || singleHouse) {
          process.stdout.write(`   🔍 ดึง detail บ้าน ${h.h_id}... `);
          await new Promise(r => setTimeout(r, 300)); // rate limit
          const detail = await fetchDetail(h.h_id);
          if (detail?.acc && detail?.bk) {
            await upsertDetail(h.h_id, detail.acc, detail.bk);
            console.log(`✅ (${detail.bk.bookings.length} bookings)`);
          } else {
            console.log(`⚠️ ไม่มี detail`);
          }
        }
        saved++;
      } catch (e) {
        console.error(`   ❌ บ้าน ${h.h_id}:`, e);
        failed++;
      }
    }

    console.log(`\n✅ สำเร็จ ${saved} หลัง | ❌ ล้มเหลว ${failed} หลัง`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
