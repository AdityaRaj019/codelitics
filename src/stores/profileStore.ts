import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LeetCodeProfile,
  LeetCodeUserInfo,
  fetchCompleteLeetCodeData,
  calculateStreak,
  calculateAcceptanceRate,
} from "@/lib/platforms";

interface PlatformData {
  username: string;
  profile: LeetCodeProfile | null;
  userInfo: LeetCodeUserInfo | null;
  lastFetched: string | null;
}

interface ProfileState {
  // Connected platforms
  leetcode: PlatformData | null;
  // Future platforms:
  // codeforces: PlatformData | null;
  // codechef: PlatformData | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  connectLeetCode: (usernameOrUrl: string) => Promise<void>;
  refreshLeetCode: () => Promise<void>;
  disconnectLeetCode: () => void;
  clearError: () => void;

  // Computed getters
  getTotalSolved: () => number;
  getStreak: () => number;
  getAcceptanceRate: () => number;
  getRanking: () => number;
  getRecentSubmissions: () => {
    title: string;
    titleSlug: string;
    status: string;
    timestamp: string;
    platform: string;
  }[];
  getDifficultyBreakdown: () => {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  getUserDisplayInfo: () => {
    name: string;
    username: string;
    avatar: string;
    country: string;
    school: string | null;
    skills: string[];
  } | null;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      leetcode: null,
      isLoading: false,
      error: null,

      connectLeetCode: async (usernameOrUrl: string) => {
        set({ isLoading: true, error: null });

        try {
          const { profile, userInfo } =
            await fetchCompleteLeetCodeData(usernameOrUrl);

          set({
            leetcode: {
              username: userInfo.username,
              profile,
              userInfo,
              lastFetched: new Date().toISOString(),
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to connect LeetCode account",
          });
          throw error;
        }
      },

      refreshLeetCode: async () => {
        const { leetcode } = get();
        if (!leetcode?.username) {
          set({ error: "No LeetCode account connected" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { profile, userInfo } = await fetchCompleteLeetCodeData(
            leetcode.username
          );

          set({
            leetcode: {
              username: userInfo.username,
              profile,
              userInfo,
              lastFetched: new Date().toISOString(),
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to refresh LeetCode data",
          });
        }
      },

      disconnectLeetCode: () => {
        set({ leetcode: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      getTotalSolved: () => {
        const { leetcode } = get();
        return leetcode?.profile?.totalSolved ?? 0;
      },

      getStreak: () => {
        const { leetcode } = get();
        if (!leetcode?.profile?.submissionCalendar) return 0;
        return calculateStreak(leetcode.profile.submissionCalendar);
      },

      getAcceptanceRate: () => {
        const { leetcode } = get();
        if (!leetcode?.profile) return 0;
        return calculateAcceptanceRate(leetcode.profile);
      },

      getRanking: () => {
        const { leetcode } = get();
        return leetcode?.profile?.ranking ?? 0;
      },

      getRecentSubmissions: () => {
        const { leetcode } = get();
        if (!leetcode?.profile?.recentSubmissions) return [];

        return leetcode.profile.recentSubmissions.slice(0, 10).map((sub) => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          status: sub.statusDisplay,
          timestamp: sub.timestamp,
          platform: "LeetCode",
        }));
      },

      getDifficultyBreakdown: () => {
        const { leetcode } = get();
        const profile = leetcode?.profile;

        return {
          easy: {
            solved: profile?.easySolved ?? 0,
            total: profile?.totalEasy ?? 0,
          },
          medium: {
            solved: profile?.mediumSolved ?? 0,
            total: profile?.totalMedium ?? 0,
          },
          hard: {
            solved: profile?.hardSolved ?? 0,
            total: profile?.totalHard ?? 0,
          },
        };
      },

      getUserDisplayInfo: () => {
        const { leetcode } = get();
        if (!leetcode?.userInfo) return null;

        return {
          name: leetcode.userInfo.name || leetcode.userInfo.username,
          username: leetcode.userInfo.username,
          avatar: leetcode.userInfo.avatar,
          country: leetcode.userInfo.country,
          school: leetcode.userInfo.school,
          skills: leetcode.userInfo.skillTags || [],
        };
      },
    }),
    {
      name: "profile-storage",
    }
  )
);
