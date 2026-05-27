// scratch/check-db-status.ts
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  try {
    const totalHouses = await prisma.house.count();
    const totalDetails = await prisma.houseDetail.count();
    const totalBookings = await prisma.booking.count();
    const totalHolidays = await prisma.holiday.count();
    const totalBasePrices = await prisma.basePrice.count();

    console.log("=== DATABASE STATISTICS ===");
    console.log("Total Houses in DB:", totalHouses);
    console.log("Total House Details in DB:", totalDetails);
    console.log("Total Bookings in DB:", totalBookings);
    console.log("Total Holidays in DB:", totalHolidays);
    console.log("Total Base Prices in DB:", totalBasePrices);

    // Get the latest updated house
    const latestHouses = await prisma.house.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { hId: true, updatedAt: true }
    });

    console.log("\n=== LATEST UPDATED HOUSES ===");
    latestHouses.forEach(h => {
      console.log(`House ID: ${h.hId}, Updated At: ${h.updatedAt.toISOString()}`);
    });

    // Get the oldest updated house
    const oldestHouses = await prisma.house.findMany({
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: { hId: true, updatedAt: true }
    });

    console.log("\n=== OLDEST UPDATED HOUSES ===");
    oldestHouses.forEach(h => {
      console.log(`House ID: ${h.hId}, Updated At: ${h.updatedAt.toISOString()}`);
    });

  } catch (e) {
    console.error("Error checking DB status:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
