
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }

  return secret;
}

export const SESSION_COOKIE_NAME = "betro_admin_session";

// Hash password
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

// Verify password
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Generate JWT session
export function signSessionToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

// Verify JWT session
export function verifySessionToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
}

// Get logged-in admin
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifySessionToken(token);

    if (!decoded || !decoded.username) return null;

    return decoded;
  } catch (err) {
    return null;
  }
}
