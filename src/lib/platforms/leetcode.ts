// LeetCode API helper functions

import { LeetCodeProfile, LeetCodeUserInfo } from "./types";

const LEETCODE_API_BASE = "https://alfa-leetcode-api.onrender.com";

/**
 * Extract username from LeetCode profile URL or return as-is if already a username
 */
export function extractLeetCodeUsername(input: string): string {
  // Remove trailing slashes
  const cleaned = input.trim().replace(/\/+$/, "");

  // Check if it's a URL
  if (cleaned.includes("leetcode.com")) {
    // Handle various URL formats:
    // https://leetcode.com/u/username
    // https://leetcode.com/username
    // leetcode.com/u/username
    const urlPattern = /leetcode\.com\/(?:u\/)?([^\/\?]+)/i;
    const match = cleaned.match(urlPattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Already a username
  return cleaned;
}

/**
 * Fetch LeetCode user info (name, avatar, skills, etc.)
 * Endpoint: /:username
 */
export async function fetchLeetCodeUserInfo(
  username: string
): Promise<LeetCodeUserInfo> {
  const cleanUsername = extractLeetCodeUsername(username);
  const response = await fetch(`${LEETCODE_API_BASE}/${cleanUsername}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${cleanUsername}" not found on LeetCode`);
    }
    throw new Error(
      `Failed to fetch LeetCode user info: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as LeetCodeUserInfo;
}

/**
 * Fetch LeetCode profile statistics (totalSolved, difficulty breakdown, etc.)
 * Endpoint: /:username/profile
 */
export async function fetchLeetCodeProfile(
  username: string
): Promise<LeetCodeProfile> {
  const cleanUsername = extractLeetCodeUsername(username);
  const response = await fetch(`${LEETCODE_API_BASE}/${cleanUsername}/profile`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User "${cleanUsername}" not found on LeetCode`);
    }
    throw new Error(`Failed to fetch LeetCode profile: ${response.statusText}`);
  }

  const data = await response.json();
  return data as LeetCodeProfile;
}

/**
 * Fetch complete LeetCode data (both user info and profile stats)
 */
export async function fetchCompleteLeetCodeData(username: string): Promise<{
  profile: LeetCodeProfile;
  userInfo: LeetCodeUserInfo;
}> {
  const cleanUsername = extractLeetCodeUsername(username);

  // Fetch both in parallel
  const [userInfo, profile] = await Promise.all([
    fetchLeetCodeUserInfo(cleanUsername),
    fetchLeetCodeProfile(cleanUsername),
  ]);

  return { profile, userInfo };
}

/**
 * Calculate streak from submission calendar
 */
export function calculateStreak(
  submissionCalendar: Record<string, number>
): number {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
    return 0;
  }

  // Get all dates sorted in descending order
  const timestamps = Object.keys(submissionCalendar)
    .map(Number)
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  // Check if there's a submission today or yesterday
  const dayInSeconds = 86400;
  let currentStreak = 0;
  let checkDate = todayTimestamp;

  // Allow for yesterday if no submission today
  const latestSubmission = timestamps[0];
  if (latestSubmission < todayTimestamp - dayInSeconds) {
    return 0; // Streak is broken
  }

  // Count consecutive days
  for (const timestamp of timestamps) {
    if (
      timestamp >= checkDate - dayInSeconds &&
      timestamp < checkDate + dayInSeconds
    ) {
      currentStreak++;
      checkDate = timestamp - dayInSeconds;
    } else if (timestamp < checkDate - dayInSeconds) {
      break;
    }
  }

  return currentStreak;
}

/**
 * Calculate acceptance rate from stats
 */
export function calculateAcceptanceRate(profile: LeetCodeProfile): number {
  const allStats = profile.matchedUserStats?.totalSubmissionNum?.find(
    (s) => s.difficulty === "All"
  );
  const acceptedStats = profile.matchedUserStats?.acSubmissionNum?.find(
    (s) => s.difficulty === "All"
  );

  if (!allStats || !acceptedStats || allStats.submissions === 0) {
    return 0;
  }

  return Math.round((acceptedStats.submissions / allStats.submissions) * 100);
}
