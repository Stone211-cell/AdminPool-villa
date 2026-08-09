import axios from "axios";

const ADMIN_LINE_USER_ID = process.env.ADMIN_LINE_USER_ID || "";
const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

export async function pushLineToAdmin(refCode: string, data: {
  houseId: string;
  checkIn: string | Date;
  checkOut: string | Date;
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
  
  const message = `🏡 คำขอจองใหม่! (${refCode.startsWith("LIFF") ? "มือถือ/LINE" : "เว็บ"})\n━━━━━━━━━━━━━━━━━━\n📌 รหัส: ${refCode}\n🏠 บ้านพัก: BT-${data.houseId}\n\n👤 ลูกค้า: ${data.name}\n📞 โทร: ${data.phone}\n📧 อีเมล: ${data.email || "-"}\n\n📅 เช็คอิน: ${checkInDate}\n📅 เช็คเอาท์: ${checkOutDate}\n🌙 จำนวน: ${nights} คืน\n👥 ผู้ใหญ่ ${data.adult} เด็ก ${data.child} สัตว์เลี้ยง ${data.pet}\n\n💰 ราคารวม: ${data.totalPrice.toLocaleString()} บาท\n💵 มัดจำ 60%: ${deposit.toLocaleString()} บาท\n\n📝 หมายเหตุ: ${data.note || "-"}\n━━━━━━━━━━━━━━━━━━\n⚡ ติดต่อลูกค้ากลับด่วน!`;

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
