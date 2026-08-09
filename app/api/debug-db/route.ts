import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const house = await prisma.house.findUnique({
    where: { hId: '1093' }, // from previous booking
    select: { imgName: true }
  });
  
  return NextResponse.json({ house });
}
