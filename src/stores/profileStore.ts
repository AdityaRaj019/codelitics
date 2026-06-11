import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for LeetCode data
interface LeetCodeUserInfo {
  name: string;
  avatar: string;
  country: string;
  school?: string;
  company?: string;
  skills: string[];
  about?: string;
}

interface RecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

interface PlatformData {
  id: string;
  userId: string;
  platform: string;
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number;
  acceptanceRate: number;
  streak: number;
  userInfo: LeetCodeUserInfo | null;
  recentSubmissions: RecentSubmission[];
  lastSyncedAt: string | null;
}

interface ProfileState {
  // Connected platforms
  leetcode: PlatformData | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions (userId removed — server derives it from session cookie)
  connectLeetCode: (usernameOrUrl: string) => Promise<void>;
  refreshLeetCode: () => Promise<void>;
  fetchLeetCode: () => Promise<void>;
  disconnectLeetCode: () => Promise<void>;
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

      // Connect LeetCode account — session cookie provides user identity
      connectLeetCode: async (usernameOrUrl: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/platforms/leetcode/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: usernameOrUrl }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to connect LeetCode account");
          }

          set({
            leetcode: data.data,
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

      // Refresh data from backend (session cookie provides user identity)
      refreshLeetCode: async () => {
        const { leetcode } = get();
        if (!leetcode?.username) {
          set({ error: "No LeetCode account connected" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/platforms/leetcode/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: leetcode.username }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to refresh LeetCode data");
          }

          set({
            leetcode: data.data,
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

      // Fetch existing data from database (session cookie provides user identity)
      fetchLeetCode: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/platforms/leetcode/sync");
          const data = await response.json();

          if (data.success) {
            set({ leetcode: data.data, isLoading: false });
          } else {
            // No data found, but not an error
            set({ leetcode: null, isLoading: false });
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch LeetCode data",
          });
        }
      },

      disconnectLeetCode: async () => {
        try {
          await fetch("/api/platforms/leetcode/sync", {
            method: "DELETE",
          });
          set({ leetcode: null, error: null });
        } catch (error) {
          console.error("Failed to disconnect LeetCode:", error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getTotalSolved: () => {
        const { leetcode } = get();
        return leetcode?.totalSolved ?? 0;
      },

      getStreak: () => {
        const { leetcode } = get();
        return leetcode?.streak ?? 0;
      },

      getAcceptanceRate: () => {
        const { leetcode } = get();
        return leetcode?.acceptanceRate ?? 0;
      },

      getRanking: () => {
        const { leetcode } = get();
        return leetcode?.ranking ?? 0;
      },

      getRecentSubmissions: () => {
        const { leetcode } = get();
        if (!leetcode?.recentSubmissions) return [];

        return leetcode.recentSubmissions.slice(0, 10).map((sub) => ({
          title: sub.title,
          titleSlug: sub.titleSlug,
          status: sub.statusDisplay,
          timestamp: sub.timestamp,
          platform: "LeetCode",
        }));
      },

      getDifficultyBreakdown: () => {
        const { leetcode } = get();

        return {
          easy: {
            solved: leetcode?.easy ?? 0,
            total: leetcode?.totalEasy ?? 0,
          },
          medium: {
            solved: leetcode?.medium ?? 0,
            total: leetcode?.totalMedium ?? 0,
          },
          hard: {
            solved: leetcode?.hard ?? 0,
            total: leetcode?.totalHard ?? 0,
          },
        };
      },

      getUserDisplayInfo: () => {
        const { leetcode } = get();
        if (!leetcode?.userInfo) return null;

        return {
          name: leetcode.userInfo.name || leetcode.username,
          username: leetcode.username,
          avatar: leetcode.userInfo.avatar,
          country: leetcode.userInfo.country,
          school: leetcode.userInfo.school || null,
          skills: leetcode.userInfo.skills || [],
        };
      },
    }),
    {
      name: "profile-storage",
      version: 3, // Incremented to migrate from old schema
      migrate: (persistedState: unknown, version: number) => {
        if (version < 3) {
          // Clear old profile data to use new cookie-based format
          return {
            leetcode: null,
            isLoading: false,
            error: null,
          };
        }
        return persistedState as ProfileState;
      },
      partialize: (state) => ({
        leetcode: state.leetcode,
      }),
    },
  ),
);
