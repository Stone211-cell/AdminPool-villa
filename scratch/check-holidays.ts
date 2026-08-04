import { prisma } from '../lib/prisma';
async function run() {
  const count = await prisma.holiday.count({ where: { houseId: '1093' } });
  const holidays = await prisma.holiday.findMany({ where: { houseId: '1093' } });
  console.log('Holidays in DB for 1093:', count);
  console.log(holidays);
}
run();
