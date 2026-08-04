import { prisma } from '../lib/prisma';
import { syncOneHouse } from '../lib/services/sync.service';
import { fetchAllHouses } from '../lib/external/poolvilla.api';

async function run() {
  const rh = await fetchAllHouses();
  const h1093 = rh.find((h: any) => h.code === 'CITY-1093');
  if (h1093) {
    await syncOneHouse(h1093);
    console.log('Synced 1093');
    const bp = await prisma.basePrice.findUnique({where: {houseId: '1093'}});
    console.log(bp);
  } else {
    console.log('1093 not found');
  }
}
run();
