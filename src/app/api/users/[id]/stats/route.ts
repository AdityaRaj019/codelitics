import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { PlatformStats, UserProblemProgress } from "@/lib/db/models";

// GET /api/users/[id]/stats - Get aggregated stats for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await params;

    await dbConnect();

    // Get platform stats
    const platformStats = await PlatformStats.find({ userId });

    // Get problem progress stats
    const [solvedCount, attemptedCount, bookmarkedCount] = await Promise.all([
      UserProblemProgress.countDocuments({ userId, status: "solved" }),
      UserProblemProgress.countDocuments({ userId, status: "attempted" }),
      UserProblemProgress.countDocuments({ userId, status: "bookmarked" }),
    ]);

    // Get recent solved problems
    const recentSolved = await UserProblemProgress.find({
      userId,
      status: "solved",
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("problemId");

    // Aggregate platform data
    let totalSolved = 0;
    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;
    let bestRanking = 0;
    let longestStreak = 0;

    for (const stats of platformStats) {
      totalSolved += stats.totalSolved;
      totalEasy += stats.easy;
      totalMedium += stats.medium;
      totalHard += stats.hard;
      if (
        stats.ranking > 0 &&
        (bestRanking === 0 || stats.ranking < bestRanking)
      ) {
        bestRanking = stats.ranking;
      }
      if (stats.streak > longestStreak) {
        longestStreak = stats.streak;
      }
    }

    // Format recent problems
    const recentProblems = recentSolved
      .filter((progress) => progress.problemId)
      .map((progress) => {
        const problem = progress.problemId as unknown as {
          title: string;
          category: string;
          difficulty: string;
          platform: string;
        };
        return {
          title: problem.title,
          category: problem.category,
          difficulty: problem.difficulty,
          platform: problem.platform,
          solvedDate: progress.updatedAt,
        };
      });

    // Compile response
    const response = {
      overview: {
        totalSolved,
        manualProblems: solvedCount,
        attemptedCount,
        bookmarkedCount,
        ranking: bestRanking,
        streak: longestStreak,
      },
      difficulty: {
        easy: totalEasy,
        medium: totalMedium,
        hard: totalHard,
      },
      platforms: platformStats.map((stats) => ({
        platform: stats.platform,
        username: stats.username,
        totalSolved: stats.totalSolved,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
        ranking: stats.ranking,
        lastSyncedAt: stats.lastSyncedAt,
      })),
      recentProblems,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Get user stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get user stats" },
      { status: 500 },
    );
  }
}
