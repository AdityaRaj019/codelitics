import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";
import { isValidEmail, isValidPassword, sanitizeString } from "@/lib/validation";

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password } = body;
    // SECURITY: Never accept 'role' from the request body.
    // All new users are created as "user" role.

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Validate and sanitize name
    const sanitizedName = sanitizeString(name);
    if (sanitizedName.length < 1 || sanitizedName.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name must be between 1 and 100 characters" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: passwordCheck.error },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user — always as "user" role
    const user = await User.create({
      name: sanitizedName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: "credentials",
      role: "user", // SECURITY: Hardcoded, never from request
    });

    // Build user response (without password)
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
    const response = NextResponse.json(
      { success: true, user: userResponse },
      { status: 201 },
    );
    setSessionCookie(response, user._id.toString(), user.role);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 },
    );
  }
}
