import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem, UserProblemProgress } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth";
import {
  sanitizeString,
  sanitizeNotes,
  sanitizeUrl,
} from "@/lib/validation";

// POST /api/problems - Add a new problem (and optionally mark as solved)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    await dbConnect();

    const { title, url, category, difficulty, platform, status, notes } =
      await request.json();

    // Validate required fields
    if (!title || !url || !category || !difficulty) {
      return NextResponse.json(
        {
          success: false,
          error: "title, url, category, and difficulty are required",
        },
        { status: 400 },
      );
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedCategory = sanitizeString(category);
    const sanitizedUrl = sanitizeUrl(url);
    const sanitizedNotes = notes ? sanitizeNotes(notes) : undefined;

    if (!sanitizedUrl) {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Check if problem already exists (by title and platform)
    let problem = await Problem.findOne({
      title: sanitizedTitle,
      platform: platform || "LeetCode",
    });

    // If problem doesn't exist, create it
    if (!problem) {
      problem = await Problem.create({
        title: sanitizedTitle,
        url: sanitizedUrl,
        category: sanitizedCategory,
        difficulty,
        platform: platform || "LeetCode",
      });
    }

    // Create or update user's progress on this problem
    const progressData = {
      userId,
      problemId: problem._id,
      status: status || "solved",
      notes: sanitizedNotes,
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

// GET /api/problems - Get all problems for the authenticated user with their progress
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Optional filter: solved, attempted, bookmarked
    const difficulty = searchParams.get("difficulty"); // Optional filter
    const platform = searchParams.get("platform"); // Optional filter
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Cap at 100
    const skip = Math.max(parseInt(searchParams.get("skip") || "0"), 0);

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
