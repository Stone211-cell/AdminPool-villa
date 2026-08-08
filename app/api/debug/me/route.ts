import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not logged in" });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return NextResponse.json({
    userId,
    publicMetadata: user.publicMetadata,
    isAdmin: user.publicMetadata?.isAdmin,
    isAdminType: typeof user.publicMetadata?.isAdmin,
    email: user.emailAddresses?.[0]?.emailAddress,
  });
}
