import { prisma } from '../lib/prisma';
import axios from 'axios';

const API_BASE = "https://api.poolvillacity.co.th/next-villapaza/api";

async function main() {
  console.log("Fetching all houses...");
  const res = await axios.post(`${API_BASE}/customer/house/filter?offset=0&limit=2000`, {});
  const remoteHouses = res.data?.results || [];
  console.log(`Found ${remoteHouses.length} houses. Syncing...`);

  let count = 0;
  
  // Fetch existing houses to skip recently synced ones (resume capability)
  const dbHouses = await prisma.house.findMany({ select: { hId: true, updatedAt: true } });
  const recentSyncMap = new Map();
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  dbHouses.forEach(h => {
    if (now - h.updatedAt.getTime() < ONE_HOUR) {
      recentSyncMap.set(h.hId, true);
    }
  });

  for (const rh of remoteHouses) {
    try {
      const hId = (rh.code || "").replace("CITY-", "");
      if (!hId) continue;

      if (recentSyncMap.has(hId)) {
        count++;
        console.log(`[${count}/${remoteHouses.length}] Skipped CITY-${hId} (Already synced recently)`);
        continue;
      }

      const detailRes = await axios.get(`${API_BASE}/customer/house/info/CITY-${hId}`, { timeout: 15000 });
      const data = detailRes.data?.result;
      if (!data || !data.house) continue;

      const h = data.house;
      const facs = Array.isArray(h.facilities) ? h.facilities : [];
      const hasFac = (name: string) => facs.some((f: any) => f.name_th?.includes(name) || f.name_en?.toLowerCase().includes(name.toLowerCase()));

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

      await prisma.booking.deleteMany({ where: { houseId: hId } });
      await prisma.holiday.deleteMany({ where: { houseId: hId } });

      const books = Array.isArray(data.book) ? data.book : [];
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
          let bType = "deville";
          if (statusName === "รอชำระ") bType = "waiting";
          if (statusName === "ปิดปรับปรุง") bType = "repair";
          
          await prisma.booking.create({
            data: {
              houseId: hId,
              checkIn: new Date(b.date_start),
              checkOut: new Date(new Date(b.date_end).getTime() + 86400000),
              bookType: bType
            }
          });
        }
      }
      
      count++;
      console.log(`[${count}/${remoteHouses.length}] Synced CITY-${hId} successfully. (${books.length} bookings)`);
    } catch (err: any) {
      console.error(`Error syncing house ${rh.code}:`, err.message);
    }
  }
}

main().then(() => console.log("Done")).catch(console.error).finally(() => process.exit(0));
