import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const houses = await prisma.house.findMany();
  let promoCount = 0;
  let recommendCount = 0;

  for (let i = 0; i < houses.length; i++) {
    const house = houses[i];
    let category = "NORMAL";
    
    // Assign 4 random promo houses and 4 recommend houses
    if (promoCount < 4 && Math.random() > 0.5) {
      category = "PROMOTION";
      promoCount++;
    } else if (recommendCount < 4 && Math.random() > 0.5) {
      category = "RECOMMENDED";
      recommendCount++;
    }

    if (category !== "NORMAL") {
      await prisma.house.update({
        where: { id: house.id },
        data: { category }
      });
      console.log(`Updated house ${house.hId} to ${category}`);
    }
  }
  
  console.log("Done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
