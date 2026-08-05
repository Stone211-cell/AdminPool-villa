// app/api/quick-sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Lightweight sync สำหรับยิงทุก 1 นาที
// ดึงแค่รายการบ้านทั้งหมด (ข้อมูลพื้นฐาน) + อัปเดตบ้านที่ถูกดูใน 24 ชม.ล่าสุด
// ไม่ดึง detail ทุกหลัง → เร็วมาก ~5-10 วินาที
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllHouses, toImageUrl } from "@/lib/external/poolvilla.api";
import { waitUntil } from "@vercel/functions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const hardcodedSecret = "pool-villa-sync-2024-secret";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
  const token = auth?.replace("Bearer ", "").trim();
  return token === process.env.CRON_SECRET || token === hardcodedSecret;
}

async function runQuickSync() {
  // 1. ดึงรายการบ้านทั้งหมดจากต้นทาง (ข้อมูลพื้นฐาน ไม่มี detail) — เร็วมาก
  const remoteHouses = await fetchAllHouses(2000);
  const remoteMap = new Map(remoteHouses.map(h => [
    (h.code || "").replace("CITY-", ""),
    h
  ]));

  // 2. ดึงรายการบ้านทั้งหมดใน DB เรา
  const dbHouses = await prisma.house.findMany({
    select: { hId: true }
  });

  let added = 0, updated = 0, deleted = 0;

  // 3. บ้านที่หายจากต้นทาง → ลบออก
  for (const dbHouse of dbHouses) {
    if (!remoteMap.has(dbHouse.hId)) {
      try {
        await prisma.basePrice.deleteMany({ where: { houseId: dbHouse.hId } });
        await prisma.booking.deleteMany({ where: { houseId: dbHouse.hId } });
        await prisma.holiday.deleteMany({ where: { houseId: dbHouse.hId } });
        await prisma.houseDetail.deleteMany({ where: { houseId: dbHouse.hId } });
        await prisma.house.delete({ where: { hId: dbHouse.hId } });
        deleted++;
      } catch (e) {
        console.error(`[quick-sync] Delete house ${dbHouse.hId} failed:`, e);
      }
    }
  }

  const dbHouseIds = new Set(dbHouses.map(h => h.hId));

  // 4. บ้านใหม่จากต้นทาง → เพิ่ม (แบบ basic ก่อน)
  for (const [hId, rh] of remoteMap) {
    if (!dbHouseIds.has(hId)) {
      try {
        let price = 0;
        if (rh.lowestPrice && typeof rh.lowestPrice === 'object') {
          price = (rh.lowestPrice as any)?.price || 0;
        } else if (typeof rh.lowestPrice === 'number') {
          price = rh.lowestPrice;
        }
        if (!price) {
          const prices = rh.price_house?.[0]?.every_day?.map((d: any) => 
            typeof d.price === 'object' ? d.price.price : Number(d.price)
          ).filter((n: number) => !isNaN(n) && n > 0) || [];
          price = prices.length > 0 ? Math.min(...prices) : 0;
        }

        await prisma.house.upsert({
          where: { hId },
          update: {
            price,
            imgName: toImageUrl(rh.thumbnail?.[0]) || "",
          },
          create: {
            hId,
            hZone: "pattaya",
            hBedroom: 1,
            hToilet: 1,
            hFarsea: "",
            price,
            people: 4,
            imgName: toImageUrl(rh.thumbnail?.[0]) || "",
          }
        });
        added++;
      } catch (e) {
        console.error(`[quick-sync] Add house ${hId} failed:`, e);
      }
    }
  }

  // 5. อัปเดตราคาบ้านที่มีอยู่แล้ว (แบบ batch ไม่ต้องดึง detail)
  let priceUpdated = 0;
  for (const [hId, rh] of remoteMap) {
    if (!dbHouseIds.has(hId)) continue; // ข้ามบ้านใหม่ที่เพิ่งเพิ่ม

    let price = 0;
    if (rh.lowestPrice && typeof rh.lowestPrice === 'object') {
      price = (rh.lowestPrice as any)?.price || 0;
    } else if (typeof rh.lowestPrice === 'number') {
      price = rh.lowestPrice;
    }
    if (!price) {
      const prices = rh.price_house?.[0]?.every_day?.map((d: any) => 
        typeof d.price === 'object' ? d.price.price : Number(d.price)
      ).filter((n: number) => !isNaN(n) && n > 0) || [];
      price = prices.length > 0 ? Math.min(...prices) : 0;
    }

    if (price > 0) {
      await prisma.house.update({
        where: { hId },
        data: { price, imgName: toImageUrl(rh.thumbnail?.[0]) || undefined }
      });
      priceUpdated++;
    }
  }

  console.log(`[quick-sync] Done: +${added} added, ~${priceUpdated} price updated, -${deleted} deleted`);
  return { added, priceUpdated, deleted };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(
    runQuickSync().catch(e => console.error("[quick-sync] Error:", e))
  );

  return NextResponse.json({ success: true, message: "Quick sync started in background" });
}
