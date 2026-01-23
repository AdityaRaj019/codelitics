import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { User } from "@/lib/db/models";

// GET /api/auth/me?userId=xxx - Get current user data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findById(userId);

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
