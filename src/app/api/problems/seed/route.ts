import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem } from "@/lib/db/models";
import { problemsData } from "./problemsData";
import { dsaSheetData } from "./dsaSheetData";
import { requireAdmin } from "@/lib/auth";

// POST /api/problems/seed - Seed database with all problems
// SECURITY: Admin-only — this is a destructive operation that wipes all problems
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    await dbConnect();

    // Merge both datasets and deduplicate by title + platform
    const allProblems = [...problemsData, ...dsaSheetData];
    const seen = new Set<string>();
    const uniqueProblems = allProblems.filter((p) => {
      const key = `${p.title.toLowerCase()}__${(p.platform || "GeeksforGeeks").toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Clear existing problems and re-insert fresh
    await Problem.deleteMany({});
    const result = await Problem.insertMany(uniqueProblems, { ordered: false });
    const insertedCount = result.length;

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedCount} problems into the database`,
      totalFromLeetCode: problemsData.length,
      totalFromDSASheet: dsaSheetData.length,
      uniqueAfterMerge: uniqueProblems.length,
      inserted: insertedCount,
    });
  } catch (error) {
    console.error("Seed problems error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed problems" },
      { status: 500 },
    );
  }
}
