// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchHouses } from "@/lib/api/houses";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");       // YYYY-MM-DD → houses available
  const year = searchParams.get("year");       // + month → calendar heatmap
  const month = searchParams.get("month");

  try {
    const totalHouses = await prisma.house.count();

    // ── No DB data → fallback to external list ──────────────────────────────
    if (totalHouses === 0) {
      const houses = await fetchHouses();
      return NextResponse.json({ houses, dbMode: false });
    }

    // ── Calendar heatmap for a month ─────────────────────────────────────────
    if (year && month) {
      const y = parseInt(year), m = parseInt(month);
      const start = new Date(y, m - 1, 1);
      const end   = new Date(y, m, 0, 23, 59, 59);

      const bookings = await prisma.booking.findMany({
        where: { checkIn: { lte: end }, checkOut: { gte: start } },
        select: { checkIn: true, checkOut: true },
      });

      const heatmap: Record<string, number> = {};
      const cur = new Date(start);
      while (cur <= end) {
        const key = cur.toISOString().slice(0, 10);
        const booked = bookings.filter(
          (b) => new Date(b.checkIn) <= cur && new Date(b.checkOut) > cur
        ).length;
        heatmap[key] = totalHouses - booked;
        cur.setDate(cur.getDate() + 1);
      }
      return NextResponse.json({ heatmap, totalHouses, dbMode: true });
    }

    // ── Available houses for a specific date ──────────────────────────────────
    if (date) {
      const d = new Date(date);
      const next = new Date(date);
      next.setDate(next.getDate() + 1);

      const booked = await prisma.booking.findMany({
        where: { checkIn: { lt: next }, checkOut: { gt: d } },
        select: { houseId: true },
      });
      const bookedIds = booked.map((b) => b.houseId);

      const houses = await prisma.house.findMany({
        where: { hId: { notIn: bookedIds } },
        include: { detail: true },
        orderBy: { price: "asc" },
      });
      return NextResponse.json({ houses, dbMode: true, total: houses.length });
    }

    // ── All houses ────────────────────────────────────────────────────────────
    const houses = await prisma.house.findMany({
      include: { detail: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ houses, dbMode: true });
  } catch {
    // DB unavailable → external fallback
    const houses = await fetchHouses();
    return NextResponse.json({ houses, dbMode: false });
  }
}
