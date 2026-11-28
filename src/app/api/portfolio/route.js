import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getAllProjects,
  upsertProject,
  updateProjectsOrder,
} from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("includeDrafts") === "true";
    const projects = await getAllProjects({ includeDrafts });
    return NextResponse.json({ projects, count: projects.length });
  } catch (err) {
    console.error("[API /portfolio GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch projects" },
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
    const body = await req.json();
    const saved = await upsertProject(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("[API /portfolio POST] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save case study" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (Array.isArray(body.orderedIds)) {
      await updateProjectsOrder(body.orderedIds);
      return NextResponse.json({ success: true });
    }
    if (Array.isArray(body.projects)) {
      const ids = body.projects.map((p) => p.id).filter(Boolean);
      await updateProjectsOrder(ids);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update project order" },
      { status: 500 }
    );
  }
}
