import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listAllUsers, upsertAdminUser, deleteAdminUser } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await listAllUsers();
  return NextResponse.json({ users });
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const saved = await upsertAdminUser({
      username: body.username,
      email: body.email,
      password: body.password,
      role: body.role || "admin",
    });
    return NextResponse.json({ success: true, user: saved });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to save user" },
      { status: 400 }
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
    const username = searchParams.get("username");
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    await deleteAdminUser(username);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}
