"use client";

import { useState, useEffect } from "react";
import { useProblemStore, useAuthStore } from "@/stores";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function ProblemsPage() {
  const {
    problems,
    addProblem,
    toggleSolved,
    deleteProblem,
    fetchProblems,
    isLoading,
  } = useProblemStore();
  const { currentUser, isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("Array");
  const [difficulty, setDifficulty] = useState("Easy");
  const [platform, setPlatform] = useState("LeetCode");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch problems on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch problems when user is available
  useEffect(() => {
    if (currentUser?.id) {
      fetchProblems(currentUser.id);
    }
  }, [currentUser?.id, fetchProblems]);

  const handleAddProblem = async () => {
    if (!title.trim() || !link.trim()) {
      alert("Please fill in both problem name and link");
      return;
    }

    if (!currentUser?.id) {
      alert("Please login to add problems");
      return;
    }

    setIsSubmitting(true);
    try {
      await addProblem(currentUser.id, {
        title: title.trim(),
        url: link.trim(),
        category,
        difficulty,
        platform,
        status: "solved",
      });

      setTitle("");
      setLink("");
    } catch (error) {
      console.error("Failed to add problem:", error);
      alert("Failed to add problem. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleToggleSolved = async (problemId: string) => {
    if (!currentUser?.id) return;
    try {
      await toggleSolved(currentUser.id, problemId);
    } catch (error) {
      console.error("Failed to toggle problem:", error);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!currentUser?.id) return;
    try {
      await deleteProblem(currentUser.id, problemId);
    } catch (error) {
      console.error("Failed to delete problem:", error);
    }
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

  const difficultyColors: Record<string, string> = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };

  const solvedCount = problems.filter((p) => p.solved).length;
  const unsolvedCount = problems.filter((p) => !p.solved).length;

  // Show loading state during hydration
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to track your problems.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Problem List 📝
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add and track all your DSA problems
          </p>
        </div>

        {/* Add Problem Form */}
        <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Add New Problem
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Problem Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Two Sum"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Problem Link *
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
            onClick={handleAddProblem}
            disabled={isSubmitting}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Adding..." : "Add Problem"}
          </button>
        </div>

        {/* Problems List */}
        <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="p-4 bg-gray-100 dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              All Problems ({problems.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {solvedCount} solved • {unsolvedCount} unsolved
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Loading problems...
              </p>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No problems yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Add your first problem above to get started!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={problem.solved}
                      onChange={() => handleToggleSolved(problem.id)}
                      className="w-5 h-5 mt-1 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <a
                            href={problem.link || problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-semibold hover:text-indigo-500 transition-colors inline-flex items-center gap-2 ${
                              problem.solved
                                ? "text-gray-400 dark:text-gray-600 line-through"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {problem.title}
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                          {problem.solved && problem.solvedDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              Solved on {problem.solvedDate}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteProblem(problem.id)}
                          className="text-red-500 hover:text-red-400 transition-colors ml-4"
                          aria-label="Delete problem"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            categoryColors[problem.category] ||
                            "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {problem.category}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            difficultyColors[problem.difficulty] ||
                            "text-gray-500"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
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
