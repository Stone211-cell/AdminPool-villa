import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// One-time use: Set isAdmin=true for a user by userId
// POST /api/debug/set-admin  { "userId": "user_xxx" }
export async function POST(req: Request) {
  const { userId, secret } = await req.json();

  // Simple protection
  if (secret !== "baitong-admin-setup-2024") {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { isAdmin: true },
  });

  return NextResponse.json({ success: true, message: `Set isAdmin=true for ${userId}` });
}
