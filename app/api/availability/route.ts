// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DayStatus = "booked" | "waiting" | "repair" | "holiday" | "hotpro" | "free";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date    = sp.get("date");
  const year    = sp.get("year");
  const month   = sp.get("month");
  const search  = sp.get("search");           // search by hId
  const page    = parseInt(sp.get("page") || "1");
  const limit   = parseInt(sp.get("limit") || "12");
  const bed     = sp.get("bed") ? parseInt(sp.get("bed")!) : null;
  const maxPrice = sp.get("maxPrice") ? parseInt(sp.get("maxPrice")!) : null;
  const swim    = sp.get("swim");
  const houseId = sp.get("houseId");

  try {
    const totalHouses = await prisma.house.count();
    const lastSyncHouse = await prisma.house.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    const lastSyncAt = lastSyncHouse?.updatedAt?.toISOString() ?? null;

    if (totalHouses === 0) {
      return NextResponse.json(
        { houses: [], dbMode: false, lastSyncAt, total: 0 },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // ── Calendar heatmap (no houses needed) ──────────────────────────────────
    if (year && month) {
      const y = parseInt(year), m = parseInt(month);
      const monthStart = new Date(Date.UTC(y, m - 1, 1));
      const monthEnd   = new Date(Date.UTC(y, m + 2, 0, 23, 59, 59));

      const [bookings, holidays] = await Promise.all([
        prisma.booking.findMany({
          where: {
            checkIn: { lt: monthEnd },
            checkOut: { gt: monthStart },
            ...(houseId ? { houseId } : {}),
          },
          select: { houseId: true, checkIn: true, checkOut: true, bookType: true },
        }),
        prisma.holiday.findMany({
          where: {
            start: { lte: monthEnd },
            end:   { gte: monthStart },
            ...(houseId ? { houseId } : {}),
          },
          select: { houseId: true, start: true, end: true, type: true },
        }),
      ]);

      type DayInfo = { booked: number; waiting: number; repair: number; holiday: number; hotpro: number; free: number; available: number };
      const heatmap: Record<string, DayInfo> = {};
      const houseHeatmap: Record<string, Record<string, DayStatus>> = {};

      const cur = new Date(monthStart);
      while (cur <= monthEnd) {
        const dayStart = new Date(cur);
        const dayEnd   = new Date(cur); dayEnd.setUTCHours(23, 59, 59, 999);
        const key = cur.toISOString().slice(0, 10);

        const dayBookings  = bookings.filter(b => new Date(b.checkIn) < dayEnd && new Date(b.checkOut) > dayStart);
        const dayHolidays  = holidays.filter(h => new Date(h.start) <= dayEnd && new Date(h.end) >= dayStart);

        const bookedSet    = new Set(dayBookings.filter(b => b.bookType === "deville" || b.bookType === "owner").map(b => b.houseId));
        const waitingSet   = new Set(dayBookings.filter(b => b.bookType === "waiting").map(b => b.houseId));
        const repairSet    = new Set(dayBookings.filter(b => b.bookType === "repair").map(b => b.houseId));
        const holidaySet   = new Set(dayHolidays.filter(h => h.type === "holiday").map(h => h.houseId));
        const hotproSet    = new Set(dayHolidays.filter(h => h.type === "hotpro").map(h => h.houseId));
        const unavailable  = new Set([...bookedSet, ...waitingSet, ...repairSet]);
        const available    = totalHouses - unavailable.size;

        heatmap[key] = { booked: bookedSet.size, waiting: waitingSet.size, repair: repairSet.size, holiday: holidaySet.size, hotpro: hotproSet.size, free: available, available };

        for (const hId of bookedSet)  { houseHeatmap[hId] = houseHeatmap[hId] || {}; houseHeatmap[hId][key] = "booked"; }
        for (const hId of waitingSet) { houseHeatmap[hId] = houseHeatmap[hId] || {}; if (!houseHeatmap[hId][key]) houseHeatmap[hId][key] = "waiting"; }
        for (const hId of repairSet)  { houseHeatmap[hId] = houseHeatmap[hId] || {}; if (!houseHeatmap[hId][key]) houseHeatmap[hId][key] = "repair"; }
        for (const hId of hotproSet)  { houseHeatmap[hId] = houseHeatmap[hId] || {}; if (!houseHeatmap[hId][key]) houseHeatmap[hId][key] = "hotpro"; }
        for (const hId of holidaySet) { houseHeatmap[hId] = houseHeatmap[hId] || {}; if (!houseHeatmap[hId][key]) houseHeatmap[hId][key] = "holiday"; }

        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      return NextResponse.json(
        { heatmap, houseHeatmap, totalHouses, dbMode: true, lastSyncAt },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    // ── House list with optional date filter ─────────────────────────────────
    // Build where clause for house filtering
    const houseWhere: any = {};
    if (search) {
      const q = search.replace(/city-?/i, "").trim();
      if (q) houseWhere.hId = { contains: q };
    }
    if (bed) houseWhere.hBedroom = bed;
    if (maxPrice) houseWhere.price = { lte: maxPrice };
    if (swim) houseWhere.swim = swim;

    if (date) {
      // Houses with status on specific date
      const dayStart = new Date(date + "T00:00:00.000Z");
      const dayEnd   = new Date(date + "T23:59:59.999Z");

      const [bookedRows, holidayRows, allHouses] = await Promise.all([
        prisma.booking.findMany({
          where: { checkIn: { lt: dayEnd }, checkOut: { gt: dayStart } },
          select: { houseId: true, bookType: true },
        }),
        prisma.holiday.findMany({
          where: { start: { lte: dayEnd }, end: { gte: dayStart } },
          select: { houseId: true, type: true },
        }),
        prisma.house.findMany({ where: houseWhere, orderBy: { price: "asc" } }),
      ]);

      const statusMap = new Map<string, DayStatus>();
      for (const h of allHouses) statusMap.set(h.hId, "free");
      for (const h of holidayRows) {
        if (h.type === "hotpro") statusMap.set(h.houseId, "hotpro");
        else statusMap.set(h.houseId, "holiday");
      }
      for (const b of bookedRows) {
        if (b.bookType === "waiting") statusMap.set(b.houseId, "waiting");
        else if (b.bookType === "repair") statusMap.set(b.houseId, "repair");
        else statusMap.set(b.houseId, "booked");
      }

      const withStatus = allHouses.map(h => ({ ...h, dayStatus: statusMap.get(h.hId) || "free" }));
      const skip = (page - 1) * limit;
      const paginated = withStatus.slice(skip, skip + limit);

      return NextResponse.json(
        { houses: paginated, dbMode: true, total: allHouses.length, totalHouses, date, lastSyncAt, page, hasMore: skip + limit < allHouses.length },
        { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
      );
    }

    // ── Default: paginated house list ─────────────────────────────────────────
    const total = await prisma.house.count({ where: houseWhere });
    const skip = (page - 1) * limit;

    const houses = await prisma.house.findMany({
      where: houseWhere,
      orderBy: { updatedAt: "desc" },  // Most recently synced first
      skip,
      take: limit,
    });

    return NextResponse.json(
      { houses, dbMode: true, total, totalHouses, lastSyncAt, page, hasMore: skip + limit < total },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
    );

  } catch (err) {
    console.error("[availability] DB error:", err);
    return NextResponse.json(
      { houses: [], dbMode: false, lastSyncAt: null, total: 0, error: String(err) },
      { status: 500 }
    );
  }
}
