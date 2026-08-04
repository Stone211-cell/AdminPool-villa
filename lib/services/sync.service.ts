// lib/services/sync.service.ts
// ──────────────────────────────────────────────────────────────────────────────
// Business logic: sync ข้อมูลบ้านจาก API ลง DB (ใช้ Prisma)
// ──────────────────────────────────────────────────────────────────────────────
import { prisma } from "@/lib/prisma";
import {
  fetchHouseDetail,
  fetchAllHouses,
  hasFacility,
  toImageUrl,
  RemoteHouse,
} from "@/lib/external/poolvilla.api";

// ─── Sync single house ────────────────────────────────────────────────────────
export async function syncOneHouse(rh: RemoteHouse): Promise<{ bookings: number } | null> {
  const hId = (rh.code || "").replace("CITY-", "");
  if (!hId) return null;

  const data = await fetchHouseDetail(hId);
  if (!data?.house) return null;

  const h = data.house;
  const facs = Array.isArray(h.facilities) ? h.facilities : [];
  const hasFac = (k: string) => hasFacility(facs, k);

  const houseData = {
    hId,
    hZone: h.district || "pattaya",
    hBedroom: h.number_of_bedrooms || 0,
    hToilet: h.number_of_bathrooms || 0,
    hFarsea: "",
    price: (() => {
      // First try to get the most accurate price from the detailed data we just fetched
      if (h.lowestPrice && typeof h.lowestPrice === 'object' && typeof h.lowestPrice.price === 'number') {
        return h.lowestPrice.price;
      }
      
      // Fallback to the remote list data
      let p = typeof rh.lowestPrice === 'object' ? (rh.lowestPrice as any)?.price : Number(rh.lowestPrice);
      if (!p || isNaN(p)) {
        const prices = rh.price_house?.[0]?.every_day?.map((d: any) => typeof d.price === 'object' ? d.price.price : Number(d.price)).filter(n => !isNaN(n)) || [];
        p = prices.length > 0 ? Math.min(...prices) : 0;
      }
      return p || 0;
    })(),
    people: h.accommodate_number || 0,
    imgName: toImageUrl(rh.thumbnail?.[0]),
    swim: hasFac("salt") ? "salt" : "chlorine",
    wifi: hasFac("wifi") || hasFac("อินเทอร์เน็ต"),
    grill: hasFac("เตาปิ้งย่าง"),
    pet: hasFac("สัตว์เลี้ยง"),
    karaoke: hasFac("คาราโอเกะ"),
    jacuzzi: hasFac("จากุซซี่"),
    snooker: hasFac("สนุ๊กเกอร์"),
    discotech: hasFac("ไฟเธค"),
    slider: hasFac("สไลเดอร์"),
    billard: hasFac("บิลเลียด"),
    swimmingKid: hasFac("สระเด็ก"),
    bath: hasFac("อ่างอาบน้ำ"),
  };

  await prisma.house.upsert({
    where: { hId },
    create: houseData,
    update: houseData,
  });

  const detailData = {
    houseId: hId,
    checkin: h.check_in_time || "14:00",
    checkout: h.check_out_time || "12:00",
    extra: h.additional_stay_information?.extra_per_person || 0,
    insurance: h.additional_stay_information?.damage_insurance || 0,
    peopleMax: h.accommodate_number || 0,
    location: h.location?.name || "",
    sea: "",
    parking: "",
    kitchen: "",
    additionalCosts: "",
    moreDetail: h.detail || "",
    bedroomDetail: "",
    alert: h.additional_stay_information?.service || "",
  };

  await prisma.houseDetail.upsert({
    where: { houseId: hId },
    create: detailData,
    update: detailData,
  });

  // Sync bookings
  await prisma.booking.deleteMany({ where: { houseId: hId } });
  await prisma.holiday.deleteMany({ where: { houseId: hId } });

  const books = Array.isArray(data.book) ? data.book : [];
  const bookData: any[] = [];
  const holidayData: any[] = [];

  for (const b of books) {
    if (!b.date_start || !b.date_end) continue;
    const statusName = b.status?.name_th || "";

    if (
      statusName === "เทศกาล" ||
      statusName === "ลดราคา" ||
      statusName === "โปรโมชั่น"
    ) {
      holidayData.push({
        houseId: hId,
        start: new Date(b.date_start),
        end: new Date(b.date_end),
        type: statusName === "เทศกาล" ? "holiday" : "hotpro",
        price: 0,
        people: 0,
        alert: "",
      });
    } else {
      let bType = "deville";
      if (statusName === "รอชำระ") bType = "waiting";
      if (statusName === "ปิดปรับปรุง") bType = "repair";

      bookData.push({
        houseId: hId,
        checkIn: new Date(b.date_start),
        checkOut: new Date(new Date(b.date_end).getTime() + 86400000),
        bookType: bType,
      });
    }
  }

  // Parse priceHouse -> holiday and promotion
  if ((data as any).priceHouse) {
    const ph = (data as any).priceHouse;
    
    // Parse Holidays
    if (Array.isArray(ph.holiday)) {
      for (const h of ph.holiday) {
        if (!h.date || h.date.length === 0) continue;
        const start = new Date(h.date[0]);
        const end = new Date(h.date[h.date.length - 1]);
        holidayData.push({
          houseId: hId,
          start: start,
          end: new Date(end.getTime() + 86400000), // exclusive end
          type: "holiday",
          price: h.price || 0,
          people: h.accommodate_number || 0,
          alert: h.description || "",
        });
      }
    }
    
    // Parse Promotions
    if (Array.isArray(ph.promotion)) {
      for (const p of ph.promotion) {
        if (!p.date || p.date.length === 0) continue;
        const start = new Date(p.date[0]);
        const end = new Date(p.date[p.date.length - 1]);
        holidayData.push({
          houseId: hId,
          start: start,
          end: new Date(end.getTime() + 86400000), // exclusive end
          type: "hotpro",
          price: p.price || 0,
          people: p.accommodate_number || 0,
          alert: p.description || "",
        });
      }
    }
  }

  if (bookData.length > 0) await prisma.booking.createMany({ data: bookData });
  if (holidayData.length > 0) await prisma.holiday.createMany({ data: holidayData });

  return { bookings: bookData.length + holidayData.length };
}

