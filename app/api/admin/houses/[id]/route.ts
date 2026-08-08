import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import axios from "axios";

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

// PATCH — update a single house (manual override, category, price, etc.)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  const body = await req.json();

  const allowedFields: Record<string, any> = {};
  const allowed = ["manualOverride", "category", "price", "people", "hBedroom", "hToilet",
    "wifi", "grill", "pet", "karaoke", "jacuzzi", "snooker", "discotech", "slider", "billard", "swimmingKid", "bath", "swim"];
  for (const key of allowed) {
    if (key in body) allowedFields[key] = body[key];
  }

  const house = await prisma.house.update({ where: { hId: id }, data: allowedFields });
  return NextResponse.json(house);
}

// POST /sync-calendar — sync only calendar for one house
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  try {
    const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pool-villaptong.vercel.app'}/api/houses/${id}/sync`;
    const res = await axios.post(syncUrl, {}, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
    });
    return NextResponse.json({ ok: true, result: res.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
