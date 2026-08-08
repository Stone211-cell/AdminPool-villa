import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID || "";
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

async function pushLineToAdmin(refCode: string, data: {
  houseId: string;
  checkIn: string;
  checkOut: string;
  name: string;
  phone: string;
  email: string;
  adult: number;
  child: number;
  pet: number;
  totalPrice: number;
  note: string;
}) {
  if (!ADMIN_LINE_USER_ID || !LINE_TOKEN) return;
  
  const checkInDate = new Date(data.checkIn).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const checkOutDate = new Date(data.checkOut).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  const diffTime = Math.abs(new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const deposit = Math.ceil((data.totalPrice * 0.6) / 100) * 100;
  
  const message = `🏡 คำขอจองใหม่! (เว็บ)\n━━━━━━━━━━━━━━━━━━\n📌 รหัส: ${refCode}\n🏠 บ้านพัก: BT-${data.houseId}\n\n👤 ลูกค้า: ${data.name}\n📞 โทร: ${data.phone}\n📧 อีเมล: ${data.email || "-"}\n\n📅 เช็คอิน: ${checkInDate}\n📅 เช็คเอาท์: ${checkOutDate}\n🌙 จำนวน: ${nights} คืน\n👥 ผู้ใหญ่ ${data.adult} เด็ก ${data.child} สัตว์เลี้ยง ${data.pet}\n\n💰 ราคารวม: ${data.totalPrice.toLocaleString()} บาท\n💵 มัดจำ 60%: ${deposit.toLocaleString()} บาท\n\n📝 หมายเหตุ: ${data.note || "-"}\n━━━━━━━━━━━━━━━━━━\n⚡ ติดต่อลูกค้ากลับด่วน!`;

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      { to: ADMIN_LINE_USER_ID, messages: [{ type: "text", text: message }] },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_TOKEN}` } }
    );
  } catch (err: any) {
    console.error("Failed to push LINE to admin:", err.response?.data || err.message);
  }
}

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
