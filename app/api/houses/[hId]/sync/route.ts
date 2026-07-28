// app/api/houses/[hId]/sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// API endpoint สำหรับปุ่ม "อัพเดทก่อนดู" รายบ้าน
// ไม่ต้องมี auth เพราะเป็น internal call จาก Admin UI
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { syncOneHouse } from "@/lib/services/sync.service";
import { fetchAllHouses } from "@/lib/external/poolvilla.api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ hId: string }> }
) {
  const { hId } = await params;
  if (!hId) {
    return NextResponse.json({ error: "ไม่ระบุ hId" }, { status: 400 });
  }

  try {
    // ดึงรายการบ้านเพื่อหา RemoteHouse object (มี thumbnail/price)
    const allHouses = await fetchAllHouses(2000);
    const rh = allHouses.find(
      (h) => h.code === `CITY-${hId}` || h.code === hId
    );

    if (!rh) {
      return NextResponse.json(
        { error: `ไม่พบบ้าน CITY-${hId} ใน API` },
        { status: 404 }
      );
    }

    const result = await syncOneHouse(rh);

    return NextResponse.json({
      success: true,
      hId,
      bookings: result?.bookings ?? 0,
    });
  } catch (error: any) {
    console.error(`[houses/${hId}/sync] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
