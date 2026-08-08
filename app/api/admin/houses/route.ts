import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

async function checkAdmin(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return false;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata?.isAdmin === true;
  } catch {
    return false;
  }
}

// GET — all houses for admin
export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const houses = await prisma.house.findMany({
    include: { detail: true },
    orderBy: { hId: "asc" },
  });
  return NextResponse.json(houses);
}
