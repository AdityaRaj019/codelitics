import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ─────────────────────────────────────────────
// Auth Utility — Cookie-based signed sessions
// ─────────────────────────────────────────────

const AUTH_COOKIE_NAME = "codelitics_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret === "YOUR_NEXTAUTH_SECRET_HERE") {
    throw new Error(
      "NEXTAUTH_SECRET must be set to a secure random value in .env.local",
    );
  }
  return secret;
}

// ─── Token creation / verification ────────────

interface SessionPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Create a signed session token (HMAC-SHA256 signed JSON payload).
 * This is a lightweight alternative to full JWT that avoids external deps.
 */
export function createSessionToken(userId: string, role: string): string {
  const payload: SessionPayload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(payloadStr)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return null;
    }

    // Decode payload
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString(),
    );

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───────────────────────────

/**
 * Set the session cookie on a NextResponse.
 */
export function setSessionCookie(
  response: NextResponse,
  userId: string,
  role: string,
): void {
  const token = createSessionToken(userId, role);
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the session cookie (for logout).
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// ─── Request authentication ───────────────────

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

/**
 * Extract and verify the authenticated user from a request.
 * Returns null if not authenticated.
 */
export function getAuthenticatedUser(
  request: NextRequest,
): AuthenticatedUser | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    role: payload.role,
  };
}

/**
 * Require authentication. Returns the user or an error response.
 */
export function requireAuth(
  request: NextRequest,
): AuthenticatedUser | NextResponse {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }
  return user;
}

/**
 * Require admin role. Returns the user or an error response.
 */
export function requireAdmin(
  request: NextRequest,
): AuthenticatedUser | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 },
    );
  }
  return result;
}
