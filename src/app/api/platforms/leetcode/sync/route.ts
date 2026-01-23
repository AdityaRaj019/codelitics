import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { PlatformStats } from "@/lib/db/models";
import {
  fetchCompleteLeetCodeData,
  extractLeetCodeUsername,
  calculateStreak,
  calculateAcceptanceRate,
} from "@/lib/platforms";

// POST /api/platforms/leetcode/sync - Sync LeetCode data for a user
// This follows the workflow:
// 1. Frontend triggers sync
// 2. Backend route is hit
// 3. Backend calls LeetCode API
// 4. Backend transforms data
// 5. Backend stores it in MongoDB
// 6. Backend returns clean response
// 7. Frontend updates state
export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json();

    // Validate required fields
    if (!userId || !username) {
      return NextResponse.json(
        { success: false, error: "User ID and username are required" },
        { status: 400 },
      );
    }

    // Extract clean username
    const cleanUsername = extractLeetCodeUsername(username);

    // Step 3: Call LeetCode API
    const { profile, userInfo } =
      await fetchCompleteLeetCodeData(cleanUsername);

    // Step 4: Transform data
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

    // Step 5: Store in MongoDB (upsert)
    await dbConnect();

    const platformStats = await PlatformStats.findOneAndUpdate(
      { userId, platform: "leetcode" },
      platformStatsData,
      { upsert: true, new: true, runValidators: true },
    );

    // Step 6: Return clean response for frontend
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

// GET /api/platforms/leetcode/sync?userId=xxx - Get stored LeetCode data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

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

// DELETE /api/platforms/leetcode/sync - Disconnect LeetCode account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

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
