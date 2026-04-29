// app/api/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchHouses } from "@/lib/api/houses";

export const dynamic = "force-dynamic";

// สถานะวัน (เหมือนต้นฉบับ)
// "booked"  = ติดจอง (deville, owner)
// "waiting" = รอโอน
// "repair"  = ปิดซ่อม
// "holiday" = วันหยุด
// "hotpro"  = โปรโมชั่น
// "free"    = ว่าง

type DayStatus = "booked" | "waiting" | "repair" | "holiday" | "hotpro" | "free";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date  = searchParams.get("date");
  const year  = searchParams.get("year");
  const month = searchParams.get("month");
  const houseId = searchParams.get("houseId");

  try {
    const totalHouses = await prisma.house.count();

    // ── Fallback ─────────────────────────────────────────────────────────────
    if (totalHouses === 0) {
      const houses = await fetchHouses();
      return NextResponse.json({ houses, dbMode: false });
    }

    // ── Calendar heatmap ──────────────────────────────────────────────────────
    if (year && month) {
      const y = parseInt(year), m = parseInt(month);
      const monthStart = new Date(Date.UTC(y, m - 1, 1));
      const monthEnd   = new Date(Date.UTC(y, m, 0, 23, 59, 59));

      // ดึง bookings และ holidays ทั้งหมดในเดือน
      const [bookings, holidays] = await Promise.all([
        prisma.booking.findMany({
          where: { checkIn: { lt: monthEnd }, checkOut: { gt: monthStart }, ...(houseId ? { houseId } : {}) },
          select: { houseId: true, checkIn: true, checkOut: true, bookType: true },
        }),
        prisma.holiday.findMany({
          where: { start: { lte: monthEnd }, end: { gte: monthStart }, ...(houseId ? { houseId } : {}) },
          select: { houseId: true, start: true, end: true, type: true },
        }),
      ]);

      // สร้าง dayStatus: { "2026-05-01": { booked:5, waiting:1, repair:2, holiday:3, hotpro:2, free:83 } }
      const heatmap: Record<string, { booked: number; waiting: number; repair: number; holiday: number; hotpro: number; free: number; available: number }> = {};

      const cur = new Date(monthStart);
      while (cur <= monthEnd) {
        const dayStart = new Date(cur);
        const dayEnd   = new Date(cur); dayEnd.setUTCHours(23, 59, 59, 999);
        const key = cur.toISOString().slice(0, 10);

        // Booking statuses for this day (per house)
        const dayBookings = bookings.filter(b =>
          new Date(b.checkIn) < dayEnd && new Date(b.checkOut) > dayStart
        );
        const dayHolidays = holidays.filter(h =>
          new Date(h.start) <= dayEnd && new Date(h.end) >= dayStart
        );

        const bookedSet   = new Set(dayBookings.filter(b => b.bookType === "deville" || b.bookType === "owner").map(b => b.houseId));
        const waitingSet  = new Set(dayBookings.filter(b => b.bookType === "waiting").map(b => b.houseId));
        const repairSet   = new Set(dayBookings.filter(b => b.bookType === "repair").map(b => b.houseId));
        const holidaySet  = new Set(dayHolidays.filter(h => h.type === "holiday").map(h => h.houseId));
        const hotproSet   = new Set(dayHolidays.filter(h => h.type === "hotpro").map(h => h.houseId));

        const unavailable = new Set([...bookedSet, ...waitingSet, ...repairSet]);
        const available = totalHouses - unavailable.size;

        heatmap[key] = {
          booked:  bookedSet.size,
          waiting: waitingSet.size,
          repair:  repairSet.size,
          holiday: holidaySet.size,
          hotpro:  hotproSet.size,
          free:    available,
          available,
        };

        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      return NextResponse.json({ heatmap, totalHouses, dbMode: true });
    }

    // ── บ้านว่างในวันที่ระบุ ──────────────────────────────────────────────────
    if (date) {
      const dayStart = new Date(date + "T00:00:00.000Z");
      const dayEnd   = new Date(date + "T23:59:59.999Z");

      const [bookedRows, holidayRows] = await Promise.all([
        prisma.booking.findMany({
          where: { checkIn: { lt: dayEnd }, checkOut: { gt: dayStart } },
          select: { houseId: true, bookType: true },
        }),
        prisma.holiday.findMany({
          where: { start: { lte: dayEnd }, end: { gte: dayStart } },
          select: { houseId: true, type: true },
        }),
      ]);

      const houses = await prisma.house.findMany({
        include: { detail: true },
        orderBy: { price: "asc" },
      });

      // Map statuses
      const houseStatusMap = new Map<string, DayStatus>();
      for (const h of houses) houseStatusMap.set(h.hId, "free");

      for (const h of holidayRows) {
        if (h.type === "hotpro") houseStatusMap.set(h.houseId, "hotpro");
        else houseStatusMap.set(h.houseId, "holiday");
      }
      for (const b of bookedRows) {
        if (b.bookType === "waiting") houseStatusMap.set(b.houseId, "waiting");
        else if (b.bookType === "repair") houseStatusMap.set(b.houseId, "repair");
        else houseStatusMap.set(b.houseId, "booked"); // deville, owner
      }

      const housesWithStatus = houses.map(h => ({
        ...h,
        dayStatus: houseStatusMap.get(h.hId) || "free"
      }));

      return NextResponse.json({
        houses: housesWithStatus,
        dbMode: true,
        total: houses.length,
        date,
      });
    }

    // ── บ้านทั้งหมด ───────────────────────────────────────────────────────────
    const houses = await prisma.house.findMany({
      include: { detail: true },
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ houses, dbMode: true });

  } catch (err) {
    console.error("[availability] DB error, fallback:", err);
    const houses = await fetchHouses();
    return NextResponse.json({ houses, dbMode: false });
  }
}
