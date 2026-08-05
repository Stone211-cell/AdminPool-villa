import { fetchAllHouses } from "../lib/external/poolvilla.api";
import { prisma } from "../lib/prisma";

async function check() {
  const all = await fetchAllHouses(2000);
  const found = all.find(h => h.code === "CITY-1905" || h.code === "1905");
  console.log("Found in origin:", !!found);
  
  const inDb = await prisma.house.findUnique({ where: { hId: "1905" }});
  console.log("Found in local DB:", !!inDb);
  
  if (!found && inDb) {
    console.log("Deleting 1905 from DB...");
    await prisma.basePrice.deleteMany({ where: { houseId: "1905" } });
    await prisma.booking.deleteMany({ where: { houseId: "1905" } });
    await prisma.holiday.deleteMany({ where: { houseId: "1905" } });
    await prisma.houseDetail.deleteMany({ where: { houseId: "1905" } });
    await prisma.house.delete({ where: { hId: "1905" } });
    console.log("Deleted.");
  }
}

check().catch(console.error);
