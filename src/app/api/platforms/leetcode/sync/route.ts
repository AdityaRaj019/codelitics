import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { PlatformStats } from "@/lib/db/models";
import {
  fetchCompleteLeetCodeData,
  extractLeetCodeUsername,
  calculateStreak,
  calculateAcceptanceRate,
} from "@/lib/platforms";
import { requireAuth } from "@/lib/auth";

// POST /api/platforms/leetcode/sync - Sync LeetCode data for the authenticated user
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    const { username } = await request.json();

    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { success: false, error: "LeetCode username is required" },
        { status: 400 },
      );
    }

    // Extract clean username
    const cleanUsername = extractLeetCodeUsername(username);

    // Call LeetCode API
    const { profile, userInfo } =
      await fetchCompleteLeetCodeData(cleanUsername);

    // Transform data
    const streak = calculateStreak(profile.submissionCalendar || {});
    const acceptanceRate = calculateAcceptanceRate(profile);

    const platformStatsData = {
      userId,
      platform: "leetcode" as const,
      username: cleanUsername,

      // Stats as per schema
      totalSolved: profile.totalSolved,
      easy: profile.easySolved,
      medium: profile.mediumSolved,
      hard: profile.hardSolved,
      rating: profile.ranking || 0,

      // Additional stats
      totalEasy: profile.totalEasy,
      totalMedium: profile.totalMedium,
      totalHard: profile.totalHard,
      ranking: profile.ranking,
      acceptanceRate,
      contributionPoints: profile.contributionPoint,
      streak,

      // User info
      userInfo: {
        name: userInfo.name || cleanUsername,
        avatar: userInfo.avatar,
        country: userInfo.country,
        school: userInfo.school || undefined,
        company: userInfo.company || undefined,
        skills: userInfo.skillTags || [],
        about: userInfo.about || undefined,
      },

      // Submission data
      submissionCalendar: profile.submissionCalendar,
      recentSubmissions: profile.recentSubmissions?.slice(0, 20),

      lastSyncedAt: new Date(),
    };

    // Store in MongoDB (upsert)
    await dbConnect();

    const platformStats = await PlatformStats.findOneAndUpdate(
      { userId, platform: "leetcode" },
      platformStatsData,
      { upsert: true, new: true, runValidators: true },
    );

    // Return clean response for frontend
    const response = {
      id: platformStats._id.toString(),
      userId: platformStats.userId.toString(),
      platform: platformStats.platform,
      username: platformStats.username,
      totalSolved: platformStats.totalSolved,
      easy: platformStats.easy,
      medium: platformStats.medium,
      hard: platformStats.hard,
      rating: platformStats.rating,
      totalEasy: platformStats.totalEasy,
      totalMedium: platformStats.totalMedium,
      totalHard: platformStats.totalHard,
      ranking: platformStats.ranking,
      acceptanceRate: platformStats.acceptanceRate,
      streak: platformStats.streak,
      userInfo: platformStats.userInfo,
      recentSubmissions: platformStats.recentSubmissions,
      lastSyncedAt: platformStats.lastSyncedAt,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("LeetCode sync error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to sync LeetCode data" },
      { status: 500 },
    );
  }
}

// GET /api/platforms/leetcode/sync - Get stored LeetCode data for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    await dbConnect();

    const platformStats = await PlatformStats.findOne({
      userId,
      platform: "leetcode",
    });

    if (!platformStats) {
      return NextResponse.json(
        { success: false, error: "No LeetCode data found" },
        { status: 404 },
      );
    }

    const response = {
      id: platformStats._id.toString(),
      userId: platformStats.userId.toString(),
      platform: platformStats.platform,
      username: platformStats.username,
      totalSolved: platformStats.totalSolved,
      easy: platformStats.easy,
      medium: platformStats.medium,
      hard: platformStats.hard,
      rating: platformStats.rating,
      totalEasy: platformStats.totalEasy,
      totalMedium: platformStats.totalMedium,
      totalHard: platformStats.totalHard,
      ranking: platformStats.ranking,
      acceptanceRate: platformStats.acceptanceRate,
      streak: platformStats.streak,
      userInfo: platformStats.userInfo,
      recentSubmissions: platformStats.recentSubmissions,
      lastSyncedAt: platformStats.lastSyncedAt,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Get LeetCode data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get LeetCode data" },
      { status: 500 },
    );
  }
}

// DELETE /api/platforms/leetcode/sync - Disconnect LeetCode account for the authenticated user
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Authenticate via session cookie
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    await dbConnect();

    await PlatformStats.findOneAndDelete({ userId, platform: "leetcode" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete LeetCode data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect LeetCode" },
      { status: 500 },
    );
  }
}
