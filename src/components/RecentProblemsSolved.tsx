import { RecentProblemsSolvedProps } from "@/types/global";

export default function RecentProblemsSolved({
  problems,
}: RecentProblemsSolvedProps) {
  const difficultyColors: Record<string, string> = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };

  const categoryColors: Record<string, string> = {
    Array:
      "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    String:
      "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    Search:
      "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    Greedy:
      "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    DP: "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    Graph:
      "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
    Tree: "bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          ✅ Recently Solved
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your latest conquests
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-500 dark:text-gray-400">
            No problems solved yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start solving problems to see them here!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {problem.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        categoryColors[problem.category] ||
                        "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {problem.category}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        difficultyColors[problem.difficulty] || "text-gray-500"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      • {problem.platform}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {problem.solvedDate}
                  </p>
                  <span className="text-green-500 text-lg">✓</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
