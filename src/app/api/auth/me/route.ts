import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth";

// GET /api/auth/me - Get current authenticated user's data
// SECURITY: Now uses server-side session cookie instead of accepting userId from query
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    const user = await User.findById(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get user" },
      { status: 500 },
    );
  }
}
