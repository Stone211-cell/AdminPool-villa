// scratch/test-findmany.ts
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting prisma findMany...");
  try {
    const start = Date.now();
    const houses = await prisma.house.findMany({
      orderBy: { price: "asc" },
    });
    const json = JSON.stringify(houses);
    console.log(`Fetched ${houses.length} houses in ${Date.now() - start}ms. JSON length: ${json.length} bytes`);
  } catch (err) {
    console.error("Error with prisma:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
