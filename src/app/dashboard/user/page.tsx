"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore, useProfileStore, useProblemStore } from "@/stores";
import { 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  PlayCircle, 
  Bookmark, 
  Activity, 
  Award,
  BookOpen
} from "lucide-react";
import LeetCodeStats from "@/components/LeetCodeStats";
import RecentLeetCodeSubmissions from "@/components/RecentLeetCodeSubmissions";
import StatCard from "@/components/StatCard";
import AchievementCard from "@/components/AchievementCard";

interface DBStats {
  overview: {
    totalSolved: number;
    manualProblems: number;
    attemptedCount: number;
    bookmarkedCount: number;
    ranking: number;
    streak: number;
  };
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  platforms: {
    platform: string;
    username: string;
    totalSolved: number;
    easy: number;
    medium: number;
    hard: number;
    ranking: number;
    lastSyncedAt: string;
  }[];
  recentProblems: {
    title: string;
    category: string;
    difficulty: string;
    platform: string;
    solvedDate: string;
  }[];
}

const categoryColors: Record<string, string> = {
  Array: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Matrix: "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
  String: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "Searching & Sorting": "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Linked List": "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "Binary Trees": "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  "Binary Search Trees": "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  Greedy: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  BackTracking: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "Stacks & Queues": "bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
  Heap: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  Graph: "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  Trie: "bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800",
  "Dynamic Programming": "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "Bit Manipulation": "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
};

const difficultyColors: Record<string, string> = {
  Easy: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800",
  Medium: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800",
  Hard: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800",
};

