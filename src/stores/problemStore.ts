import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Problem {
  id: string;
  title: string;
  link: string;
  url: string;
  category: string;
  difficulty: string;
  platform: string;
  solved: boolean;
  solvedDate?: string;
  status: "solved" | "attempted" | "bookmarked";
  notes?: string;
  updatedAt?: string;
}

export interface RecentProblem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  solvedDate: string;
  platform: string;
}

interface ProblemState {
  problems: Problem[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };

  // Actions — userId removed; server uses session cookie
  fetchProblems: (filters?: {
    status?: string;
    difficulty?: string;
    platform?: string;
    limit?: number;
    skip?: number;
  }) => Promise<void>;

  addProblem: (problem: {
    title: string;
    url: string;
    category: string;
    difficulty: string;
    platform?: string;
    status?: string;
    notes?: string;
  }) => Promise<void>;

  updateProblem: (
    problemId: string,
    updates: {
      status?: string;
      notes?: string;
    },
  ) => Promise<void>;

  deleteProblem: (problemId: string) => Promise<void>;

  toggleSolved: (problemId: string) => Promise<void>;

  // Local getters
  getSolvedProblems: () => Problem[];
  getRecentlySolved: (limit?: number) => RecentProblem[];
  getTotalSolved: () => number;
  clearError: () => void;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      problems: [],
      isLoading: false,
      error: null,
      pagination: {
        total: 0,
        limit: 50,
        skip: 0,
        hasMore: false,
      },

      fetchProblems: async (filters = {}) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (filters.status) params.append("status", filters.status);
          if (filters.difficulty)
            params.append("difficulty", filters.difficulty);
          if (filters.platform) params.append("platform", filters.platform);
          if (filters.limit) params.append("limit", filters.limit.toString());
          if (filters.skip) params.append("skip", filters.skip.toString());

          const queryStr = params.toString();
          const response = await fetch(
            `/api/problems${queryStr ? `?${queryStr}` : ""}`,
          );
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to fetch problems");
          }

          set({
            problems: data.data.problems,
            pagination: data.data.pagination,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch problems",
          });
        }
      },

      addProblem: async (problem) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/problems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(problem),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to add problem");
          }

          // Add to local state
          const newProblem: Problem = {
            id: data.data.problem.id,
            title: data.data.problem.title,
            link: data.data.problem.url,
            url: data.data.problem.url,
            category: data.data.problem.category,
            difficulty: data.data.problem.difficulty,
            platform: data.data.problem.platform,
            solved: data.data.progress.status === "solved",
            solvedDate:
              data.data.progress.status === "solved"
                ? new Date(data.data.progress.updatedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )
                : undefined,
            status: data.data.progress.status,
            notes: data.data.progress.notes,
            updatedAt: data.data.progress.updatedAt,
          };

          set((state) => ({
            problems: [newProblem, ...state.problems],
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to add problem",
          });
          throw error;
        }
      },

      updateProblem: async (problemId, updates) => {
        try {
          const response = await fetch(`/api/problems/${problemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to update problem");
          }

          // Update local state
          set((state) => ({
            problems: state.problems.map((p) =>
              p.id === problemId
                ? {
                    ...p,
                    status: data.data.progress.status,
                    solved: data.data.progress.status === "solved",
                    solvedDate:
                      data.data.progress.status === "solved"
                        ? new Date(
                            data.data.progress.updatedAt,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : undefined,
                    notes: data.data.progress.notes,
                    updatedAt: data.data.progress.updatedAt,
                  }
                : p,
            ),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update problem",
          });
          throw error;
        }
      },

      deleteProblem: async (problemId) => {
        try {
          const response = await fetch(`/api/problems/${problemId}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to delete problem");
          }

          // Remove from local state
          set((state) => ({
            problems: state.problems.filter((p) => p.id !== problemId),
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete problem",
          });
          throw error;
        }
      },

      toggleSolved: async (problemId) => {
        const problem = get().problems.find((p) => p.id === problemId);
        if (!problem) return;

        const newStatus = problem.status === "solved" ? "attempted" : "solved";
        await get().updateProblem(problemId, { status: newStatus });
      },

      getSolvedProblems: () => get().problems.filter((p) => p.solved),

      getRecentlySolved: (limit = 5) => {
        const solved = get().problems.filter((p) => p.solved && p.solvedDate);
        return solved.slice(0, limit).map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          difficulty: p.difficulty,
          solvedDate: p.solvedDate || "",
          platform: p.platform,
        }));
      },

      getTotalSolved: () => get().problems.filter((p) => p.solved).length,

      clearError: () => set({ error: null }),
    }),
    {
      name: "problems-storage",
      version: 3, // Incremented to migrate from old schema
      migrate: (persistedState: unknown, version: number) => {
        if (version < 3) {
          return {
            problems: [],
            isLoading: false,
            error: null,
            pagination: { total: 0, limit: 50, skip: 0, hasMore: false },
          };
        }
        return persistedState as ProblemState;
      },
      partialize: (state) => ({
        problems: state.problems,
        pagination: state.pagination,
      }),
    },
  ),
);
