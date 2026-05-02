import { prisma } from "../lib/prisma";

async function main() {
  // เช็คค่าของ hFarsea มีอะไรบ้าง
  const farseas = await prisma.house.groupBy({
    by: ['hFarsea'],
    _count: true,
    orderBy: { _count: { hFarsea: 'desc' } }
  });
  console.log('hFarsea values:', farseas);

  // เช็ค sample house ดูโครงสร้าง
  const sample = await prisma.house.findFirst();
  console.log('\nSample house:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
