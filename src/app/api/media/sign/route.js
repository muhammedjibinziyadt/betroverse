import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sig = generateUploadSignature({ folder: body.folder || "general" });
    return NextResponse.json(sig);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to sign upload" },
      { status: 500 }
    );
  }
}
