import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem, UserProblemProgress } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth";
import { isValidObjectId, sanitizeNotes } from "@/lib/validation";

// GET /api/problems/[id] - Get a specific problem with user progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: problemId } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(problemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid problem ID format" },
        { status: 400 },
      );
    }

    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    await dbConnect();

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return NextResponse.json(
        { success: false, error: "Problem not found" },
        { status: 404 },
      );
    }

    let progress = null;
    const userProgress = await UserProblemProgress.findOne({
      userId,
      problemId,
    });
    if (userProgress) {
      progress = {
        id: userProgress._id.toString(),
        status: userProgress.status,
        notes: userProgress.notes,
        updatedAt: userProgress.updatedAt,
      };
    }

    const response = {
      id: problem._id.toString(),
      title: problem.title,
      url: problem.url,
      link: problem.url,
      category: problem.category,
      difficulty: problem.difficulty,
      platform: problem.platform,
      progress,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Get problem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get problem" },
      { status: 500 },
    );
  }
}

// PATCH /api/problems/[id] - Update problem progress (toggle solved, update notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: problemId } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(problemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid problem ID format" },
        { status: 400 },
      );
    }

    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    const { status, notes } = await request.json();

    await dbConnect();

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { success: false, error: "Problem not found" },
        { status: 404 },
      );
    }

    // Update or create progress
    const updateData: { status?: string; notes?: string } = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = sanitizeNotes(notes);

    const progress = await UserProblemProgress.findOneAndUpdate(
      { userId, problemId },
      updateData,
      { upsert: true, new: true, runValidators: true },
    );

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

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Update problem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update problem" },
      { status: 500 },
    );
  }
}

// DELETE /api/problems/[id] - Remove problem from user's list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: problemId } = await params;

    // Validate ObjectId format
    if (!isValidObjectId(problemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid problem ID format" },
        { status: 400 },
      );
    }

    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    await dbConnect();

    // Remove user's progress only (problem stays in master list)
    await UserProblemProgress.findOneAndDelete({ userId, problemId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete problem error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete problem" },
      { status: 500 },
    );
  }
}
