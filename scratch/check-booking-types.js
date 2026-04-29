const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.booking.groupBy({
    by: ['bookType'],
    _count: true
  });
  console.log('Booking types counts:', counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
