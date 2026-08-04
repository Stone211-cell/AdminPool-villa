// lib/external/poolvilla.api.ts
// ──────────────────────────────────────────────────────────────────────────────
// ทุกการยิง API ไปยัง poolvillacity.co.th ให้ผ่านไฟล์นี้เท่านั้น
// ──────────────────────────────────────────────────────────────────────────────
import axios from "axios";

export const POOLVILLA_API = "https://api.poolvillacity.co.th/next-villapaza/api";
export const POOLVILLA_IMAGE_BASE = "https://sgp1.digitaloceanspaces.com/villapaza-spaces";
export const POOLVILLA_SITE = "https://poolvillacity.co.th";

/** URL รูปภาพจาก path ที่ API ส่งมา */
export const toImageUrl = (path: string | undefined): string => {
  if (!path) return "";
  // path จาก API ขึ้นต้นด้วย /public/images/... ต่อกับ SPACES_BASE ได้ตรง
  if (path.startsWith("/")) return `${POOLVILLA_IMAGE_BASE}${path}`;
  // กรณีมี URL เต็มอยู่แล้ว
  if (path.startsWith("http")) return path;
  return `${POOLVILLA_IMAGE_BASE}/${path}`;
};

/** URL หน้ารายละเอียดบ้านในเว็บต้นฉบับ */
export const toDetailUrl = (hId: string): string =>
  `${POOLVILLA_SITE}/house/CITY-${hId}`;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface RemoteHouse {
  _id: string;
  code: string; // "CITY-293"
  name: string;
  thumbnail: string[];
  lowestPrice?: number;
  price_house?: Array<{ every_day?: Array<{ price: number }> }>;
  accommodate_number?: number;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  district?: string;
}

export interface RemoteHouseDetail {
  house: {
    _id: string;
    check_in_time?: string;
    check_out_time?: string;
    number_of_bedrooms?: number;
    number_of_bathrooms?: number;
    accommodate_number?: number;
    district?: string;
    detail?: string;
    facilities?: Array<{ name_th?: string; name_en?: string }>;
    location?: { name?: string };
    additional_stay_information?: {
      extra_per_person?: number;
      damage_insurance?: number;
      service?: string;
    };
  };
  book?: Array<{
    date_start: string;
    date_end: string;
    status?: { name_th?: string };
  }>;
  priceHouse?: {
    every_day?: Array<{
      day: string;
      price: number;
    }>;
    holiday?: Array<{
      date: string[];
      price: number;
      type?: string;
    }>;
    promotion?: Array<{
      date: string[];
      price: number;
      type?: string;
    }>;
  };
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** ดึงรายการบ้านทั้งหมด (limit สูงสุด 2000) */
export async function fetchAllHouses(limit = 2000): Promise<RemoteHouse[]> {
  const res = await axios.post(
    `${POOLVILLA_API}/customer/house/filter?offset=0&limit=${limit}`,
    {},
    { timeout: 30000 }
  );
  return res.data?.results ?? [];
}

/** ดึงรายละเอียดบ้านพร้อมข้อมูลการจอง */
export async function fetchHouseDetail(hId: string): Promise<RemoteHouseDetail | null> {
  try {
    const res = await axios.get(
      `${POOLVILLA_API}/customer/house/info/CITY-${hId}`,
      { timeout: 15000 }
    );
    return res.data?.result ?? null;
  } catch {
    return null;
  }
}

/** ตรวจสอบว่ามีสิ่งอำนวยความสะดวกไหม */
export function hasFacility(
  facilities: Array<{ name_th?: string; name_en?: string }>,
  keyword: string
): boolean {
  return facilities.some(
    (f) =>
      f.name_th?.includes(keyword) ||
      f.name_en?.toLowerCase().includes(keyword.toLowerCase())
  );
}
