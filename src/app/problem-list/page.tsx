"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  PlayCircle, 
  Bookmark, 
  Circle, 
  Lock 
} from "lucide-react";
import { useAuthStore } from "@/stores";

interface Problem {
  id: string;
  title: string;
  url: string;
  category: string;
  difficulty: string;
  platform: string;
  status?: "solved" | "attempted" | "bookmarked" | null;
}

interface StatusDropdownProps {
  status: "solved" | "attempted" | "bookmarked" | null | undefined;
  onStatusChange: (newStatus: "solved" | "attempted" | "bookmarked" | "none") => void;
  isAuthenticated: boolean;
}

function StatusDropdown({ status, onStatusChange, isAuthenticated }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center text-gray-400 dark:text-gray-600 gap-1 text-xs select-none">
        <Lock className="w-3.5 h-3.5" />
        <span>Login to track</span>
      </div>
    );
  }

  const statusConfig = {
    solved: {
      label: "Done",
      color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
      icon: CheckCircle2,
    },
    attempted: {
      label: "Attempting",
      color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
      icon: PlayCircle,
    },
    bookmarked: {
      label: "Visited",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
      icon: Bookmark,
    },
    none: {
      label: "Todo",
      color: "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-gray-800",
      icon: Circle,
    },
  };

  const current = status ? statusConfig[status] : statusConfig.none;
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all ${current.color}`}
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div 
            className="fixed inset-0 z-[998] cursor-default" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          {/* Menu */}
          <div 
            className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-[999] overflow-hidden divide-y divide-gray-100 dark:divide-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {(["none", "bookmarked", "attempted", "solved"] as const).map((key) => {
              const cfg = statusConfig[key];
              const Icon = cfg.icon;
              const isSelected = (key === "none" && !status) || status === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onStatusChange(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left font-medium transition-colors ${
                    isSelected 
                      ? "bg-gray-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const categoryIcons: Record<string, string> = {
  Array: "📦",
  Matrix: "🔢",
  String: "🔤",
  "Searching & Sorting": "🔎",
  "Linked List": "🔗",
  "Binary Trees": "🌳",
  "Binary Search Trees": "🌲",
  Greedy: "💰",
  BackTracking: "🔙",
  "Stacks & Queues": "📚",
  Heap: "⛰️",
  Graph: "🕸️",
  Trie: "🔡",
  "Dynamic Programming": "🧩",
  "Bit Manipulation": "⚡",
  Strings: "🔤",
  Maths: "🔢",
  DFS: "🌊",
  Tree: "🌳",
  "Hash Table": "🗂️",
  "Binary Search": "🔍",
  BFS: "🌐",
  "Two Pointer": "👆",
  Stack: "📚",
  "Sliding Window": "🪟",
};

const categoryColors: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string }> = {
  Array: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", darkBg: "dark:bg-blue-950/40", darkBorder: "dark:border-blue-800", darkText: "dark:text-blue-300" },
  Matrix: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", darkBg: "dark:bg-slate-950/40", darkBorder: "dark:border-slate-800", darkText: "dark:text-slate-300" },
  String: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", darkBg: "dark:bg-cyan-950/40", darkBorder: "dark:border-cyan-800", darkText: "dark:text-cyan-300" },
  "Searching & Sorting": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", darkBg: "dark:bg-orange-950/40", darkBorder: "dark:border-orange-800", darkText: "dark:text-orange-300" },
  "Linked List": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", darkBg: "dark:bg-purple-950/40", darkBorder: "dark:border-purple-800", darkText: "dark:text-purple-300" },
  "Binary Trees": { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", darkBg: "dark:bg-teal-950/40", darkBorder: "dark:border-teal-800", darkText: "dark:text-teal-300" },
  "Binary Search Trees": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", darkBg: "dark:bg-green-950/40", darkBorder: "dark:border-green-800", darkText: "dark:text-green-300" },
  Greedy: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", darkBg: "dark:bg-emerald-950/40", darkBorder: "dark:border-emerald-800", darkText: "dark:text-emerald-300" },
  BackTracking: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", darkBg: "dark:bg-amber-950/40", darkBorder: "dark:border-amber-800", darkText: "dark:text-amber-300" },
  "Stacks & Queues": { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", darkBg: "dark:bg-fuchsia-950/40", darkBorder: "dark:border-fuchsia-800", darkText: "dark:text-fuchsia-300" },
  Heap: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", darkBg: "dark:bg-red-950/40", darkBorder: "dark:border-red-800", darkText: "dark:text-red-300" },
  Graph: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", darkBg: "dark:bg-pink-950/40", darkBorder: "dark:border-pink-800", darkText: "dark:text-pink-300" },
  Trie: { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", darkBg: "dark:bg-lime-950/40", darkBorder: "dark:border-lime-800", darkText: "dark:text-lime-300" },
  "Dynamic Programming": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", darkBg: "dark:bg-orange-950/40", darkBorder: "dark:border-orange-800", darkText: "dark:text-orange-300" },
  "Bit Manipulation": { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", darkBg: "dark:bg-yellow-950/40", darkBorder: "dark:border-yellow-800", darkText: "dark:text-yellow-300" },
  Strings: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", darkBg: "dark:bg-cyan-950/40", darkBorder: "dark:border-cyan-800", darkText: "dark:text-cyan-300" },
  Maths: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", darkBg: "dark:bg-violet-950/40", darkBorder: "dark:border-violet-800", darkText: "dark:text-violet-300" },
  DFS: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", darkBg: "dark:bg-indigo-950/40", darkBorder: "dark:border-indigo-800", darkText: "dark:text-indigo-300" },
  Tree: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", darkBg: "dark:bg-teal-950/40", darkBorder: "dark:border-teal-800", darkText: "dark:text-teal-300" },
  "Hash Table": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", darkBg: "dark:bg-amber-950/40", darkBorder: "dark:border-amber-800", darkText: "dark:text-amber-300" },
  "Binary Search": { bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", darkBg: "dark:bg-lime-950/40", darkBorder: "dark:border-lime-800", darkText: "dark:text-lime-300" },
  BFS: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", darkBg: "dark:bg-sky-950/40", darkBorder: "dark:border-sky-800", darkText: "dark:text-sky-300" },
  "Two Pointer": { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", darkBg: "dark:bg-rose-950/40", darkBorder: "dark:border-rose-800", darkText: "dark:text-rose-300" },
  Stack: { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-700", darkBg: "dark:bg-fuchsia-950/40", darkBorder: "dark:border-fuchsia-800", darkText: "dark:text-fuchsia-300" },
  "Sliding Window": { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", darkBg: "dark:bg-yellow-950/40", darkBorder: "dark:border-yellow-800", darkText: "dark:text-yellow-300" },
};

const difficultyConfig: Record<string, { color: string; bg: string; darkBg: string }> = {
  Easy: { color: "text-green-600 dark:text-green-400", bg: "bg-green-100", darkBg: "dark:bg-green-900/40" },
  Medium: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100", darkBg: "dark:bg-yellow-900/40" },
  Hard: { color: "text-red-600 dark:text-red-400", bg: "bg-red-100", darkBg: "dark:bg-red-900/40" },
};

export default function ProblemListPage() {
  const { isAuthenticated } = useAuthStore();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Refetch problems when user logs in/out to update progress statuses
  useEffect(() => {
    fetchProblems();
  }, [isAuthenticated]);

  const handleStatusChange = async (problemId: string, newStatus: "solved" | "attempted" | "bookmarked" | "none") => {
    try {
      if (newStatus === "none") {
        // DELETE request resets progress/status
        const res = await fetch(`/api/problems/${problemId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          setProblems((prev) =>
            prev.map((p) => (p.id === problemId ? { ...p, status: null } : p))
          );
        } else {
          console.error("Failed to delete progress:", data.error);
        }
      } else {
        // PATCH request updates or inserts progress/status
        const res = await fetch(`/api/problems/${problemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
        if (data.success) {
          setProblems((prev) =>
            prev.map((p) => (p.id === problemId ? { ...p, status: newStatus } : p))
          );
        } else {
          console.error("Failed to update status:", data.error);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/problems/all");
      const data = await res.json();
      if (data.success) {
        setProblems(data.data);
        // Expand all categories by default
        const cats = new Set<string>(data.data.map((p: Problem) => p.category));
        setExpandedCategories(cats);
      } else {
        setError("Failed to fetch problems");
      }
    } catch {
      setError("Failed to fetch problems");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesDifficulty = difficultyFilter === "All" || p.difficulty === difficultyFilter;
      const matchesSearch = searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });
  }, [problems, difficultyFilter, searchQuery]);

  const groupedProblems = useMemo(() => {
    const groups: Record<string, Problem[]> = {};
    filteredProblems.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [filteredProblems]);

  const categoryOrder = [
    // DSA Sheet categories
    "Array", "Matrix", "String", "Searching & Sorting", "Linked List",
    "Binary Trees", "Binary Search Trees", "Greedy", "BackTracking",
    "Stacks & Queues", "Heap", "Graph", "Trie", "Dynamic Programming",
    "Bit Manipulation",
    // LeetCode-specific categories
    "Strings", "Maths", "DFS", "Tree", "Hash Table",
    "Binary Search", "BFS", "Two Pointer", "Stack",
    "Sliding Window",
  ];

  const sortedCategories = [
    ...categoryOrder.filter((c) => groupedProblems[c]),
    ...Object.keys(groupedProblems).filter((c) => !categoryOrder.includes(c)),
  ];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const expandAll = () => setExpandedCategories(new Set(sortedCategories));
  const collapseAll = () => setExpandedCategories(new Set());

  const totalCount = filteredProblems.length;
  const easyCount = filteredProblems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = filteredProblems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = filteredProblems.filter((p) => p.difficulty === "Hard").length;

  const userSolvedCount = problems.filter((p) => p.status === "solved").length;
  const userAttemptedCount = problems.filter((p) => p.status === "attempted").length;
  const userBookmarkedCount = problems.filter((p) => p.status === "bookmarked").length;
  const totalProblemsCount = problems.length;
  const completionPercentage = totalProblemsCount > 0 ? Math.round((userSolvedCount / totalProblemsCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={fetchProblems} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Problem List 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalCount} curated DSA problems across {sortedCategories.length} categories
          </p>
        </div>

        {/* User Progress Dashboard */}
        {isAuthenticated && (
          <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">📈</span>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Progress Dashboard</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Keep coding! You have marked <span className="font-semibold text-green-600 dark:text-green-400">{userSolvedCount}</span> as Done, <span className="font-semibold text-orange-600 dark:text-orange-400">{userAttemptedCount}</span> as Attempting, and <span className="font-semibold text-blue-600 dark:text-blue-400">{userBookmarkedCount}</span> as Visited.
                </p>
                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900 w-24 h-24 rounded-2xl flex-shrink-0 shadow-sm">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase mt-0.5">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{easyCount}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Easy</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumCount}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{hardCount}</p>
            <p className="text-sm text-red-600 dark:text-red-400">Hard</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Difficulty Tabs */}
          <div className="flex gap-2 bg-gray-100 dark:bg-zinc-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  difficultyFilter === d
                    ? d === "Easy"
                      ? "bg-green-500 text-white shadow-sm"
                      : d === "Medium"
                      ? "bg-yellow-500 text-white shadow-sm"
                      : d === "Hard"
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Expand/Collapse */}
          <div className="flex gap-2">
            <button onClick={expandAll} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
              Expand All
            </button>
            <button onClick={collapseAll} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const catProblems = groupedProblems[category];
            const isExpanded = expandedCategories.has(category);
            const colors = categoryColors[category] || categoryColors["Array"];
            const icon = categoryIcons[category] || "📋";
            const eCount = catProblems.filter((p) => p.difficulty === "Easy").length;
            const mCount = catProblems.filter((p) => p.difficulty === "Medium").length;
            const hCount = catProblems.filter((p) => p.difficulty === "Hard").length;

            return (
              <div
                key={category}
                className={`rounded-xl border overflow-visible transition-all duration-200 ${colors.border} ${colors.darkBorder} ${colors.bg} ${colors.darkBg}`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className={`w-5 h-5 ${colors.text} ${colors.darkText}`} />
                    ) : (
                      <ChevronRight className={`w-5 h-5 ${colors.text} ${colors.darkText}`} />
                    )}
                    <span className="text-xl">{icon}</span>
                    <h2 className={`text-lg font-bold ${colors.text} ${colors.darkText}`}>
                      {category}
                    </h2>
                    <span className={`text-sm font-medium ${colors.text} ${colors.darkText} opacity-70`}>
                      ({catProblems.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    {eCount > 0 && <span className="text-green-600 dark:text-green-400">{eCount} Easy</span>}
                    {mCount > 0 && <span className="text-yellow-600 dark:text-yellow-400">{mCount} Medium</span>}
                    {hCount > 0 && <span className="text-red-600 dark:text-red-400">{hCount} Hard</span>}
                  </div>
                </button>

                {/* Problem List */}
                {isExpanded && (
                  <div className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-gray-800 rounded-b-xl">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                      {catProblems.map((problem, idx) => {
                        const dc = difficultyConfig[problem.difficulty] || difficultyConfig.Easy;
                        const isLast = idx === catProblems.length - 1;
                        return (
                          <div
                            key={problem.id}
                            className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group ${
                              isLast ? "rounded-b-xl" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <span className="text-sm text-gray-400 dark:text-gray-600 w-8 text-right font-mono">
                                {idx + 1}
                              </span>
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-800 dark:text-gray-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate flex items-center gap-2"
                              >
                                {problem.title}
                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </a>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${dc.color} ${dc.bg} ${dc.darkBg}`}>
                                {problem.difficulty}
                              </span>
                              <StatusDropdown
                                status={problem.status}
                                onStatusChange={(newStatus) => handleStatusChange(problem.id, newStatus)}
                                isAuthenticated={isAuthenticated}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No problems found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
