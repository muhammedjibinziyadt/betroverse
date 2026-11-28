import { NextResponse } from "next/server";
import { getMediaById } from "@/lib/db";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const rawId = Array.isArray(params.id) ? params.id.join("/") : params.id;
    const asset = await getMediaById(rawId);
    if (!asset) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (asset.cloudinaryUrl && asset.cloudinaryUrl.startsWith("http")) {
      return NextResponse.redirect(asset.cloudinaryUrl, 302);
    }

    if (!asset.base64Data) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const buffer = Buffer.from(asset.base64Data, "base64");
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse("Error", { status: 500 });
  }
}
