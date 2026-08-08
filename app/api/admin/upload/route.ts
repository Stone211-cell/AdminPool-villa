import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user.publicMetadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        // Bucket might not exist yet - try to create it
        if (error.message?.includes("not found") || error.message?.includes("Bucket not found")) {
          await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
          // retry
          const { error: e2 } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, buffer, { contentType: file.type });
          if (e2) throw e2;
        } else {
          throw error;
        }
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
