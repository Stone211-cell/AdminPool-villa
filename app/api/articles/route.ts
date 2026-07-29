import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
    const { sessionClaims } = await auth();
    // Use type assertion since publicMetadata might not be typed
    const metadata = sessionClaims?.metadata as any;
    
    if (metadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
