import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";

// POST /api/auth/login - Login user with credentials
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if user has password (credentials auth)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: `This account uses ${user.authProvider} login. Please use that method.`,
        },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Return user data for storing in Zustand
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
    };

    // Create response with session cookie
    const response = NextResponse.json({ success: true, user: userResponse });
    setSessionCookie(response, user._id.toString(), user.role);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to login" },
      { status: 500 },
    );
  }
}
