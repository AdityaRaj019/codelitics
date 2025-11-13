"use client";

import { useState, useEffect } from "react";

interface Problem {
  id: number;
  title: string;
  link: string;
  category: string;
  difficulty: string;
  platform: string;
  solved: boolean;
  solvedDate?: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("Array");
  const [difficulty, setDifficulty] = useState("Easy");
  const [platform, setPlatform] = useState("LeetCode");

  useEffect(() => {
    const savedProblems = localStorage.getItem("problems");
    if (savedProblems) {
      setProblems(JSON.parse(savedProblems));
    }
  }, []);

  const saveToLocalStorage = (updatedProblems: Problem[]) => {
    localStorage.setItem("problems", JSON.stringify(updatedProblems));
  };

  const addProblem = () => {
    if (!title.trim() || !link.trim()) {
      alert("Please fill in both problem name and link");
      return;
    }

    const newProblem: Problem = {
      id: Date.now(),
      title: title.trim(),
      link: link.trim(),
      category,
      difficulty,
      platform,
      solved: false,
    };

    const updatedProblems = [newProblem, ...problems];
    setProblems(updatedProblems);
    saveToLocalStorage(updatedProblems);
    
    setTitle("");
    setLink("");
  };

  const toggleSolved = (id: number) => {
    const updatedProblems = problems.map((problem) =>
      problem.id === id
        ? {
            ...problem,
            solved: !problem.solved,
            solvedDate: !problem.solved ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : undefined,
          }
        : problem
    );
    setProblems(updatedProblems);
    saveToLocalStorage(updatedProblems);
  };

  const deleteProblem = (id: number) => {
    const updatedProblems = problems.filter((p) => p.id !== id);
    setProblems(updatedProblems);
    saveToLocalStorage(updatedProblems);
  };

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

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">
            Problem List 📝
          </h1>
          <p className="text-gray-400">
            Add and track all your DSA problems
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-gray-800 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-200 mb-4">
            Add New Problem
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Problem Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Two Sum"
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Problem Link *
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option>Array</option>
                <option>String</option>
                <option>Search</option>
                <option>Greedy</option>
                <option>DP</option>
                <option>Graph</option>
                <option>Tree</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option>LeetCode</option>
                <option>Codeforces</option>
                <option>HackerRank</option>
                <option>CodeChef</option>
                <option>GeeksforGeeks</option>
              </select>
            </div>
          </div>

          <button
            onClick={addProblem}
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Add Problem
          </button>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-zinc-950 border-b border-gray-800">
            <h3 className="text-lg font-bold text-gray-200">
              All Problems ({problems.length})
            </h3>
            <p className="text-sm text-gray-400">
              {problems.filter((p) => p.solved).length} solved • {problems.filter((p) => !p.solved).length} unsolved
            </p>
          </div>

          {problems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 text-lg">No problems yet</p>
              <p className="text-gray-500 text-sm">Add your first problem above to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-4 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={problem.solved}
                      onChange={() => toggleSolved(problem.id)}
                      className="w-5 h-5 mt-1 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold hover:text-indigo-400 transition-colors inline-flex items-center gap-2 ${
                              problem.solved
                                ? "text-gray-600 line-through"
                                : "text-gray-200"
                            }`}
                          >
                            {problem.title}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          {problem.solved && problem.solvedDate && (
                            <p className="text-sm text-gray-500 mt-1">
                              Solved on {problem.solvedDate}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteProblem(problem.id)}
                          className="text-red-400 hover:text-red-300 transition-colors ml-4"
                          aria-label="Delete problem"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <span className="text-xs text-gray-500">
                          {problem.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