export default function UserDashboardPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const {
    leetcode,
    getTotalSolved,
    getStreak,
    connectLeetCode,
    refreshLeetCode,
    fetchLeetCode,
    isLoading: profileLoading,
  } = useProfileStore();
  
  const { problems, fetchProblems } = useProblemStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Database-driven platform statistics states
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Sync state variables
  const [lcUsernameInput, setLcUsernameInput] = useState("");
  const [gfgUsernameInput, setGfgUsernameInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Fetch dbStats from /api/users/[id]/stats
  const fetchDbStats = async () => {
    if (!currentUser?.id) return;
    try {
      setIsStatsLoading(true);
      const res = await fetch(`/api/users/${currentUser.id}/stats`);
      const data = await res.json();
      if (data.success) {
        setDbStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch database user stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Prefill input fields when platform data loads
  useEffect(() => {
    if (leetcode?.username) {
      setLcUsernameInput(leetcode.username);
    }
    const gfgProfile = dbStats?.platforms?.find((p) => p.platform === "geeksforgeeks");
    if (gfgProfile?.username) {
      setGfgUsernameInput(gfgProfile.username);
    }
  }, [leetcode, dbStats]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      fetchProblems();
      fetchLeetCode();
      fetchDbStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser]);

  const handleRefreshAll = async () => {
    if (leetcode?.username) {
      await refreshLeetCode();
    }
    await fetchDbStats();
  };

  const handleSyncAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lcUsernameInput.trim() && !gfgUsernameInput.trim()) {
      setSyncError("Please enter at least one username.");
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      // 1. Connect LeetCode store if username is new
      if (lcUsernameInput.trim() && lcUsernameInput.trim() !== leetcode?.username) {
        await connectLeetCode(lcUsernameInput.trim());
      }

      // 2. Call bulk sync API
      const res = await fetch("/api/problems/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: lcUsernameInput.trim() || undefined,
          gfgUsername: gfgUsernameInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSyncResult(
          `Successfully synced! Solved status updated for ${data.data.leetcodeSolvedImported} LeetCode problems and ${data.data.gfgSolvedImported} GeeksforGeeks problems.`
        );
        // Refresh stats
        await handleRefreshAll();
        await fetchProblems();
      } else {
        setSyncError(data.error || "Failed to sync solved problems.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setSyncError("Failed to sync solved problems. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Show loading state during hydration
  if (isLoading) {
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
            Please sign in to access your dashboard and track your DSA progress.
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

  // Calculate dynamic stats
  const isLeetCodeConnected = !!leetcode;
  const leetCodeSolved = isLeetCodeConnected ? getTotalSolved() : 0;
  const leetCodeStreak = isLeetCodeConnected ? getStreak() : 0;

  const gfgStats = dbStats?.platforms?.find((p) => p.platform === "geeksforgeeks");
  const isGfgConnected = !!gfgStats;
  const gfgSolved = isGfgConnected ? gfgStats.totalSolved : 0;

  // Local tracker stats
  const localSolvedCount = problems.filter((p) => p.status === "solved").length;
  const localAttemptingCount = problems.filter((p) => p.status === "attempted").length;
  const localBookmarkedCount = problems.filter((p) => p.status === "bookmarked").length;
  
  // Total solved overall (LeetCode + GFG + Local Solved)
  const combinedTotalSolved = leetCodeSolved + gfgSolved + localSolvedCount;
  
  // Overview Stats Bar
  const statsOverview = [
    {
      icon: "🎯",
      label: "Total Solved",
      value: combinedTotalSolved,
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: "🔠",
      label: "LeetCode Solved",
      value: leetCodeSolved,
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: "📋",
      label: "Local Tracker Solved",
      value: localSolvedCount,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: "🔥",
      label: "Current Streak",
      value: leetCodeStreak || dbStats?.overview?.streak || 0,
      color: "from-orange-500 to-red-500",
    },
  ];

  // Achievements milestones
  const achievements = [];
  if (combinedTotalSolved >= 1) {
    achievements.push({
      id: 1,
      title: "First Blood",
      date: "Solved your first problem!",
      icon: "🩸",
    });
  }
  if (combinedTotalSolved >= 50) {
    achievements.push({
      id: 2,
      title: "50 Problems Solved",
      date: "Half century reached!",
      icon: "🎯",
    });
  }
  if (combinedTotalSolved >= 100) {
    achievements.push({
      id: 3,
      title: "Century",
      date: "100 problems completed!",
      icon: "💯",
    });
  }
  if ((leetcode?.streak || 0) >= 7) {
    achievements.push({
      id: 4,
      title: "Week Warrior",
      date: "7 day coding streak!",
      icon: "⚔️",
    });
  }

  const displayName = leetcode?.userInfo?.name || currentUser?.name || "Coder";

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here is your DSA progress overview and connected platforms metrics.
            </p>
          </div>
          <button
            onClick={handleRefreshAll}
            disabled={profileLoading || isStatsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${profileLoading || isStatsLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Auto-Sync Panel */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-zinc-900/50 dark:to-zinc-900 border border-indigo-100 dark:border-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
              🔄
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Auto-Import Solved Questions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sync solved counts and automatically check off matching LeetCode and GeeksforGeeks problems in your checklist.
              </p>
            </div>
          </div>

          <form onSubmit={handleSyncAll} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  value={lcUsernameInput}
                  onChange={(e) => setLcUsernameInput(e.target.value)}
                  placeholder="e.g. lc_username"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  GeeksforGeeks Username
                </label>
                <input
                  type="text"
                  value={gfgUsernameInput}
                  onChange={(e) => setGfgUsernameInput(e.target.value)}
                  placeholder="e.g. gfg_username"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-955 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>

            {syncResult && (
              <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-700 dark:text-green-300 font-medium">
                {syncResult}
              </div>
            )}

            {syncError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {syncError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSyncing}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing Solved Progress...</span>
                </>
              ) : (
                <span>Sync Now</span>
              )}
            </button>
          </form>
        </div>

        {/* Overview Stats Bar */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Your Statistics Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsOverview.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                color={stat.color}
              />
            ))}
          </div>
        </div>

        {/* Dashboard Main Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Left Columns: Platform Statistics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* LeetCode Statistics Section */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span>🔠</span> LeetCode Statistics
                </h3>
                {isLeetCodeConnected && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-900">
                    Connected: @{leetcode?.username}
                  </span>
                )}
              </div>
              
              {isLeetCodeConnected ? (
                <div className="space-y-6">
                  <LeetCodeStats />
                  <RecentLeetCodeSubmissions />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📊</div>
                  <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                    LeetCode Profile Not Linked
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-500 max-w-sm mx-auto">
                    Connect your profile using the link button above to load and visualize your stats here.
                  </p>
                </div>
              )}
            </div>

            {/* Other Platforms Section */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span>🌐</span> Other Platforms Statistics
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Codeforces */}
                <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-full">
                      Inactive
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Codeforces</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Import stats, rating milestones, and global rankings from Codeforces.
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-3 mt-3">
                    <span>Rank: N/A</span>
                    <span>Rating: 0</span>
                  </div>
                </div>

                {/* GeeksforGeeks */}
                <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">🟢</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isGfgConnected 
                        ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200" 
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400"
                    }`}>
                      {isGfgConnected ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">GeeksforGeeks</h4>
                  {isGfgConnected ? (
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Username:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">@{gfgStats.username}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Solved:</span>
                        <span className="font-bold text-green-600">{gfgStats.totalSolved} problems</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-gray-100 dark:border-zinc-800">
                        <span>Easy: {gfgStats.easy || 0}</span>
                        <span>Medium: {gfgStats.medium || 0}</span>
                        <span>Hard: {gfgStats.hard || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Synchronize your GeeksforGeeks profile stats and solved checklists automatically.
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-3 mt-3">
                        <span>Rank: N/A</span>
                        <span>Solved: 0</span>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Local Track Details & History */}
          <div className="space-y-6">
            
            {/* Total Problems Did Section */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Total Problems Tracked</span>
              </h3>
              
              <div className="space-y-4">
                
                {/* Done Row */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Done (Solved)</span>
                  </div>
                  <span className="text-base font-extrabold text-green-600 dark:text-green-400">
                    {localSolvedCount}
                  </span>
                </div>

                {/* Attempting Row */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <PlayCircle className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attempting</span>
                  </div>
                  <span className="text-base font-extrabold text-orange-600 dark:text-orange-400">
                    {localAttemptingCount}
                  </span>
                </div>

                {/* Visited Row */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visited (Bookmarked)</span>
                  </div>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {localBookmarkedCount}
                  </span>
                </div>

                {/* Total Stats Tracker Info */}
                <div className="text-center bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Solving local checklist helps you prepare for interviews!
                </div>

              </div>
            </div>

            {/* Latest Problems Solved Section */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-green-500" />
                <span>Latest Solved Log</span>
              </h3>

              <div className="space-y-3">
                {dbStats?.recentProblems && dbStats.recentProblems.length > 0 ? (
                  dbStats.recentProblems.map((prob, idx) => (
                    <div 
                      key={idx}
                      className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                          {prob.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[prob.difficulty] || ""}`}>
                          {prob.difficulty}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        <span className={`px-2 py-0.5 rounded border ${categoryColors[prob.category] || "bg-gray-100 border-gray-200"}`}>
                          {prob.category}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] font-semibold text-indigo-500">{prob.platform}</span>
                        {prob.solvedDate && (
                          <>
                            <span>•</span>
                            <span>{new Date(prob.solvedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-3xl mb-1">💤</p>
                    <p className="text-xs">No problems marked as done yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" />
                <span>🏆 Achievements</span>
              </h3>
              <div className="space-y-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      title={achievement.title}
                      date={achievement.date}
                      icon={achievement.icon}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Solve problems to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2.5">
                <Link
                  href="/problems"
                  className="block w-full text-center py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-sm"
                >
                  ➕ Add Custom Problem
                </Link>
                <Link
                  href="/problem-list"
                  className="block w-full text-center py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                >
                  📋 Go to Problems Library
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
