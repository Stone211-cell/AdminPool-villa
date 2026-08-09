import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const bookings = await prisma.lineBookingRequest.findMany({
    where: { lineUserId: "U5196d501e83f7b352d6343796473e3e8" }
  });
  
  return NextResponse.json({ bookings });
}
