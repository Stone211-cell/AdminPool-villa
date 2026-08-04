// app/api/auto-sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Cron endpoint — ตอบ 200 ทันที แล้วค่อย sync เบื้องหลัง
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { runBulkSync } from "@/lib/services/sync.service";
import { waitUntil } from "@vercel/functions";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const hardcodedSecret = "pool-villa-sync-2024-secret";

function isAuthorized(req: NextRequest): boolean {
  const envSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
  const token = auth?.replace("Bearer ", "").trim();
  return token === envSecret || token === hardcodedSecret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ให้ระบบ sync ทำงานแบบ background ต่อแม้ว่าจะส่ง response คืนแล้วก็ตาม
    waitUntil(
      runBulkSync(50).catch(e => console.error("[auto-sync] background error:", e))
    );
    
    // ตอบ 200 ทันทีเพื่อไม่ให้ระบบของ cron-job.org หรือ Vercel หมดเวลา (Timeout)
    return NextResponse.json({ success: true, message: "Sync started in background via waitUntil" });
  } catch (e) {
    console.error("[auto-sync] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    waitUntil(
      runBulkSync(50).catch(e => console.error("[auto-sync] background error:", e))
    );
    return NextResponse.json({ success: true, message: "Sync started in background via waitUntil" });
  } catch (e) {
    console.error("[auto-sync] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
