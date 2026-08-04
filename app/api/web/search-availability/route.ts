import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const checkIn = sp.get("checkIn");
  const checkOut = sp.get("checkOut");

  if (!checkIn || !checkOut) {
    return NextResponse.json({ success: false, error: "Missing dates" }, { status: 400 });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  try {
    // หาการจองที่ทับซ้อนกับช่วงเวลาที่ลูกค้าเลือก
    const bookings = await prisma.booking.findMany({
      where: {
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { houseId: true }
    });

    const unavailableHouseIds = new Set(bookings.map(b => b.houseId));

    return NextResponse.json({
      success: true,
      unavailableHouseIds: Array.from(unavailableHouseIds)
    });
  } catch (error) {
    console.error("Search Availability Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
