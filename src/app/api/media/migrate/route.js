import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDatabase as getMongoDb } from "@/lib/mongodb";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { migratePendingMediaToCloudinary } from "@/lib/media-sync";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.",
      },
      { status: 400 }
    );
  }

  const db = await getMongoDb();
  if (!db) {
    return NextResponse.json(
      { error: "MongoDB connection required for migration" },
      { status: 500 }
    );
  }

  try {
    const result = await migratePendingMediaToCloudinary(db, {
      concurrency: 5,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[API /media/migrate] Error:", err);
    return NextResponse.json(
      { error: err.message || "Migration failed" },
      { status: 500 }
    );
  }
}
