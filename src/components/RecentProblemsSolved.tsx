interface RecentProblem {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  solvedDate: string;
  platform: string;
}

interface RecentProblemsSolvedProps {
  problems: RecentProblem[];
}

export default function RecentProblemsSolved({ problems }: RecentProblemsSolvedProps) {
  const categoryColors: Record<string, string> = {
    Array: "bg-blue-950 text-blue-400 border-blue-800",
    String: "bg-cyan-950 text-cyan-400 border-cyan-800",
    Search: "bg-green-950 text-green-400 border-green-800",
    Greedy: "bg-purple-950 text-purple-400 border-purple-800",
    DP: "bg-orange-950 text-orange-400 border-orange-800",
    Graph: "bg-pink-950 text-pink-400 border-pink-800",
    Tree: "bg-teal-950 text-teal-400 border-teal-800",
  };

  const difficultyColors: Record<string, string> = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  };

  const recentProblems = problems.slice(0, 5);

  return (
    <div className="bg-zinc-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-950 to-emerald-950 border-b border-gray-800">
        <h3 className="text-lg font-bold text-gray-200">✅ Recent Problems Solved</h3>
        <p className="text-sm text-gray-400">Your latest achievements</p>
      </div>
      
      {recentProblems.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-400 text-lg mb-2">No problems solved yet</p>
          <p className="text-gray-500 text-sm">Start solving problems to see them here!</p>
          <a
            href="/problems"
            className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Problems
          </a>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
        {recentProblems.map((problem) => (
          <div
            key={problem.id}
            className="p-4 hover:bg-zinc-800 transition-colors group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-200 mb-1 group-hover:text-indigo-400 transition-colors">
                  {problem.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {problem.solvedDate}
                  </span>
                  <span>•</span>
                  <span>{problem.platform}</span>
                </div>
              </div>
              <span className="text-green-500 text-xl ml-4">✓</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  categoryColors[problem.category] || "bg-gray-800 text-gray-300 border-gray-700"
                }`}
              >
                {problem.category}
              </span>
              <span
                className={`text-xs font-semibold ${
                  difficultyColors[problem.difficulty] || "text-gray-400"
                }`}
              >
                {problem.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
