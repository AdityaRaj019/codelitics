import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Problem, RecentProblem } from "@/types/global";

interface ProblemState {
  problems: Problem[];
  addProblem: (problem: Omit<Problem, "id">) => void;
  toggleSolved: (id: number) => void;
  deleteProblem: (id: number) => void;
  getSolvedProblems: () => Problem[];
  getRecentlySolved: (limit?: number) => RecentProblem[];
  getTotalSolved: () => number;
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      problems: [],

      addProblem: (problem) =>
        set((state) => ({
          problems: [
            {
              ...problem,
              id: Date.now(),
            },
            ...state.problems,
          ],
        })),

      toggleSolved: (id) =>
        set((state) => ({
          problems: state.problems.map((problem) =>
            problem.id === id
              ? {
                  ...problem,
                  solved: !problem.solved,
                  solvedDate: !problem.solved
                    ? new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : undefined,
                }
              : problem
          ),
        })),

      deleteProblem: (id) =>
        set((state) => ({
          problems: state.problems.filter((p) => p.id !== id),
        })),

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
    }),
    {
      name: "problems-storage",
    }
  )
);
