import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(articles);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (user.publicMetadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        imageUrl,
      }
    });

    return NextResponse.json(article);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
