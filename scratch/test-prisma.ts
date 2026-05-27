// scratch/test-prisma.ts
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting prisma...");
  try {
    const start = Date.now();
    const count = await prisma.house.count();
    console.log(`Counted ${count} houses in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Error with prisma:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
