import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { createBookingFlexMessage } from "@/lib/line/flex-message";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = body.events || [];
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim();
        const userId = event.source.userId;
        const replyToken = event.replyToken;
        
        const match = text.match(/ยืนยันการจอง\s+(BK-\d+)/);
        if (match) {
          const refCode = match[1];
          // Find pending web booking
          const booking = await prisma.lineBookingRequest.findFirst({
            where: { lineUserId: "WEB-" + refCode }
          });
          
          if (booking) {
            // Update lineUserId to actual user ID
            await prisma.lineBookingRequest.update({
              where: { id: booking.id },
              data: { lineUserId: userId, status: "pending" }
            });
            
            // Fetch house data for Flex Message
            const house = await prisma.house.findUnique({
              where: { hId: booking.houseId }
            });
            
            const diffTime = Math.abs(booking.checkOut.getTime() - booking.checkIn.getTime());
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (house) {
              const flexContent = createBookingFlexMessage({
                houseId: house.hId,
                houseName: `บ้านพัก BT-${house.hId}`,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                firstName: booking.firstName,
                lastName: booking.lastName,
                phone: booking.phone,
                totalPrice: booking.totalPrice,
                nights,
                bookingId: booking.id,
                pictureUrl: house.imgName || undefined
              });
              
              if (flexContent) {
                try {
                  await axios.post('https://api.line.me/v2/bot/message/push', {
                    to: userId,
                    messages: [flexContent]
                  }, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
                    }
                  });
                } catch (err: any) {
                  // Fallback to text message if flex message fails (for debugging)
                  await axios.post('https://api.line.me/v2/bot/message/push', {
                    to: userId,
                    messages: [{ type: 'text', text: `เกิดข้อผิดพลาดในการส่งการ์ดจอง: ${err.response?.data?.message || err.message}` }]
                  }, {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
                    }
                  });
                }
              }
            }
          }
        } else if (text.includes('ติดต่อ')) {
          await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [{
              type: 'text',
              text: "เพจ Facebook\nhttps://web.facebook.com/profile.php?id=61556499615942\n\nFacebook ส่วนตัว\nhttps://web.facebook.com/jirapat.sutudnaayutthaya/directory_personal_details?locale=th_TH"
            }]
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
          });
        } else if (text === 'โปรโมชั่น') {
          await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [{
              type: 'text',
              text: "กรุณาเลือกช่วงราคาโปรโมชั่นที่คุณสนใจค่ะ 👇",
              quickReply: {
                items: [
                  { type: "action", action: { type: "message", label: "🔥 โปร 2,900", text: "โปรราคา 2900" } },
                  { type: "action", action: { type: "message", label: "🔥 โปร 3,500", text: "โปรราคา 3500" } },
                  { type: "action", action: { type: "message", label: "🔥 โปร 3,900", text: "โปรราคา 3900" } }
                ]
              }
            }]
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
          });
        } else if (text.startsWith('โปรราคา ')) {
          const price = text.replace('โปรราคา ', '').trim();
          const validPrices = ['2900', '3500', '3900'];
          
          if (validPrices.includes(price)) {
            const fs = require('fs');
            const path = require('path');
            try {
              const indexPath = path.join(process.cwd(), 'public', 'promotion', 'index.json');
              const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
              const images = indexData[price] || [];
              
              if (images.length > 0) {
                // Shuffle and pick up to 5 images
                const shuffled = images.sort(() => 0.5 - Math.random());
                const selectedImages = shuffled.slice(0, 5);
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pool-villaptong.vercel.app';
                
                const messages = selectedImages.map((img: string) => ({
                  type: 'image',
                  originalContentUrl: `${appUrl}/promotion/${price}/${img}`,
                  previewImageUrl: `${appUrl}/promotion/${price}/${img}`
                }));
                
                await axios.post('https://api.line.me/v2/bot/message/push', {
                  to: userId,
                  messages: messages
                }, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
                  }
                });
              }
            } catch (err) {
              console.error("Error reading promotion images", err);
            }
          }
        } else if (text.includes('มัดจำ') || text.includes('เลขบัญชี') || text.includes('โอนเงิน')) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pool-villaptong.vercel.app';
          const imageUrl = `${appUrl}/images/qr-deposit.jpg`;
          
          await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [{
              type: 'image',
              originalContentUrl: imageUrl,
              previewImageUrl: imageUrl
            }]
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
          });
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
