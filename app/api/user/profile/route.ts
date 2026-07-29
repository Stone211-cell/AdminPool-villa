import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { firstName, lastName, phone } = body;

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        firstName,
        lastName,
        phone,
      },
      create: {
        clerkId: userId,
        firstName,
        lastName,
        phone,
        email,
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Profile POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
