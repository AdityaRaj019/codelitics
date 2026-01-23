import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem, UserProblemProgress } from "@/lib/db/models";

// POST /api/problems - Add a new problem (and optionally mark as solved)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      userId,
      title,
      url,
      category,
      difficulty,
      platform,
      status,
      notes,
    } = await request.json();

    // Validate required fields
    if (!userId || !title || !url || !category || !difficulty) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, title, url, category, and difficulty are required",
        },
        { status: 400 },
      );
    }

    // Check if problem already exists (by title and platform)
    let problem = await Problem.findOne({
      title: title.trim(),
      platform: platform || "LeetCode",
    });

    // If problem doesn't exist, create it
    if (!problem) {
      problem = await Problem.create({
        title: title.trim(),
        url: url.trim(),
        category: category.trim(),
        difficulty,
        platform: platform || "LeetCode",
      });
    }

    // Create or update user's progress on this problem
    const progressData = {
      userId,
      problemId: problem._id,
      status: status || "solved",
      notes: notes || undefined,
    };

    const progress = await UserProblemProgress.findOneAndUpdate(
      { userId, problemId: problem._id },
      progressData,
      { upsert: true, new: true, runValidators: true },
    );

    // Return combined response
    const response = {
      problem: {
        id: problem._id.toString(),
        title: problem.title,
        url: problem.url,
        category: problem.category,
        difficulty: problem.difficulty,
        platform: problem.platform,
      },
      progress: {
        id: progress._id.toString(),
        status: progress.status,
        notes: progress.notes,
        updatedAt: progress.updatedAt,
      },
    };

    return NextResponse.json(
      { success: true, data: response },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add problem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add problem" },
      { status: 500 },
    );
  }
}

// GET /api/problems?userId=xxx - Get all problems for a user with their progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status"); // Optional filter: solved, attempted, bookmarked
    const difficulty = searchParams.get("difficulty"); // Optional filter
    const platform = searchParams.get("platform"); // Optional filter
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Build query for user progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressQuery: Record<string, any> = { userId };
    if (status) {
      progressQuery.status = status;
    }

    // Get user's progress entries
    const progressEntries = await UserProblemProgress.find(progressQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "problemId",
        match: {
          ...(difficulty && { difficulty }),
          ...(platform && { platform }),
        },
      });

    // Filter out entries where problem didn't match the filter
    const validEntries = progressEntries.filter((p) => p.problemId !== null);

    // Format response
    const problems = validEntries.map((progress) => {
      const problem = progress.problemId as unknown as {
        _id: { toString: () => string };
        title: string;
        url: string;
        category: string;
        difficulty: string;
        platform: string;
      };

      return {
        id: problem._id.toString(),
        title: problem.title,
        url: problem.url,
        link: problem.url, // Alias for frontend compatibility
        category: problem.category,
        difficulty: problem.difficulty,
        platform: problem.platform,
        status: progress.status,
        solved: progress.status === "solved",
        solvedDate: progress.status === "solved" ? progress.updatedAt : null,
        notes: progress.notes,
        updatedAt: progress.updatedAt,
      };
    });

    // Get total count for pagination
    const total = await UserProblemProgress.countDocuments(progressQuery);

    return NextResponse.json({
      success: true,
      data: {
        problems,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + problems.length < total,
        },
      },
    });
  } catch (error) {
    console.error("Get problems error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get problems" },
      { status: 500 },
    );
  }
}
