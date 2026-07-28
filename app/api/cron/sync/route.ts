// app/api/cron/sync/route.ts
// ──────────────────────────────────────────────────────────────────────────────
// Vercel Cron Job + Manual sync endpoint
// ──────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { runBulkSync } from "@/lib/services/sync.service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return runSync(req);
}

export async function GET(req: NextRequest) {
  return runSync(req);
}

async function runSync(req: NextRequest) {
  // Optional auth for GET requests from external cron services
  const secret = process.env.CRON_SECRET;
  if (secret && req.method === "GET") {
    const auth =
      req.headers.get("authorization") ?? req.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && auth !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runBulkSync(50);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[cron/sync] Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
