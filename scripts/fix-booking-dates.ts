/**
 * scripts/fix-booking-dates.ts
 * แก้วันที่ checkOut ในฐานข้อมูลที่ผิดจากการบวก +1 วันเกินไป
 * ใช้ raw SQL UPDATE เดียว — ไม่ exhaust connection pool
 */

import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("=== แก้ checkOut date ใน DB (Raw SQL) ===");

  const before = await prisma.booking.count();
  console.log(`มี bookings ทั้งหมด ${before} รายการ`);

  // UPDATE เดียว: ลบ 1 วันจาก book_checkout
  // แต่เฉพาะรายการที่ (book_checkout - 1 day) > book_checkin เท่านั้น
  const result = await prisma.$executeRaw`
    UPDATE bookings
    SET book_checkout = book_checkout - INTERVAL '1 day'
    WHERE book_checkout - INTERVAL '1 day' > book_checkin
  `;

  console.log(`\n✅ อัพเดท ${result} รายการสำเร็จ!`);

  // แสดงตัวอย่างเพื่อยืนยัน
  const samples = await prisma.booking.findMany({
    orderBy: { checkIn: "desc" },
    take: 3,
    select: { houseId: true, checkIn: true, checkOut: true, bookType: true },
  });

  console.log("\nตัวอย่าง 3 รายการล่าสุด:");
  for (const s of samples) {
    console.log(`  CITY-${s.houseId}: ${s.checkIn.toISOString().slice(0,10)} → ${s.checkOut.toISOString().slice(0,10)} [${s.bookType}]`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

