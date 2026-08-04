// lib/utils/image.ts
// normalize URL รูปบ้านให้ถูกต้องไม่ว่าจะ sync จากไหน

const SPACES_BASE = "https://sgp1.digitaloceanspaces.com/villapaza-spaces";

/** แปลง imgName ให้เป็น URL รูปที่ใช้งานได้จริง */
export function resolveHouseImage(imgName: string | null | undefined): string {
  if (!imgName || imgName.trim() === "") return "";

  // 1. มี path ขึ้นต้นด้วย /public/images → ต่อกับ spaces CDN
  if (imgName.startsWith("/public/images")) {
    return `${SPACES_BASE}${imgName}`;
  }

  // 2. URL จาก poolvillacity.co.th → แทนที่ domain ด้วย spaces CDN
  //    เช่น https://poolvillacity.co.th/public/images/house/xxx
  if (imgName.includes("poolvillacity.co.th")) {
    const path = imgName.replace(/https?:\/\/poolvillacity\.co\.th/, "");
    return `${SPACES_BASE}${path}`;
  }

  // 3. URL เก่าจาก devillegroups.com → ไม่มีทางแก้ได้ (404) return เปล่า
  if (imgName.includes("devillegroups.com")) {
    return "";
  }

  // 4. มี URL เต็มอยู่แล้วที่เป็น spaces CDN → ใช้ตรง ๆ
  if (imgName.includes("sgp1.digitaloceanspaces.com")) {
    return imgName;
  }

  // 5. path สั้น ๆ ที่ไม่มี / นำหน้า → อาจเป็น filename เก่า
  if (!imgName.startsWith("http")) {
    return `${SPACES_BASE}/${imgName}`;
  }

  return imgName;
}
