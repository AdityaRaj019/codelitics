"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore, useProfileStore, useProblemStore } from "@/stores";
import { Lock, RefreshCw } from "lucide-react";
import ConnectLeetCode from "@/components/ConnectLeetCode";
import LeetCodeStats from "@/components/LeetCodeStats";
import RecentLeetCodeSubmissions from "@/components/RecentLeetCodeSubmissions";
import StatCard from "@/components/StatCard";
import AchievementCard from "@/components/AchievementCard";

export default function UserDashboardPage() {
  const { currentUser, isAuthenticated } = useAuthStore();
  const {
    leetcode,
    getTotalSolved,
    getStreak,
    getAcceptanceRate,
    getRanking,
    refreshLeetCode,
    isLoading: profileLoading,
  } = useProfileStore();
  const { problems } = useProblemStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
  const totalSolved = isLeetCodeConnected ? getTotalSolved() : 0;
  const streak = isLeetCodeConnected ? getStreak() : 0;
  const acceptanceRate = isLeetCodeConnected ? getAcceptanceRate() : 0;
  const ranking = isLeetCodeConnected ? getRanking() : 0;

  // Calculate problems from local tracker
  const localSolvedCount = problems.filter((p) => p.solved).length;
  const todaysSolved = problems.filter((p) => {
    if (!p.solvedDate) return false;
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return p.solvedDate === today;
  }).length;

  // Dynamic user stats
  const userStats = [
    {
      icon: "🔥",
      label: "Current Streak",
      value: streak,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: "📊",
      label: "Problems Today",
      value: todaysSolved,
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: "⭐",
      label: "Ranking",
      value: ranking > 0 ? `#${ranking.toLocaleString()}` : "N/A",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: "🎯",
      label: "Acceptance",
      value: acceptanceRate > 0 ? `${acceptanceRate}%` : "N/A",
      color: "from-green-500 to-emerald-500",
    },
  ];

  // Dynamic achievements based on actual data
  const achievements = [];
  if (totalSolved >= 1) {
    achievements.push({
      id: 1,
      title: "First Blood",
      date: "Solved your first problem!",
      icon: "🩸",
    });
  }
  if (totalSolved >= 50) {
    achievements.push({
      id: 2,
      title: "50 Problems Solved",
      date: "Half century!",
      icon: "🎯",
    });
  }
  if (totalSolved >= 100) {
    achievements.push({
      id: 3,
      title: "Century",
      date: "100 problems solved!",
      icon: "💯",
    });
  }
  if (streak >= 7) {
    achievements.push({
      id: 4,
      title: "Week Warrior",
      date: "7 day streak!",
      icon: "⚔️",
    });
  }
  if (streak >= 30) {
    achievements.push({
      id: 5,
      title: "Month Master",
      date: "30 day streak!",
      icon: "🏆",
    });
  }

  const displayName = leetcode?.userInfo?.name || currentUser?.name || "Coder";
  const displayTotalSolved = totalSolved || localSolvedCount;

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
              Here&apos;s your DSA progress overview
            </p>
          </div>
          {isLeetCodeConnected && (
            <button
              onClick={() => currentUser?.id && refreshLeetCode(currentUser.id)}
              disabled={profileLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${profileLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>

        {/* Connect LeetCode Section */}
        {!isLeetCodeConnected && (
          <div className="mb-8">
            <ConnectLeetCode />
          </div>
        )}

        {/* Statistics Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Your Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userStats.map((stat, index) => (
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* LeetCode Stats & Recent Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {isLeetCodeConnected ? (
              <>
                <LeetCodeStats />
                <RecentLeetCodeSubmissions />
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Connect Your LeetCode
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Link your LeetCode account to see your complete stats,
                  difficulty breakdown, and recent submissions here.
                </p>
              </div>
            )}
          </div>

          {/* Achievements Sidebar */}
          <div>
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  🏆 Achievements
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your milestones
                </p>
              </div>
              <div className="p-4 space-y-4">
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🎯</div>
                    <p className="text-sm">
                      {isLeetCodeConnected
                        ? "Solve problems to unlock achievements!"
                        : "Connect LeetCode to start earning achievements"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/problems"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  ➕ Add New Problem
                </Link>
                {isLeetCodeConnected && (
                  <a
                    href={`https://leetcode.com/u/${leetcode.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-left px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    🔗 View LeetCode Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
          <p className="text-indigo-100 text-lg mb-6">
            You&apos;ve solved {displayTotalSolved} problems so far.
            {displayTotalSolved > 0
              ? " That's amazing progress! Keep up the momentum."
              : " Start solving to track your progress!"}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Next Milestone</span>
              <p className="text-xl font-bold">
                {displayTotalSolved < 50
                  ? "50 Problems"
                  : displayTotalSolved < 100
                    ? "100 Problems"
                    : displayTotalSolved < 250
                      ? "250 Problems"
                      : "500 Problems"}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Problems to go</span>
              <p className="text-xl font-bold">
                {displayTotalSolved < 50
                  ? `${50 - displayTotalSolved} more!`
                  : displayTotalSolved < 100
                    ? `${100 - displayTotalSolved} more!`
                    : displayTotalSolved < 250
                      ? `${250 - displayTotalSolved} more!`
                      : `${500 - displayTotalSolved} more!`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
