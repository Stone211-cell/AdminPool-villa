import { prisma } from '../lib/prisma';
async function run() {
  const hd = await prisma.holiday.findFirst({ where: { houseId: '1093', type: 'hotpro' }});
  console.log('hotpro record for 1093:', hd);
}
run();
