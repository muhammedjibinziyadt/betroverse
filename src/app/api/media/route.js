import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getAllMedia,
  saveMediaAsset,
  deleteMediaByIds,
  deleteAllMediaAssets,
} from "@/lib/db";
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  optimizeCloudinaryUrl,
} from "@/lib/cloudinary";

export async function GET() {
  try {
    const assets = await getAllMedia();
    return NextResponse.json({ assets, count: assets.length });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const folder = formData.get("folder") || "general";
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "application/octet-stream";
      const fileType = mimeType.startsWith("video/")
        ? "video"
        : mimeType === "application/pdf"
        ? "pdf"
        : "image";
      const id = "media-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      const sizeStr =
        buffer.length > 1024 * 1024
          ? (buffer.length / (1024 * 1024)).toFixed(2) + " MB"
          : Math.max(1, Math.round(buffer.length / 1024)) + " KB";

      // If Cloudinary is configured, upload buffer directly to Cloudinary CDN
      if (isCloudinaryConfigured()) {
        const rType =
          fileType === "video" ? "video" : fileType === "pdf" ? "raw" : "image";
        const cldRes = await uploadBufferToCloudinary(buffer, {
          folder,
          filename: file.name || id,
          resourceType: rType,
        });
        const assetRecord = await saveMediaAsset({
          id,
          name: file.name || `upload-${Date.now()}`,
          filename: file.name || id,
          type: fileType,
          mimeType,
          size: sizeStr,
          sizeBytes: buffer.length,
          folder,
          url: cldRes.url,
          cloudinaryUrl: cldRes.url,
          cloudinaryPublicId: cldRes.publicId,
          resourceType: cldRes.resourceType,
          storage_path: cldRes.publicId,
          date: new Date().toLocaleDateString(),
          createdAt: new Date().toISOString(),
        });
        return NextResponse.json({ success: true, asset: assetRecord });
      }

      // Fallback: store inside MongoDB when Cloudinary is not configured yet
      const base64Data = buffer.toString("base64");
      const assetRecord = await saveMediaAsset({
        id,
        name: file.name || `upload-${Date.now()}`,
        filename: file.name || id,
        type: fileType,
        mimeType,
        size: sizeStr,
        sizeBytes: buffer.length,
        folder,
        url: `/api/media/file/${id}`,
        storage_path: id,
        base64Data,
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, asset: assetRecord });
    } else {
      const body = await req.json();
      if (body.url && body.url.includes("res.cloudinary.com")) {
        body.url = optimizeCloudinaryUrl(body.url);
        body.cloudinaryUrl = body.url;
      }
      const assetRecord = await saveMediaAsset(body);
      return NextResponse.json({ success: true, asset: assetRecord });
    }
  } catch (err) {
    console.error("[API /media POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      if (isCloudinaryConfigured()) {
        const all = await getAllMedia();
        await deleteFromCloudinary(all);
      }
      const res = await deleteAllMediaAssets();
      return NextResponse.json(res);
    }

    const singleId = searchParams.get("id");
    if (singleId) {
      if (isCloudinaryConfigured()) {
        const all = await getAllMedia();
        const target = all.find((a) => a.id === singleId);
        if (target) await deleteFromCloudinary([target]);
      }
      const res = await deleteMediaByIds([singleId]);
      return NextResponse.json(res);
    }

    const body = await req.json().catch(() => ({}));
    if (body.all) {
      if (isCloudinaryConfigured()) {
        const all = await getAllMedia();
        await deleteFromCloudinary(all);
      }
      const res = await deleteAllMediaAssets();
      return NextResponse.json(res);
    }

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      if (isCloudinaryConfigured()) {
        const all = await getAllMedia();
        const idSet = new Set(body.ids);
        const targets = all.filter((a) => idSet.has(a.id));
        await deleteFromCloudinary(targets);
      }
      const res = await deleteMediaByIds(body.ids);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "No media ID specified" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
