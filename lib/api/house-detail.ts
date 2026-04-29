// lib/api/house-detail.ts
// ดึงรายละเอียดบ้าน + ข้อมูลการจอง/ปฏิทิน จาก RSC payload

import axios from "axios";

export interface Booking {
  book_checkin: string;   // "2026-04-17"
  book_checkout: string;  // "2026-04-18"
  book_type: "guest" | "owner" | "repair" | string;
}

export interface Holiday {
  holiday_start: string;
  holiday_end: string;
  holiday_type: "holiday" | "hotpro";
  holiday_price: number;
  holiday_people: string;
  holiday_alert: string;
}

export interface BasePrice {
  price_sun: number; price_mon: number; price_tue: number;
  price_wed: number; price_thu: number; price_fri: number; price_sat: number;
  people_sun: string; people_mon: string; people_tue: string;
  people_wed: string; people_thu: string; people_fri: string; people_sat: string;
}

export interface HouseAcc {
  h_dvid: string;
  h_bedroom: string;
  h_toilet: string;
  h_time_checkin: string;
  h_time_checkout: string;
  h_kitchen_ware: string | null;
  h_additional_costs: string | null;
  h_moredetail: string | null;
  h_parking: string | null;
  h_alert: string | null;
  h_bedroom_detail: string | null;
  h_extra: string;
  h_insurance: string;
  location: string;
  sea: string;
  h_people_max: string;
  facilities: Record<string, string>;
}

export interface HouseImage {
  image_url: string;
  image_zone: string;
}

export interface HouseDetail {
  id: string;
  acc: HouseAcc;
  images: HouseImage[];
  bk: {
    bookings: Booking[];
    holidays: Holiday[];
    hot_holidays: Holiday[];
    protime_promotions: unknown[];
    base_price: BasePrice;
  };
}

export async function fetchHouseDetail(hId: string): Promise<HouseDetail | null> {
  try {
    const { data: text } = await axios.get<string>(
      `https://www.poolvilla-pwth.com/houses/${hId}`,
      {
        headers: {
          RSC: "1",
          Accept: "text/x-component",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        responseType: "text",
        timeout: 15000,
      }
    );

    // หา JSON object ที่มี "bk":{"bookings":...} และ "acc":{...}
    const marker = '"bk":{"bookings"';
    const idx = text.indexOf(marker);
    if (idx === -1) return null;

    // ย้อนกลับหา { เปิดก่อน "bk"
    let objStart = idx;
    while (objStart > 0 && text[objStart] !== "{") objStart--;

    // หาจุดปิด object
    let depth = 0;
    let objEnd = objStart;
    for (let i = objStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) { objEnd = i; break; }
      }
    }

    const jsonStr = text.slice(objStart, objEnd + 1);
    const parsed = JSON.parse(jsonStr);

    return parsed as HouseDetail;
  } catch (e) {
    console.error(`fetchHouseDetail(${hId}) error:`, e);
    return null;
  }
}
