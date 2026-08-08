import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, imageUrl } = body;

    const article = await prisma.article.update({
      where: { id },
      data: { title, content, imageUrl }
    });

    return NextResponse.json(article);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}
