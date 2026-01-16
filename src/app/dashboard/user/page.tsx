"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserCard from "@/components/UserCard";
import StatCard from "@/components/StatCard";
import AchievementCard from "@/components/AchievementCard";
import RecentProblemsSolved from "@/components/RecentProblemsSolved";
import { useProblemStore, useAuthStore } from "@/stores";
import { RecentProblem } from "@/types/global";
import { Lock } from "lucide-react";
import Link from "next/link";

// Mock stats data
const mockStats = [
  {
    icon: "🔥",
    label: "Current Streak",
    value: 12,
    color: "from-orange-500 to-red-500",
  },
  {
    icon: "📊",
    label: "Problems Today",
    value: 3,
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: "⭐",
    label: "Rating",
    value: 1850,
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: "🎯",
    label: "Accuracy",
    value: "94%",
    color: "from-green-500 to-emerald-500",
  },
];

// Mock achievements data
const mockAchievements = [
  { id: 1, title: "First Blood", date: "Jan 5, 2025", icon: "🩸" },
  { id: 2, title: "100 Problems Solved", date: "Dec 20, 2024", icon: "💯" },
  { id: 3, title: "Week Warrior", date: "Dec 15, 2024", icon: "⚔️" },
];

export default function UserDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuthStore();
  const { problems } = useProblemStore();
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [totalSolved, setTotalSolved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to allow hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const solved = problems.filter((p) => p.solved);
    setTotalSolved(solved.length);

    const recent: RecentProblem[] = solved
      .filter((p) => p.solvedDate)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        solvedDate: p.solvedDate || "",
        platform: p.platform,
      }));
    setRecentProblems(recent);
  }, [problems]);

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

  const displayName = currentUser.name;
  const displayRating = currentUser.rating;
  const displayTotalSolved = totalSolved || currentUser.totalSolved;

  // Dynamic stats based on user data
  const userStats = [
    {
      icon: "🔥",
      label: "Current Streak",
      value: currentUser.streak,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: "📊",
      label: "Problems Today",
      value: 3,
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: "⭐",
      label: "Rating",
      value: currentUser.rating,
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: "🎯",
      label: "Accuracy",
      value: "94%",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s your DSA progress overview
          </p>
        </div>

        {/* User Card */}
        <div className="mb-8">
          <UserCard
            name={displayName}
            rating={displayRating}
            totalSolved={displayTotalSolved}
          />
        </div>

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

        {/* Recent Problems & Achievements */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RecentProblemsSolved problems={recentProblems} />
          </div>

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
                {mockAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    title={achievement.title}
                    date={achievement.date}
                    icon={achievement.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
          <p className="text-indigo-100 text-lg mb-6">
            You&apos;ve solved {displayTotalSolved} problems so far. That&apos;s
            amazing progress! Keep up the momentum.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Next Milestone</span>
              <p className="text-xl font-bold">250 Problems</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Problems to go</span>
              <p className="text-xl font-bold">
                {Math.max(0, 250 - displayTotalSolved)} more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
