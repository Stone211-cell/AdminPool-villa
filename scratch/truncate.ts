import { prisma } from '../lib/prisma';

async function main() {
  console.log('Truncating tables...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE houses CASCADE');
  console.log('Done');
}

main().catch(console.error).finally(() => process.exit(0));
