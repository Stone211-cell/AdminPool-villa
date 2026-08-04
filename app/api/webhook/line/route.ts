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
                houseName: `บ้านพัก CITY-${house.hId}`,
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
                await axios.post('https://api.line.me/v2/bot/message/reply', {
                  replyToken,
                  messages: [flexContent]
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
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
