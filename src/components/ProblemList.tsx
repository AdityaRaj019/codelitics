"use client";

import { useProblemStore } from "@/stores";

export default function ProblemList() {
  const { problems, toggleSolved } = useProblemStore();

  const categoryColors: Record<string, string> = {
    Array: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    String: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
    Search: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
    Greedy:
      "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    DP: "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
    Graph: "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
    Tree: "bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400",
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="p-4 bg-gray-100 dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Problem List
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track your DSA progress
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-500 dark:text-gray-400">
            No problems added yet
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={problem.solved}
                  onChange={() => toggleSolved(problem.id)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 cursor-pointer"
                  aria-label={`Mark ${problem.title} as ${
                    problem.solved ? "unsolved" : "solved"
                  }`}
                />
                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      problem.solved
                        ? "text-gray-400 dark:text-gray-600 line-through"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {problem.title}
                  </h4>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    categoryColors[problem.category] ||
                    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {problem.category}
                </span>
                {problem.solved && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
