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
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

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
    // RSC stream: scan each line for a JSON object containing both "acc" and "bk"
    for (const line of text.split("\n")) {
      if (!line.includes('"bk"') || !line.includes('"acc"')) continue;
      const firstBrace = line.indexOf("{");
      if (firstBrace === -1) continue;
      try {
        let depth = 0, end = firstBrace;
        for (let i = firstBrace; i < line.length; i++) {
          if (line[i] === "{") depth++;
          else if (line[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
        }
        const obj = JSON.parse(line.slice(firstBrace, end + 1));
        if (obj.acc && obj.bk) return obj as {
          acc: HouseAcc;
          bk: { bookings: Booking[]; holidays: Holiday[]; hot_holidays: Holiday[]; base_price: BasePrice };
        };
      } catch { /**/ }
    }
    return null;
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
  // HouseDetail — ใช้ field names จริงจาก acc
  await prisma.houseDetail.upsert({
    where: { houseId: hId },
    create: {
      houseId: hId,
      checkin: (acc.h_time_checkin || "14:00:00").slice(0, 5),
      checkout: (acc.h_time_checkout || "12:00:00").slice(0, 5),
      extra: parseInt(acc.h_extra) || 0,
      insurance: parseInt(acc.h_insurance) || 0,
      peopleMax: parseInt(acc.h_people_max) || 0,
      location: acc.location || "",
      sea: acc.sea || "",
      parking: (acc as any).h_parking || "",
      kitchen: (acc as any).h_kitchen_ware || (acc as any).h_kitchen || "",
      additionalCosts: (acc as any).h_additional_costs || "",
      moreDetail: (acc as any).h_moredetail || "",
      bedroomDetail: (acc as any).h_bedroom_detail || "",
      alert: (acc as any).h_alert || "",
    },
    update: {
      checkin: (acc.h_time_checkin || "14:00:00").slice(0, 5),
      checkout: (acc.h_time_checkout || "12:00:00").slice(0, 5),
      extra: parseInt(acc.h_extra) || 0,
      insurance: parseInt(acc.h_insurance) || 0,
      peopleMax: parseInt(acc.h_people_max) || 0,
      location: acc.location || "",
      sea: acc.sea || "",
      parking: (acc as any).h_parking || "",
      kitchen: (acc as any).h_kitchen_ware || (acc as any).h_kitchen || "",
      additionalCosts: (acc as any).h_additional_costs || "",
      moreDetail: (acc as any).h_moredetail || "",
      bedroomDetail: (acc as any).h_bedroom_detail || "",
      alert: (acc as any).h_alert || "",
    },
  });

  // Bookings — ลบเก่าแล้วสร้างใหม่
  await prisma.booking.deleteMany({ where: { houseId: hId } });
  const validBookings = bk.bookings.filter(b => {
    const ci = new Date(b.book_checkin), co = new Date(b.book_checkout);
    return !isNaN(ci.getTime()) && !isNaN(co.getTime());
  });
  if (validBookings.length > 0) {
    await prisma.booking.createMany({
      data: validBookings.map(b => ({
        houseId: hId,
        checkIn: new Date(b.book_checkin),
        checkOut: new Date(b.book_checkout),
        bookType: b.book_type || "guest",
      })),
    });
  }

  // Holidays
  await prisma.holiday.deleteMany({ where: { houseId: hId } });
  const allHolidays = [...(bk.holidays || []), ...(bk.hot_holidays || [])].filter(h => {
    const s = new Date(h.holiday_start), e = new Date(h.holiday_end);
    return !isNaN(s.getTime()) && !isNaN(e.getTime());
  });
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
  const isFullSync = args.includes("--full");
  const limit = parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "0");

  try {
    let houses: HouseRaw[];

    if (singleHouse) {
      houses = [{ h_id: singleHouse, h_zone: "pattaya", h_bedroom: "0", h_toilet: "0", h_farsea: "", wifi: "n", grill: "n", pet: "n", snooker: "n", discotech: "n", slider: "n", billard: "n", swimming_kid: "n", swim: "chlorine", karaoke: "n", airhockey: "n", jacuzzi: "n", bath: "n", img_name: "", price: "0", people: "0", _id: "" }];
    } else {
      const remoteHouses = await fetchAllHouses();
      if (isFullSync) {
        houses = remoteHouses;
        if (limit > 0) houses = houses.slice(0, limit);
      } else if (withDetail) {
        console.log("🔍 กำลังดึงข้อมูลจาก DB เพื่อหาบ้านใหม่และเปรียบเทียบข้อมูล...");
        const dbHouses = await prisma.house.findMany({
          select: { hId: true, price: true, hBedroom: true, hToilet: true, people: true, imgName: true, updatedAt: true }
        });
        const dbHouseMap = new Map(dbHouses.map(h => [h.hId, h]));

        const newHouses: HouseRaw[] = [];
        const modifiedHouses: HouseRaw[] = [];
        const unchangedHouses: HouseRaw[] = [];

        for (const rh of remoteHouses) {
          const dbHouse = dbHouseMap.get(rh.h_id);
          if (!dbHouse) {
            newHouses.push(rh);
          } else {
            const isModified =
              (parseInt(rh.price) || 0) !== dbHouse.price ||
              (parseInt(rh.h_bedroom) || 0) !== dbHouse.hBedroom ||
              (parseInt(rh.h_toilet) || 0) !== dbHouse.hToilet ||
              (parseInt(rh.people) || 0) !== dbHouse.people ||
              (rh.img_name || "") !== dbHouse.imgName;

            if (isModified) {
              modifiedHouses.push(rh);
            } else {
              unchangedHouses.push(rh);
            }
          }
        }

        // Sort unchanged by updatedAt ascending
        unchangedHouses.sort((a, b) => {
          const timeA = dbHouseMap.get(a.h_id)?.updatedAt.getTime() || 0;
          const timeB = dbHouseMap.get(b.h_id)?.updatedAt.getTime() || 0;
          return timeA - timeB;
        });

        const syncLimit = limit > 0 ? limit : 50;
        houses = [...newHouses, ...modifiedHouses, ...unchangedHouses].slice(0, syncLimit);

        console.log(`💡 สถิติจากระบบ: บ้านใหม่ ${newHouses.length} หลัง | ข้อมูลเปลี่ยนไป ${modifiedHouses.length} หลัง | บ้านคงเดิม ${unchangedHouses.length} หลัง`);
        console.log(`📌 รอบนี้จะดึงรายละเอียดบ้านทั้งหมด ${houses.length} หลัง (บ้านใหม่ + เปลี่ยนแปลง + บ้านเดิมค้างซิงค์นานที่สุด)`);
      } else {
        houses = remoteHouses;
        if (limit > 0) houses = houses.slice(0, limit);
      }
    }

    console.log(`📦 ดำเนินการซิงค์ข้อมูล ${houses.length} หลัง...`);

    let saved = 0, failed = 0;

    // Process in batches of 20
    const concurrency = 20;
    for (let i = 0; i < houses.length; i += concurrency) {
      const batch = houses.slice(i, i + concurrency);

      await Promise.all(batch.map(async (h) => {
        try {
          // Always upsert basic info first to record that this house was touched (updates updatedAt)
          if (!singleHouse) await upsertHouse(h);

          if (withDetail || singleHouse) {
            await new Promise(r => setTimeout(r, 200)); // rate limit
            const detail = await fetchDetail(h.h_id);
            if (detail?.acc && detail?.bk) {
              await upsertDetail(h.h_id, detail.acc, detail.bk);
              console.log(`   ✅ บ้าน ${h.h_id} ซิงค์รายละเอียดสำเร็จ (${detail.bk.bookings.length} bookings)`);
            } else {
              throw new Error("ดึงข้อมูลปฏิทินจองหรือรายละเอียดจากหน้าเว็บต้นฉบับไม่สำเร็จ");
            }
          } else {
            console.log(`   ✅ บ้าน ${h.h_id} ซิงค์ข้อมูลหลักสำเร็จ`);
          }
          saved++;
        } catch (e) {
          console.error(`   ❌ บ้าน ${h.h_id} ล้มเหลว:`, e instanceof Error ? e.message : String(e));
          failed++;
        }
      }));

      // Print progress
      const current = Math.min(i + concurrency, houses.length);
      console.log(`--- ความคืบหน้า: ${current}/${houses.length} ---`);
    }

    console.log(`\n✅ สำเร็จ ${saved} หลัง | ❌ ล้มเหลว ${failed} หลัง`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
