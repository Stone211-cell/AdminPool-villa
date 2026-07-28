/**
 * scripts/fix-imgurl-and-bookings.ts
 * แก้ URL ภาพที่บันทึกผิด (sgp1.digitaloceanspaces.com) → poolvillacity.co.th
 * และ re-sync bookings ทั้งหมดจาก API ใหม่ด้วย date_end ที่ถูกต้อง
 */

import { PrismaClient } from "../app/generated/prisma";
import axios from "axios";

const prisma = new PrismaClient();
const API_BASE = "https://api.poolvillacity.co.th/next-villapaza/api";

async function fixImageUrls() {
  console.log("=== Step 1: แก้ URL ภาพที่ผิด ===");

  // แก้ URL ที่ขึ้นต้นด้วย sgp1.digitaloceanspaces.com/villapaza-spaces
  const wrongPrefix = "https://sgp1.digitaloceanspaces.com/villapaza-spaces";
  const correctBase = "https://poolvillacity.co.th";

  const houses = await prisma.house.findMany({
    where: { imgName: { contains: "sgp1.digitaloceanspaces.com" } },
    select: { hId: true, imgName: true },
  });

  console.log(`พบภาพที่ URL ผิด ${houses.length} หลัง`);

  let fixed = 0;
  for (const h of houses) {
    const newUrl = h.imgName.replace(wrongPrefix, correctBase);
    await prisma.house.update({
      where: { hId: h.hId },
      data: { imgName: newUrl },
    });
    fixed++;
    if (fixed % 10 === 0) console.log(`  แก้แล้ว ${fixed}/${houses.length}`);
  }
  console.log(`✅ แก้ URL ภาพครบ ${fixed} หลัง`);
}

async function resyncBookings() {
  console.log("\n=== Step 2: Re-sync bookings ทั้งหมดจาก API ===");

  // ดึงบ้านทั้งหมดใน DB
  const allHouses = await prisma.house.findMany({ select: { hId: true } });
  console.log(`มีบ้าน ${allHouses.length} หลัง`);

  let totalFixed = 0;
  let totalErrors = 0;

  // Process in batches of 5
  const concurrency = 5;
  for (let i = 0; i < allHouses.length; i += concurrency) {
    const chunk = allHouses.slice(i, i + concurrency);

    await Promise.all(
      chunk.map(async ({ hId }) => {
        try {
          const res = await axios.get(
            `${API_BASE}/customer/house/info/CITY-${hId}`,
            { timeout: 15000 }
          );
          const data = res.data?.result;
          if (!data?.book) return;

          // ลบ bookings เก่าทั้งหมดของบ้านนี้
          await prisma.booking.deleteMany({ where: { houseId: hId } });
          await prisma.holiday.deleteMany({ where: { houseId: hId } });

          const books: any[] = Array.isArray(data.book) ? data.book : [];
          let bCount = 0;

          for (const b of books) {
            if (!b.date_start || !b.date_end) continue;
            const statusName = b.status?.name_th || "";

            if (
              statusName === "เทศกาล" ||
              statusName === "ลดราคา" ||
              statusName === "โปรโมชั่น"
            ) {
              const hType = statusName === "เทศกาล" ? "holiday" : "hotpro";
              await prisma.holiday.create({
                data: {
                  houseId: hId,
                  start: new Date(b.date_start),
                  end: new Date(b.date_end),
                  type: hType,
                  price: 0,
                  people: 0,
                  alert: "",
                },
              });
            } else {
              let bType = "deville"; // ติดจอง, ชำระแล้ว ฯลฯ
              if (statusName === "รอชำระ") bType = "waiting";
              if (statusName === "ปิดปรับปรุง") bType = "repair";

              // ⚠️ FIX: ไม่บวก +1 วัน เพราะ date_end เป็น exclusive อยู่แล้ว
              await prisma.booking.create({
                data: {
                  houseId: hId,
                  checkIn: new Date(b.date_start),
                  checkOut: new Date(b.date_end),
                  bookType: bType,
                },
              });
              bCount++;
            }
          }
          totalFixed++;
        } catch (err: any) {
          console.error(`  ❌ CITY-${hId}: ${err.message}`);
          totalErrors++;
        }
      })
    );

    const done = Math.min(i + concurrency, allHouses.length);
    process.stdout.write(`\r  sync แล้ว ${done}/${allHouses.length} หลัง...`);
  }

  console.log(`\n✅ re-sync bookings ครบ ${totalFixed} หลัง (error: ${totalErrors})`);
}

async function main() {
  try {
    await fixImageUrls();
    await resyncBookings();
    console.log("\n🎉 เสร็จสมบูรณ์!");
  } catch (e) {
    console.error("Fatal error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
