import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { pushLineToAdmin } from "@/lib/line/notify";

const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID || "";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { houseId, checkIn, checkOut, adult, child, pet, totalPrice, name, phone, email, note } = data;

    // Generate ref code
    const refCode = "BK-" + Math.floor(10000 + Math.random() * 90000);
    
    const dummyLineUserId = "WEB-" + refCode;
    
    // Ensure dummy lineUser exists
    await prisma.lineUser.upsert({
      where: { lineUserId: dummyLineUserId },
      update: {},
      create: {
        lineUserId: dummyLineUserId,
        displayName: "Web Booking " + refCode,
        pictureUrl: "",
      }
    });

    // Create booking request
    await prisma.lineBookingRequest.create({
      data: {
        lineUserId: dummyLineUserId,
        houseId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: adult + child,
        totalPrice,
        phone,
        firstName: name,
        notes: `อีเมล: ${email || '-'}, สัตว์เลี้ยง: ${pet}, หมายเหตุ: ${note || '-'}`
      }
    });

    // Push notification to admin LINE immediately
    await pushLineToAdmin(refCode, { houseId, checkIn, checkOut, adult, child, pet, totalPrice, name, phone, email: email || "", note: note || "" });

    return NextResponse.json({ success: true, refCode, adminNotified: !!ADMIN_LINE_USER_ID });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
