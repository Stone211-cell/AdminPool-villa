// app/api/liff/me/route.ts
// ดึงข้อมูล LINE user ที่บันทึกไว้ (เพื่อ pre-fill form ครั้งต่อไป)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lineUserId = req.nextUrl.searchParams.get("lineUserId");

  if (!lineUserId) {
    return NextResponse.json({ error: "lineUserId is required" }, { status: 400 });
  }

  try {
    const user = await prisma.lineUser.findUnique({
      where: { lineUserId },
      include: {
        bookingRequests: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("[liff/me] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
