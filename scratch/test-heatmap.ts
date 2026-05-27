// scratch/test-heatmap.ts
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting heatmap generation...");
  try {
    const start = Date.now();
    const year = 2026;
    const month = 5;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const totalHouses = await prisma.house.count();

    const [bookings, holidays] = await Promise.all([
      prisma.booking.findMany({
        where: { checkIn: { lt: monthEnd }, checkOut: { gt: monthStart } },
        select: { houseId: true, checkIn: true, checkOut: true, bookType: true },
      }),
      prisma.holiday.findMany({
        where: { start: { lte: monthEnd }, end: { gte: monthStart } },
        select: { houseId: true, start: true, end: true, type: true },
      }),
    ]);

    console.log(`Fetched ${bookings.length} bookings, ${holidays.length} holidays in ${Date.now() - start}ms`);

    const heatmap: any = {};
    const cur = new Date(monthStart);
    while (cur <= monthEnd) {
      const dayStart = new Date(cur);
      const dayEnd = new Date(cur); dayEnd.setUTCHours(23, 59, 59, 999);
      const key = cur.toISOString().slice(0, 10);

      const dayBookings = bookings.filter(b => b.checkIn < dayEnd && b.checkOut > dayStart);
      const dayHolidays = holidays.filter(h => h.start <= dayEnd && h.end >= dayStart);
      
      heatmap[key] = { bookings: dayBookings.length, holidays: dayHolidays.length };
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    console.log(`Heatmap built in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
