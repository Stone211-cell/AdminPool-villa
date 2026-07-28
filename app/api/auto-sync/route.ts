// app/api/auto-sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Cron endpoint — ตอบ 200 ทันที แล้วค่อย sync เบื้องหลัง
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { runBulkSync } from "@/lib/services/sync.service";

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

  // ตอบ 200 ทันที ไม่รอให้ sync เสร็จ
  const res = NextResponse.json({ success: true, message: "Sync started in background" });
  
  // ทำ sync เบื้องหลัง (fire-and-forget)
  runBulkSync(20).catch(e => console.error("[auto-sync] error:", e));
  
  return res;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ success: true, message: "Sync started in background" });
  runBulkSync(20).catch(e => console.error("[auto-sync] error:", e));
  return res;
}
