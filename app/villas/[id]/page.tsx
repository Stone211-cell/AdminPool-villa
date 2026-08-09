import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { syncHouseCalendar } from "@/lib/services/sync.service";
import { VillaClientView } from "@/components/VillaClientView";

export default async function VillaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const house = await prisma.house.findUnique({
    where: { hId: id.replace('BT-', '') },
    include: { detail: true }
  });

  if (!house) {
    notFound();
  }

  // โหลดข้อมูลบ้านหลังบ้าน background — ไม่ทำให้หน้าช้า ราคา/ปฏิทินจะอัปเดตในครั้งถัดไปที่เปิดหน้า
  const houseId = house.hId;
  after(async () => {
    try {
      await syncHouseCalendar(houseId);
    } catch (e) {
      // background sync fail ไม่กระทบหน้าเว็บ
    }
  });

  // Similar houses
  const similarHouses = await prisma.house.findMany({
    where: { 
      id: { not: house.id },
      hZone: house.hZone 
    },
    take: 3
  });

  return <VillaClientView house={house} similarHouses={similarHouses} />;
}

