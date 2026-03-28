import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem } from "@/lib/db/models";
import { problemsData } from "./problemsData";

// POST /api/problems/seed - Seed database with all problems
export async function POST() {
  try {
    await dbConnect();

    // Clear existing problems and re-insert fresh
    await Problem.deleteMany({});
    const result = await Problem.insertMany(problemsData, { ordered: false });
    const insertedCount = result.length;

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedCount} problems into the database`,
      totalInFile: problemsData.length,
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
