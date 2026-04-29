import { prisma } from "../lib/prisma";

async function main() {
  const counts = await prisma.booking.groupBy({
    by: ['bookType'],
    _count: true
  });
  console.log('Booking types counts:', counts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
