"use client";

import { useState } from "react";

interface Problem {
  id: number;
  title: string;
  category: string;
  solved: boolean;
}

interface ProblemListProps {
  problems: Problem[];
}

export default function ProblemList({ problems: initialProblems }: ProblemListProps) {
  const [problems, setProblems] = useState(initialProblems);

  const toggleSolved = (id: number) => {
    setProblems((prev) =>
      prev.map((problem) =>
        problem.id === id ? { ...problem, solved: !problem.solved } : problem
      )
    );
  };

  const categoryColors: Record<string, string> = {
    Array: "bg-blue-950 text-blue-400",
    Search: "bg-green-950 text-green-400",
    Greedy: "bg-purple-950 text-purple-400",
    DP: "bg-orange-950 text-orange-400",
    Graph: "bg-pink-950 text-pink-400",
    Tree: "bg-teal-950 text-teal-400",
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 bg-zinc-950 border-b border-gray-800">
        <h3 className="text-lg font-bold text-gray-200">Problem List</h3>
        <p className="text-sm text-gray-400">Track your DSA progress</p>
      </div>
      
      <div className="divide-y divide-gray-800">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="p-4 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={problem.solved}
                onChange={() => toggleSolved(problem.id)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                aria-label={`Mark ${problem.title} as ${problem.solved ? 'unsolved' : 'solved'}`}
              />
              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    problem.solved
                      ? "text-gray-600 line-through"
                      : "text-gray-200"
                  }`}
                >
                  {problem.title}
                </h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  categoryColors[problem.category] || "bg-gray-800 text-gray-300"
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
    </div>
  );
}