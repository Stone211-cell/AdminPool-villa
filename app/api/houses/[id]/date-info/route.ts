import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hId = (await params).id;
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) return NextResponse.json({ error: "Missing date" }, { status: 400 });

  try {
    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayEnd = new Date(dateStr + "T23:59:59.999Z");
    const dayOfWeek = dayStart.getUTCDay(); // 0 = Sun, 1 = Mon...

    const [house, detail, basePrice, bookings, holidays] = await Promise.all([
      prisma.house.findUnique({ where: { hId } }),
      prisma.houseDetail.findUnique({ where: { houseId: hId } }),
      prisma.basePrice.findUnique({ where: { houseId: hId } }),
      prisma.booking.findMany({ where: { houseId: hId, checkIn: { lt: dayEnd }, checkOut: { gt: dayStart } } }),
      prisma.holiday.findMany({ where: { houseId: hId, start: { lte: dayEnd }, end: { gte: dayStart } } })
    ]);

    if (!house) return NextResponse.json({ error: "House not found" }, { status: 404 });

    // Determine Status
    let status = "free";
    let currentPrice = house.price;
    let oldPrice = null;

    // Calculate Base Price for the day
    if (basePrice) {
      const prices = [
        basePrice.priceSun, basePrice.priceMon, basePrice.priceTue,
        basePrice.priceWed, basePrice.priceThu, basePrice.priceFri, basePrice.priceSat
      ];
      if (prices[dayOfWeek] > 0) currentPrice = prices[dayOfWeek];
    }

    // Apply Holiday / Hotpro
    let activeHoliday = null;
    if (holidays.length > 0) {
      activeHoliday = holidays[0]; // Take first match
      if (activeHoliday.type === "hotpro") {
        status = "hotpro";
        oldPrice = currentPrice;
        currentPrice = activeHoliday.price;
      } else {
        status = "holiday";
        currentPrice = activeHoliday.price;
      }
    }

    // Apply Bookings (Overrides Holiday/Hotpro status)
    if (bookings.length > 0) {
      const b = bookings[0];
      if (b.bookType === "waiting") status = "waiting";
      else if (b.bookType === "repair") status = "repair";
      else status = "booked";
    }

    // Parse extra info
    const extraAdult = detail?.extra || 0;
    const extraChild = 0; // Usually 0 or not strictly structured
    let extraPet = 500; // Default or parse from moreDetail
    if (detail?.moreDetail?.includes("สัตว์เลี้ยง") && detail.moreDetail.includes("500")) extraPet = 500;
    else if (detail?.moreDetail?.includes("สัตว์เลี้ยง") && detail.moreDetail.includes("300")) extraPet = 300;

    return NextResponse.json({
      hId,
      date: dateStr,
      status,
      price: currentPrice,
      oldPrice,
      people: activeHoliday?.people || house.people,
      extraAdult,
      extraChild,
      extraPet,
      petFriendly: house.pet
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
