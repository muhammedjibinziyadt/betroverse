import { NextResponse } from "next/server";
import { findUser } from "@/lib/db";
import {
  verifyPassword,
  signSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const identifier = (body.username || body.email || "").trim();
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/Email and password are required." },
        { status: 400 }
      );
    }

    const user = await findUser(identifier);
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = signSessionToken({
      username: user.username,
      email: user.email,
      role: user.role || "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role || "admin",
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[API /auth/login] Error:", err);
    return NextResponse.json(
      { error: "Authentication error: " + (err.message || "Server error") },
      { status: 500 }
    );
  }
}
