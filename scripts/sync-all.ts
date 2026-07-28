// scripts/sync-all.ts
// ──────────────────────────────────────────────────────────────────────────────
// สคริปต์รันบนเครื่องตัวเอง เพื่อกวาดข้อมูลบ้านทั้งหมดจาก API เข้า Database
// รันด้วย: npx tsx scripts/sync-all.ts
// ──────────────────────────────────────────────────────────────────────────────
import { fetchAllHouses } from "../lib/external/poolvilla.api";
import { syncOneHouse } from "../lib/services/sync.service";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("📡 Fetching all houses from API...");
  const remoteHouses = await fetchAllHouses(2000);
  console.log(`✅ Found ${remoteHouses.length} houses`);

  // Skip houses synced in the last 12 hours (resume capability)
  const dbHouses = await prisma.house.findMany({
    select: { hId: true, updatedAt: true },
  });
  const recentMap = new Map<string, boolean>();
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  const now = Date.now();
  dbHouses.forEach((h) => {
    if (now - h.updatedAt.getTime() < TWELVE_HOURS) {
      recentMap.set(h.hId, true);
    }
  });

  const toSync = remoteHouses.filter((rh) => {
    const hId = (rh.code || "").replace("CITY-", "");
    return !recentMap.has(hId);
  });

  console.log(
    `⏭️  Skipping ${remoteHouses.length - toSync.length} recently synced houses`
  );
  console.log(`🔄 Syncing ${toSync.length} houses...\n`);

  let count = 0;
  for (const rh of toSync) {
    const hId = (rh.code || "").replace("CITY-", "");
    try {
      const result = await syncOneHouse(rh);
      count++;
      console.log(
        `[${count + (remoteHouses.length - toSync.length)}/${remoteHouses.length}] ✅ CITY-${hId} — ${result?.bookings ?? 0} bookings`
      );
      // Small delay to avoid overwhelming the DB/API
      await new Promise((r) => setTimeout(r, 100));
    } catch (err: any) {
      console.error(`[❌] Error syncing CITY-${hId}:`, err.message);
    }
  }

  const total = await prisma.house.count();
  console.log(`\n🎉 Done! DB now has ${total} houses.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
