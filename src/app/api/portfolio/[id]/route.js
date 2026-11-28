import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getProjectBySlugOrId, deleteProjectById } from "@/lib/db";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const project = await getProjectBySlugOrId(params.id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const params = await context.params;
    await deleteProjectById(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
