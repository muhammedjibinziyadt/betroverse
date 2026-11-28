import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDbStatusInfo } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  const dbInfo = getDbStatusInfo();
  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null, db: dbInfo },
      { status: 200 }
    );
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role || "admin",
    },
    db: dbInfo,
  });
}
