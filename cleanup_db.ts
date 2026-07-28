import { PrismaClient } from './app/generated/prisma';
import { fetchAllHouses } from './lib/external/poolvilla.api';

(async () => {
  const prisma = new PrismaClient();
  try {
    const allActive = await fetchAllHouses(2000);
    const activeIds = new Set(allActive.map(h => (h.code || '').replace('CITY-', '')));
    
    const ourHouses = await prisma.house.findMany({ select: { hId: true } });
    const toDelete = ourHouses.filter(h => !activeIds.has(h.hId));
    
    console.log('To delete:', toDelete.length);
    if (toDelete.length > 0) {
      let count = 0;
      for (const h of toDelete) {
        await prisma.basePrice.deleteMany({ where: { houseId: h.hId } });
        await prisma.booking.deleteMany({ where: { houseId: h.hId } });
        await prisma.holiday.deleteMany({ where: { houseId: h.hId } });
        await prisma.houseDetail.deleteMany({ where: { houseId: h.hId } });
        await prisma.house.deleteMany({ where: { hId: h.hId } });
        count++;
        if (count % 10 === 0) console.log('Deleted', count);
      }
      console.log('Deleted all orphaned houses:', count);
    }
  } catch(e) { console.error(e); }
  process.exit(0);
})();
