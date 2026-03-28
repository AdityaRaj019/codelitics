import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem } from "@/lib/db/models";

// GET /api/problems/all - Get all problems (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (category) query.category = category;

    const problems = await Problem.find(query)
      .sort({ category: 1, difficulty: 1, title: 1 })
      .lean();

    const formatted = problems.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      url: p.url,
      category: p.category,
      difficulty: p.difficulty,
      platform: p.platform,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get all problems error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get problems" },
      { status: 500 }
    );
  }
}
