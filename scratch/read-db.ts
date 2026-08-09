import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const bookings = await prisma.lineBookingRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent bookings:", bookings.map(b => b.lineUserId));
}
run().finally(() => prisma.$disconnect());
