// lib/line/flex-message.ts
// สร้าง LINE Flex Message card สำหรับการ์ดสรุปการจอง

export interface BookingCardData {
  houseId: string;
  houseName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  firstName: string;
  lastName: string;
  phone: string;
  totalPrice: number;
  nights: number;
  bookingId: string;
  pictureUrl?: string;
}

function formatThaiDate(date: Date): string {
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const d = new Date(date);
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString("th-TH") + " บาท";
}

export function createBookingFlexMessage(data: BookingCardData) {
  const fullName = `${data.firstName} ${data.lastName}`.trim() || "ลูกค้า";
  const checkInStr = formatThaiDate(data.checkIn);
  const checkOutStr = formatThaiDate(data.checkOut);
  const priceStr = formatPrice(data.totalPrice);

  return {
    type: "flex",
    altText: `📋 คำขอจองพูลวิลล่า BT-${data.houseId} | ${checkInStr} - ${checkOutStr} | ${priceStr}`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a1a2e",
        paddingAll: "20px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "🏡 คำขอจองพูลวิลล่า",
                    color: "#7c8ef7",
                    size: "xs",
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: `BT-${data.houseId}`,
                    color: "#ffffff",
                    size: "xl",
                    weight: "bold",
                    margin: "sm",
                  },
                ],
                flex: 3,
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "รอยืนยัน",
                    color: "#ffc107",
                    size: "sm",
                    weight: "bold",
                    align: "end",
                  },
                ],
                flex: 1,
              },
            ],
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#ffffff",
        paddingAll: "20px",
        spacing: "md",
        contents: [
          // ชื่อลูกค้า + รูปโปรไฟล์
          {
            type: "box",
            layout: "horizontal",
            contents: [
              ...(data.pictureUrl ? [{
                type: "image",
                url: data.pictureUrl,
                size: "50px",
                aspectMode: "cover",
                aspectRatio: "1:1",
                flex: 0,
                cornerRadius: "25px",
              }] : []),
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: fullName,
                    weight: "bold",
                    size: "lg",
                    color: "#1a1a2e",
                  },
                  {
                    type: "text",
                    text: `📞 ${data.phone}`,
                    size: "sm",
                    color: "#555555",
                    margin: "xs",
                  },
                ],
                justifyContent: "center",
                ...(data.pictureUrl ? { margin: "md" } : {}),
              },
            ],
            alignItems: "center",
          },
          {
            type: "separator",
            margin: "md",
          },
          // วันเช็คอิน / เช็คเอาท์
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "เช็คอิน",
                    size: "xs",
                    color: "#888888",
                  },
                  {
                    type: "text",
                    text: checkInStr,
                    weight: "bold",
                    size: "sm",
                    color: "#1a1a2e",
                    margin: "xs",
                  },
                  {
                    type: "text",
                    text: "14:00 น.",
                    size: "xs",
                    color: "#888888",
                  },
                ],
              },
              {
                type: "text",
                text: "→",
                size: "xl",
                color: "#7c8ef7",
                align: "center",
                flex: 0,
                gravity: "center",
              },
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "เช็คเอาท์",
                    size: "xs",
                    color: "#888888",
                    align: "end",
                  },
                  {
                    type: "text",
                    text: checkOutStr,
                    weight: "bold",
                    size: "sm",
                    color: "#1a1a2e",
                    margin: "xs",
                    align: "end",
                  },
                  {
                    type: "text",
                    text: "12:00 น.",
                    size: "xs",
                    color: "#888888",
                    align: "end",
                  },
                ],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          // รายละเอียดการจอง
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "🌙 จำนวนคืน", size: "sm", color: "#555555", flex: 2 },
                  { type: "text", text: `${data.nights} คืน`, size: "sm", color: "#1a1a2e", weight: "bold", align: "end", flex: 1 },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "👥 จำนวนแขก", size: "sm", color: "#555555", flex: 2 },
                  { type: "text", text: `${data.guests} ท่าน`, size: "sm", color: "#1a1a2e", weight: "bold", align: "end", flex: 1 },
                ],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          // ราคารวม
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "ราคารวม (ประมาณ)",
                size: "md",
                color: "#555555",
                flex: 2,
                gravity: "center",
              },
              {
                type: "text",
                text: priceStr,
                size: "xl",
                weight: "bold",
                color: "#e63946",
                align: "end",
                flex: 2,
                gravity: "center",
              },
            ],
          },
          // หมายเหตุราคา
          {
            type: "text",
            text: "* ราคาอาจเปลี่ยนแปลงตามช่วงเวลา กรุณาติดต่อแอดมินเพื่อยืนยัน",
            size: "xxs",
            color: "#aaaaaa",
            wrap: true,
            margin: "sm",
          },
          // Booking ID
          {
            type: "box",
            layout: "horizontal",
            margin: "lg",
            backgroundColor: "#f8f8f8",
            cornerRadius: "8px",
            paddingAll: "10px",
            contents: [
              {
                type: "text",
                text: `หมายเลขคำขอ: ${data.bookingId.slice(-8).toUpperCase()}`,
                size: "xs",
                color: "#888888",
                flex: 1,
              },
              {
                type: "text",
                text: new Date().toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                size: "xs",
                color: "#888888",
                align: "end",
                flex: 1,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        backgroundColor: "#f8f9fa",
        paddingAll: "15px",
        spacing: "md",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "✅ ยืนยันจอง",
              text: `ยืนยันจอง BT-${data.houseId} เช็คอิน ${checkInStr} เช็คเอาท์ ${checkOutStr} ชื่อ: ${fullName} เบอร์: ${data.phone}`,
            },
            style: "primary",
            color: "#1a1a2e",
            flex: 1,
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "📞 ติดต่อแอดมิน",
              text: `สอบถามข้อมูลการจอง BT-${data.houseId} หมายเลขคำขอ: ${data.bookingId.slice(-8).toUpperCase()}`,
            },
            style: "secondary",
            flex: 1,
          },
        ],
      },
    },
  };
}
