import { syncOneHouse } from '../lib/services/sync.service';
import { prisma } from '../lib/prisma';

async function run() {
  console.log('Syncing 1093...');
  const res = await syncOneHouse({ code: 'CITY-1093' } as any);
  console.log('Sync result:', res);
  const count = await prisma.holiday.count({ where: { houseId: '1093' } });
  console.log('Holidays in DB after sync:', count);
}
run();
