// scratch/fix-image-urls.js
// แก้ไข imgName ในฐานข้อมูลที่มี URL เก่า/ผิดให้ถูกต้อง
const { PrismaClient } = require('../app/generated/prisma');
const p = new PrismaClient();

const SPACES_BASE = 'https://sgp1.digitaloceanspaces.com/villapaza-spaces';

function fixImageUrl(imgName) {
  if (!imgName || imgName.trim() === '') return imgName;

  // ถูกอยู่แล้ว
  if (imgName.includes('sgp1.digitaloceanspaces.com')) return imgName;

  // path ขึ้นต้นด้วย / (ใหม่)
  if (imgName.startsWith('/public/images')) return `${SPACES_BASE}${imgName}`;

  // URL เก่าจาก poolvillacity.co.th
  if (imgName.includes('poolvillacity.co.th')) {
    const path = imgName.replace(/https?:\/\/poolvillacity\.co\.th/, '');
    return `${SPACES_BASE}${path}`;
  }

  // devillegroups.com → เคลียร์ออก (404 อยู่ดี)
  if (imgName.includes('devillegroups.com')) return '';

  return imgName;
}

async function main() {
  const houses = await p.house.findMany({ select: { id: true, hId: true, imgName: true } });
  
  let fixed = 0, cleared = 0, unchanged = 0;

  for (const h of houses) {
    const newUrl = fixImageUrl(h.imgName);
    if (newUrl === h.imgName) { unchanged++; continue; }

    await p.house.update({ where: { id: h.id }, data: { imgName: newUrl || '' } });
    if (!newUrl) { cleared++; console.log(`  Cleared: CITY-${h.hId} (${h.imgName?.slice(0,50)})`); }
    else { fixed++; console.log(`  Fixed: CITY-${h.hId}\n    from: ${h.imgName?.slice(0,60)}\n    to:   ${newUrl.slice(0,60)}`); }
  }

  console.log(`\n✅ Done — fixed: ${fixed}, cleared: ${cleared}, unchanged: ${unchanged}`);
}

main().catch(console.error).finally(() => p.$disconnect());
