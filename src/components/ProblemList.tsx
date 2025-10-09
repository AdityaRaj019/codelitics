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
    Array: "bg-blue-100 text-blue-700",
    Search: "bg-green-100 text-green-700",
    Greedy: "bg-purple-100 text-purple-700",
    DP: "bg-orange-100 text-orange-700",
    Graph: "bg-pink-100 text-pink-700",
    Tree: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Problem List</h3>
        <p className="text-sm text-gray-500">Track your DSA progress</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="p-4 hover:bg-gray-50 transition-colors"
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
                      ? "text-gray-400 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {problem.title}
                </h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  categoryColors[problem.category] || "bg-gray-100 text-gray-700"
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