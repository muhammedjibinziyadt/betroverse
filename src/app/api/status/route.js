import { NextResponse } from "next/server";
import {
  getAllProjects,
  getAllBrands,
  getDbStatusInfo,
  getMediaStats,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = getDbStatusInfo();
    const [projects, brands, mediaStats] = await Promise.all([
      getAllProjects({ includeDrafts: true }),
      getAllBrands(),
      getMediaStats(),
    ]);
    return NextResponse.json({
      healthy: true,
      status: "online",
      ...info,
      mediaStats,
      counts: {
        projects: projects.length,
        brands: brands.length,
        media: mediaStats.total,
      },
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        healthy: false,
        status: "error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
