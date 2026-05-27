// scratch/test-availability.ts
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function test() {
  console.log("Starting test-availability...");
  const startTime = Date.now();

  try {
    console.log("1. Querying total houses...");
    const totalHouses = await prisma.house.count();
    console.log("Total houses in DB:", totalHouses);

    if (totalHouses > 0) {
      console.log("2. Querying month calendar (2026-05)...");
      const monthStart = new Date(Date.UTC(2026, 4, 1));
      const monthEnd   = new Date(Date.UTC(2026, 5, 0, 23, 59, 59));

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

      console.log(`Found ${bookings.length} bookings and ${holidays.length} holidays in DB`);
    }

    console.log("Test successfully finished in:", Date.now() - startTime, "ms");
  } catch (e) {
    console.error("Test failed with error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
