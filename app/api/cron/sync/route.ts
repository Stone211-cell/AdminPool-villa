// app/api/cron/sync/route.ts
// Vercel Cron Job — sync ข้อมูลบ้านและการจองจาก poolvillacity.co.th
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const API_BASE = "https://api.poolvillacity.co.th/next-villapaza/api";

// ── Shared sync logic ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  return runSync(req);
}

export async function GET(req: NextRequest) {
  return runSync(req);
}

async function runSync(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.method !== "POST") {
    const auth = req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const targetHouseId = req.nextUrl.searchParams.get("houseId");

  try {
    // 1. Fetch all houses from new API
    console.log("[cron/sync] Fetching all houses from new API...");
    const res = await axios.post(`${API_BASE}/customer/house/filter?offset=0&limit=1000`, {}, { timeout: 30000 });
    let remoteHouses: any[] = res.data?.results || [];

    // Filter to single house if requested
    if (targetHouseId) {
      remoteHouses = remoteHouses.filter(h => h.code === `CITY-${targetHouseId}` || h.code === targetHouseId);
      if (remoteHouses.length === 0) {
        return NextResponse.json({ error: "ไม่พบบ้านหลังนี้" }, { status: 404 });
      }
    }

    // Prepare limit (increase to 50 to sync all current houses at once)
    const LIMIT = targetHouseId ? 1 : 50;
    
    // Check DB modified
    const dbHouses = await prisma.house.findMany({ select: { hId: true, updatedAt: true } });
    const dbHouseMap = new Map(dbHouses.map(h => [h.hId, h]));

    // Sort: new houses first, then oldest updated
    remoteHouses.sort((a, b) => {
      const aId = (a.code || "").replace("CITY-", "");
      const bId = (b.code || "").replace("CITY-", "");
      const aTime = dbHouseMap.get(aId)?.updatedAt.getTime() || 0;
      const bTime = dbHouseMap.get(bId)?.updatedAt.getTime() || 0;
      return aTime - bTime;
    });

    const housesToSync = remoteHouses.slice(0, LIMIT);
    console.log(`[cron/sync] Selected ${housesToSync.length} houses to sync`);

    let synced = 0;
    let totalBookings = 0;

    // Process houses in batches of 5 concurrently to speed up
    const concurrency = 5;
    for (let i = 0; i < housesToSync.length; i += concurrency) {
      const chunk = housesToSync.slice(i, i + concurrency);
      
      await Promise.all(chunk.map(async (rh) => {
        try {
          const hId = (rh.code || "").replace("CITY-", "");
          if (!hId) return;

          // Fetch details & bookings
          const detailRes = await axios.get(`${API_BASE}/customer/house/info/CITY-${hId}`, { timeout: 15000 });
          const data = detailRes.data?.result;
          if (!data || !data.house) return;

          const h = data.house;
          const facs = Array.isArray(h.facilities) ? h.facilities : [];
          const hasFac = (name: string) => facs.some((f: any) => f.name_th?.includes(name) || f.name_en?.toLowerCase().includes(name.toLowerCase()));

          // Upsert house
          const houseData = {
            hId: hId,
            hZone: h.district || "pattaya",
            hBedroom: h.number_of_bedrooms || 0,
            hToilet: h.number_of_bathrooms || 0,
            hFarsea: "",
            price: parseInt(rh.price_house?.[0]?.every_day?.[0]?.price || 0),
            people: h.accommodate_number || 0,
            imgName: rh.thumbnail?.[0] ? `https://sgp1.digitaloceanspaces.com/villapaza-spaces${rh.thumbnail[0]}` : "",
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
            update: houseData
          });

          // Upsert house details
          const detailData = {
            houseId: hId,
            checkin: h.check_in_time || "14:00",
            checkout: h.check_out_time || "12:00",
            extra: h.additional_stay_information?.extra_per_person || 0,
            insurance: h.additional_stay_information?.damage_insurance || 0,
            peopleMax: h.accommodate_number || 0,
            location: h.location?.name || "",
            sea: "", parking: "", kitchen: "", additionalCosts: "",
            moreDetail: h.detail || "",
            bedroomDetail: "",
            alert: h.additional_stay_information?.service || "",
          };
          await prisma.houseDetail.upsert({
            where: { houseId: hId },
            create: detailData,
            update: detailData
          });

          // Parse bookings
          await prisma.booking.deleteMany({ where: { houseId: hId } });
          await prisma.holiday.deleteMany({ where: { houseId: hId } });

          const books = Array.isArray(data.book) ? data.book : [];
          let bCount = 0;

          for (const b of books) {
            if (!b.date_start || !b.date_end) continue;
            const statusName = b.status?.name_th || "";
            
            if (statusName === "เทศกาล" || statusName === "ลดราคา" || statusName === "โปรโมชั่น") {
              const hType = statusName === "เทศกาล" ? "holiday" : "hotpro";
              await prisma.holiday.create({
                data: {
                  houseId: hId,
                  start: new Date(b.date_start),
                  end: new Date(b.date_end),
                  type: hType,
                  price: 0,
                  people: 0,
                  alert: ""
                }
              });
            } else {
              let bType = "deville"; // default for booked
              if (statusName === "รอชำระ") bType = "waiting";
              if (statusName === "ปิดปรับปรุง") bType = "repair";
              
              await prisma.booking.create({
                data: {
                  houseId: hId,
                  checkIn: new Date(b.date_start),
                  checkOut: new Date(new Date(b.date_end).getTime() + 86400000), // add 1 day to make it exclusive if it's a single day
                  bookType: bType
                }
              });
              bCount++;
            }
          }

          synced++;
          totalBookings += bCount;
        } catch (err: any) {
          console.error(`[cron/sync] Error syncing house ${rh.code}:`, err.message);
        }
      }));
    }

    return NextResponse.json({
      success: true,
      synced,
      totalBookings,
      total: remoteHouses.length
    });

  } catch (error: any) {
    console.error("[cron/sync] Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
