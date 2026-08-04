// app/api/liff/booking/route.ts
// สร้างคำขอจองจาก LIFF + ส่ง Flex Message เข้า LINE chat
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBookingFlexMessage } from "@/lib/line/flex-message";

export const dynamic = "force-dynamic";

// คำนวณราคาจาก BasePrice ของบ้าน
function calcPrice(basePrices: any, checkIn: Date, checkOut: Date): number {
  if (!basePrices) return 0;
  const dayNames: (keyof typeof basePrices)[] = ["priceSun", "priceMon", "priceTue", "priceWed", "priceThu", "priceFri", "priceSat"];
  let total = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    const dayIdx = cur.getUTCDay(); // 0=Sun, 6=Sat
    total += basePrices[dayNames[dayIdx]] || 0;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return total;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lineUserId, houseId, checkIn, checkOut, guests, firstName, lastName, phone, notes } = body;

    if (!lineUserId || !houseId || !checkIn || !checkOut || !phone) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ (lineUserId, houseId, checkIn, checkOut, phone)" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000);

    if (nights <= 0) {
      return NextResponse.json({ error: "วันเช็คเอาท์ต้องหลังเช็คอิน" }, { status: 400 });
    }

    // ดึงข้อมูลบ้าน + ราคา
    const house = await prisma.house.findUnique({
      where: { hId: houseId },
      include: { basePrices: true, detail: true },
    });

    if (!house) {
      return NextResponse.json({ error: "ไม่พบข้อมูลบ้าน" }, { status: 404 });
    }

    // คำนวณราคา (ใช้ BasePrice ถ้ามี, ไม่งั้นใช้ราคาหลัก × คืน)
    const bp = house.basePrices[0] ?? null;
    const totalPrice = bp ? calcPrice(bp, checkInDate, checkOutDate) : house.price * nights;

    // บันทึก LineUser (upsert ข้อมูลล่าสุด)
    await prisma.lineUser.upsert({
      where: { lineUserId },
      create: { lineUserId, phone, firstName: firstName || "", lastName: lastName || "" },
      update: { phone, ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}) },
    });

    // สร้าง booking request
    const booking = await prisma.lineBookingRequest.create({
      data: {
        lineUserId,
        houseId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
        totalPrice,
        phone,
        firstName: firstName || "",
        lastName: lastName || "",
        notes: notes || "",
        status: "pending",
      },
    });

    // ดึง LINE user profile (รูปโปรไฟล์)
    const lineUser = await prisma.lineUser.findUnique({ where: { lineUserId } });

    // สร้าง Flex Message
    const flexMsg = createBookingFlexMessage({
      houseId,
      houseName: `BT-${houseId}`,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || 1,
      firstName: firstName || "",
      lastName: lastName || "",
      phone,
      totalPrice,
      nights,
      bookingId: booking.id,
      pictureUrl: lineUser?.pictureUrl || undefined,
    });

    // ส่ง Flex Message เข้า LINE chat ระหว่างลูกค้ากับ OA
    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (accessToken) {
      try {
        // Push message ไปหาลูกค้า (ลูกค้าจะเห็น card ในแชทกับ OA)
        const pushRes = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: lineUserId,
            messages: [flexMsg],
          }),
        });

        if (!pushRes.ok) {
          const errText = await pushRes.text();
          console.error("[liff/booking] LINE push error:", errText);
        } else {
          console.log("[liff/booking] Flex Message sent to:", lineUserId);
        }
      } catch (lineErr) {
        console.error("[liff/booking] LINE API error:", lineErr);
        // ไม่ fail ทั้ง request ถ้าส่ง LINE ไม่ได้
      }
    } else {
      console.warn("[liff/booking] LINE_CHANNEL_ACCESS_TOKEN not set");
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        houseId,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        nights,
        totalPrice,
        status: booking.status,
      },
    });
  } catch (err: any) {
    console.error("[liff/booking] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
