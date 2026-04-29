// lib/api/houses.ts
// ดึงข้อมูลบ้านพูลวิลล่าจาก poolvilla-pwth.com ผ่าน RSC payload

import axios from "axios";

export interface House {
  _id: string;
  h_id: string;
  h_zone: string;
  h_bedroom: string;
  h_toilet: string;
  h_farsea: string;
  wifi: "y" | "n";
  grill: "y" | "n";
  pet: "y" | "n";
  snooker: "y" | "n";
  discotech: "y" | "n";
  slider: "y" | "n";
  billard: "y" | "n";
  swimming_kid: "y" | "n";
  swim: "chlorine" | "salt" | "n";
  karaoke: "y" | "n";
  jacuzzi: "y" | "n";
  bath: "y" | "n";
  img_name: string;
  price: string;
  people: string;
}

export async function fetchHouses(): Promise<House[]> {
  const { data: text } = await axios.get<string>(
    "https://www.poolvilla-pwth.com/houses",
    {
      headers: {
        RSC: "1",
        Accept: "text/x-component",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      responseType: "text",
      timeout: 15000,
    }
  );

  const allHouses: House[] = [];
  let searchStart = 0;

  // ดึง JSON array ของบ้านจาก RSC payload (pattern: "data":[{...}])
  while (true) {
    const marker = '"data":[{"_id"';
    const idx = text.indexOf(marker, searchStart);
    if (idx === -1) break;

    const arrayStart = idx + '"data":'.length;
    let depth = 0;
    let arrayEnd = arrayStart;

    for (let i = arrayStart; i < text.length; i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]") {
        depth--;
        if (depth === 0) {
          arrayEnd = i;
          break;
        }
      }
    }

    try {
      const houses: House[] = JSON.parse(text.slice(arrayStart, arrayEnd + 1));
      allHouses.push(...houses);
    } catch {
      // ข้ามถ้า parse ไม่ได้
    }

    searchStart = arrayEnd + 1;
  }

  // กรองเฉพาะที่มี h_id และกรองซ้ำ
  return Array.from(
    new Map(
      allHouses.filter((h) => h.h_id).map((h) => [h.h_id, h])
    ).values()
  );
}
