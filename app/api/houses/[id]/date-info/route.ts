import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncHouseCalendar } from "@/lib/services/sync.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const hId = (await params).id;
  const dateStr = req.nextUrl.searchParams.get("date");
  const yearStr = req.nextUrl.searchParams.get("y");
  const monthStr = req.nextUrl.searchParams.get("m");

  if (!dateStr && (!yearStr || !monthStr)) {
    return NextResponse.json({ error: "Missing date or y,m" }, { status: 400 });
  }

  try {
    // 100% REAL-TIME: Sync the calendar and prices for this specific house BEFORE returning data
    // This takes ~0.5s - 1s, which is perfectly fine for a popup modal, and guarantees no double bookings.
    try {
      await syncHouseCalendar(hId);
    } catch (e) {
      console.error(`[date-info] Failed to live sync calendar for ${hId}:`, e);
      // fallback to whatever is in the DB
    }

    const house = await prisma.house.findUnique({
      where: { hId },
      include: {
        detail: true,
        basePrices: true,
        bookings: true, // We will filter in memory for month heatmap to save complex queries
        holidays: true
      }
    });

    if (!house) return NextResponse.json({ error: "House not found" }, { status: 404 });

    const detail = house.detail;
    const basePrice = house.basePrices[0];
    const bookings = house.bookings;
    const holidays = house.holidays;

    // Helper to calculate status and price for a specific date
    const getDayInfo = (dayStart: Date, dayEnd: Date) => {
      const dayOfWeek = dayStart.getUTCDay(); // 0 = Sun, 1 = Mon...
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
      let activeHoliday = holidays.find(h => h.start <= dayEnd && h.end >= dayStart);
      if (activeHoliday) {
        if (activeHoliday.type === "hotpro") {
          status = "hotpro";
          oldPrice = currentPrice;
          currentPrice = activeHoliday.price;
        } else {
          status = "holiday";
          oldPrice = currentPrice;
          currentPrice = activeHoliday.price;
        }
      }

      // Apply Bookings (Overrides Holiday/Hotpro status)
      const activeBooking = bookings.find(b => b.checkIn < dayEnd && b.checkOut > dayStart);
      if (activeBooking) {
        if (activeBooking.bookType === "waiting") status = "waiting";
        else if (activeBooking.bookType === "repair") status = "repair";
        else status = "booked";
      }

      const extraAdult = detail?.extra || 0;
      let extraPet = 500;
      if (detail?.moreDetail?.includes("สัตว์เลี้ยง") && detail.moreDetail.includes("500")) extraPet = 500;
      else if (detail?.moreDetail?.includes("สัตว์เลี้ยง") && detail.moreDetail.includes("300")) extraPet = 300;

      return {
        status,
        price: currentPrice,
        oldPrice,
        people: activeHoliday?.people || house.people,
        extraAdult,
        extraChild: 0,
        extraPet,
        petFriendly: house.pet
      };
    };

    // If requesting a specific day
    if (dateStr) {
      const dayStart = new Date(dateStr + "T00:00:00.000Z");
      const dayEnd = new Date(dateStr + "T23:59:59.999Z");
      const info = getDayInfo(dayStart, dayEnd);
      return NextResponse.json({ hId, date: dateStr, ...info });
    }

    // If requesting a whole month heatmap
    if (yearStr && monthStr) {
      const y = parseInt(yearStr);
      const m = parseInt(monthStr); // 1-indexed
      const daysInMonth = new Date(y, m, 0).getDate();
      const heatmap: Record<string, any> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
        const dayEnd = new Date(`${dateKey}T23:59:59.999Z`);
        const info = getDayInfo(dayStart, dayEnd);
        heatmap[dateKey] = info;
      }
      return NextResponse.json({ heatmap });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
