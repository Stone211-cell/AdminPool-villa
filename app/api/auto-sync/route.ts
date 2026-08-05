// app/api/auto-sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Full sync endpoint — ตอบ 200 ทันที แล้ว sync ทุกอย่างเบื้องหลัง
// มี lock guard: ถ้า sync เพิ่งรันใน 5 นาทีที่แล้ว จะ skip ไม่รันซ้ำ
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { runBulkSync } from "@/lib/services/sync.service";
import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const hardcodedSecret = "pool-villa-sync-2024-secret";

// Lock ระดับ process (กัน concurrent ในตัว function เดียวกัน)
let isSyncing = false;
let lastSyncStarted: Date | null = null;

function isAuthorized(req: NextRequest): boolean {
  const envSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
  const token = auth?.replace("Bearer ", "").trim();
  return token === envSecret || token === hardcodedSecret;
}

async function runFullSync() {
  isSyncing = true;
  lastSyncStarted = new Date();
  try {
    // บันทึกเวลาเริ่ม sync ลง DB เพื่อให้ instance อื่นเห็นด้วย
    await prisma.house.updateMany({
      where: {},
      data: {}, // dummy update เพื่อ flush timestamp
    }).catch(() => {}); // ignore error

    await runBulkSync(50);
  } finally {
    isSyncing = false;
  }
}

async function shouldSkipSync(): Promise<{ skip: boolean; reason: string }> {
  // ถ้า instance นี้กำลัง sync อยู่ → skip
  if (isSyncing) {
    return { skip: true, reason: "Sync already running in this instance" };
  }

  // ถ้าเพิ่งเริ่ม sync ใน 4 นาทีที่แล้ว (ป้องกัน instance ใหม่)
  if (lastSyncStarted) {
    const minutesSince = (Date.now() - lastSyncStarted.getTime()) / 1000 / 60;
    if (minutesSince < 4) {
      return { skip: true, reason: `Last sync started ${minutesSince.toFixed(1)}min ago, still running` };
    }
  }

  // ตรวจสอบว่า DB มีข้อมูลไหม (กัน cold start ที่ยังไม่ sync เลย)
  const houseCount = await prisma.house.count().catch(() => 0);
  if (houseCount === 0) {
    return { skip: false, reason: "No houses in DB, must sync" };
  }

  // ดูว่าบ้านล่าสุด update เมื่อไร
  const lastUpdated = await prisma.house.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  }).catch(() => null);

  if (!lastUpdated) {
    return { skip: false, reason: "Cannot determine last sync time" };
  }

  const minutesSinceLastUpdate = (Date.now() - lastUpdated.updatedAt.getTime()) / 1000 / 60;

  // ถ้าอัปเดตไปแล้วใน 5 นาทีที่แล้ว → skip
  if (minutesSinceLastUpdate < 5) {
    return {
      skip: true,
      reason: `Last sync was ${minutesSinceLastUpdate.toFixed(1)}min ago, skipping`
    };
  }

  return { skip: false, reason: `Last sync was ${minutesSinceLastUpdate.toFixed(0)}min ago, time to sync` };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { skip, reason } = await shouldSkipSync();

  if (skip) {
    return NextResponse.json({ success: true, skipped: true, reason });
  }

  waitUntil(
    runFullSync().catch(e => {
      isSyncing = false;
      console.error("[auto-sync] background error:", e);
    })
  );

  return NextResponse.json({ success: true, message: "Full sync started in background", reason });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { skip, reason } = await shouldSkipSync();

  if (skip) {
    return NextResponse.json({ success: true, skipped: true, reason });
  }

  waitUntil(
    runFullSync().catch(e => {
      isSyncing = false;
      console.error("[auto-sync] background error:", e);
    })
  );

  return NextResponse.json({ success: true, message: "Full sync started in background", reason });
}
