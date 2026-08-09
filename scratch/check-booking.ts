import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const b = await prisma.lineBookingRequest.findFirst({ where: { lineUserId: 'WEB-BK-96060' } });
  console.log('Booking 96060:', b);
  
  const b2 = await prisma.lineBookingRequest.findFirst({ where: { lineUserId: 'WEB-BK-93037' } });
  console.log('Booking 93037:', b2);
}
check().finally(() => prisma.$disconnect());
