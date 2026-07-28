import { prisma } from '../lib/prisma';

async function main() {
  console.log('Deleting bookings...');
  await prisma.booking.deleteMany();
  console.log('Deleting holidays...');
  await prisma.holiday.deleteMany();
  console.log('Deleting basePrices...');
  await prisma.basePrice.deleteMany();
  console.log('Deleting houseDetails...');
  await prisma.houseDetail.deleteMany();
  console.log('Deleting houses...');
  await prisma.house.deleteMany();
  console.log('Deleted all old data successfully!');
}

main().catch(console.error).finally(() => process.exit(0));
