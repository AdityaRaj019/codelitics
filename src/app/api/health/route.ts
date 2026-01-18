import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";

// GET /api/health - Test database connection
export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      status: "ok",
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to database",
      },
      { status: 500 }
    );
  }
}
