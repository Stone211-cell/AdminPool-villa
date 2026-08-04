const { PrismaClient } = require('../app/generated/prisma');
const p = new PrismaClient();

async function main() {
  const rows = await p.house.findMany({ 
    take: 20, 
    select: { hId: true, imgName: true, price: true, hBedroom: true } 
  });
  
  const total = await p.house.count();
  const noImg = rows.filter(r => !r.imgName || r.imgName.trim() === '');
  
  console.log(`Total houses in DB: ${total}`);
  console.log(`Sample (20 rows) - no image: ${noImg.length}`);
  console.log('\nSample rows:');
  rows.forEach(r => {
    const img = r.imgName || '(EMPTY)';
    console.log(`${r.hId} | bed:${r.hBedroom} | price:${r.price} | img: ${img.slice(0,80)}`);
  });
}

main().catch(console.error).finally(() => p.$disconnect());
