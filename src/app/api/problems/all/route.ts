import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem, UserProblemProgress } from "@/lib/db/models";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/problems/all - Get all problems with user progress if authenticated
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

    // Check if user is authenticated to merge progress
    const authUser = getAuthenticatedUser(request);
    const progressMap: Record<string, { status: string; notes?: string }> = {};
    
    if (authUser) {
      const progressList = await UserProblemProgress.find({ userId: authUser.userId }).lean();
      progressList.forEach((prog) => {
        if (prog.problemId) {
          progressMap[prog.problemId.toString()] = {
            status: prog.status,
            notes: prog.notes,
          };
        }
      });
    }

    const formatted = problems.map((p) => {
      const prog = progressMap[p._id.toString()];
      return {
        id: p._id.toString(),
        title: p.title,
        url: p.url,
        category: p.category,
        difficulty: p.difficulty,
        platform: p.platform,
        status: prog ? prog.status : null,
        notes: prog ? prog.notes : undefined,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get all problems error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get problems" },
      { status: 500 }
    );
  }
}