// ─── Bulk sync (for cron) ─────────────────────────────────────────────────────
export async function runBulkSync(limit = 50): Promise<{
  synced: number;
  totalBookings: number;
  total: number;
}> {
  const remoteHouses = await fetchAllHouses(2000);

  // Auto-delete houses that no longer exist in the source API
  const activeIds = new Set(remoteHouses.map(h => (h.code || "").replace("CITY-", "")));
  const dbHouses = await prisma.house.findMany({
    select: { hId: true, updatedAt: true },
  });

  const toDelete = dbHouses.filter(h => !activeIds.has(h.hId)).map(h => h.hId);
  if (toDelete.length > 0) {
    console.log("Deleting orphaned houses:", toDelete.length);
    try {
      await prisma.basePrice.deleteMany({ where: { houseId: { in: toDelete } } });
      await prisma.booking.deleteMany({ where: { houseId: { in: toDelete } } });
      await prisma.holiday.deleteMany({ where: { houseId: { in: toDelete } } });
      await prisma.houseDetail.deleteMany({ where: { houseId: { in: toDelete } } });
      await prisma.house.deleteMany({ where: { hId: { in: toDelete } } });
    } catch (e) {
      console.error("Error deleting orphaned houses:", e);
    }
  }

  const dbMap = new Map(dbHouses.map((h) => [h.hId, h.updatedAt.getTime()]));

  remoteHouses.sort((a, b) => {
    const aId = (a.code || "").replace("CITY-", "");
    const bId = (b.code || "").replace("CITY-", "");
    return (dbMap.get(aId) || 0) - (dbMap.get(bId) || 0);
  });

  const housesToSync = remoteHouses.slice(0, limit);
  let synced = 0;
  let totalBookings = 0;

  // Process concurrently in batches of 5
  for (let i = 0; i < housesToSync.length; i += 5) {
    const chunk = housesToSync.slice(i, i + 5);
    const results = await Promise.all(chunk.map((rh) => syncOneHouse(rh)));
    for (const r of results) {
      if (r) {
        synced++;
        totalBookings += r.bookings;
      }
    }
  }

  return { synced, totalBookings, total: remoteHouses.length };
}
