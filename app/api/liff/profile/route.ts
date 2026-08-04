// app/api/liff/profile/route.ts
// รับ LINE profile จาก LIFF แล้ว upsert ลง DB
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lineUserId, displayName, pictureUrl, phone, firstName, lastName } = body;

    if (!lineUserId) {
      return NextResponse.json({ error: "lineUserId is required" }, { status: 400 });
    }

    const user = await prisma.lineUser.upsert({
      where: { lineUserId },
      create: { lineUserId, displayName: displayName || "", pictureUrl, phone: phone || "", firstName: firstName || "", lastName: lastName || "" },
      update: {
        displayName: displayName || undefined,
        pictureUrl: pictureUrl || undefined,
        ...(phone ? { phone } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("[liff/profile] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
