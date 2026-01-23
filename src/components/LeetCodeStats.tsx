"use client";

import Image from "next/image";
import { useProfileStore, useAuthStore } from "@/stores";

interface DifficultyProgressProps {
  label: string;
  solved: number;
  total: number;
  color: string;
}

function DifficultyProgress({
  label,
  solved,
  total,
  color,
}: DifficultyProgressProps) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="text-gray-600 dark:text-gray-400">
          {solved} / {total}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            label === "Easy"
              ? "bg-green-500"
              : label === "Medium"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function LeetCodeStats() {
  const {
    leetcode,
    isLoading,
    getTotalSolved,
    getStreak,
    getAcceptanceRate,
    getRanking,
    getDifficultyBreakdown,
    getUserDisplayInfo,
    refreshLeetCode,
  } = useProfileStore();
  const { currentUser } = useAuthStore();

  if (!leetcode) {
    return null;
  }

  const userInfo = getUserDisplayInfo();
  const difficulty = getDifficultyBreakdown();
  const totalSolved = getTotalSolved();
  const streak = getStreak();
  const acceptanceRate = getAcceptanceRate();
  const ranking = getRanking();

  const handleRefresh = async () => {
    if (!currentUser?.id) return;
    try {
      await refreshLeetCode(currentUser.id);
    } catch (error) {
      console.error("Failed to refresh LeetCode data:", error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userInfo?.avatar ? (
              <Image
                src={userInfo.avatar}
                alt={userInfo.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                LC
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                {userInfo?.name || leetcode.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{leetcode.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-white/50 dark:hover:bg-black/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {totalSolved}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Problems Solved
            </p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Day Streak
            </p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-green-500">
              {acceptanceRate}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Acceptance
            </p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
            <p className="text-2xl font-bold text-indigo-500">
              #{ranking.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ranking</p>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
            Difficulty Breakdown
          </h4>
          <DifficultyProgress
            label="Easy"
            solved={difficulty.easy.solved}
            total={difficulty.easy.total}
            color="text-green-500"
          />
          <DifficultyProgress
            label="Medium"
            solved={difficulty.medium.solved}
            total={difficulty.medium.total}
            color="text-yellow-500"
          />
          <DifficultyProgress
            label="Hard"
            solved={difficulty.hard.solved}
            total={difficulty.hard.total}
            color="text-red-500"
          />
        </div>

        {/* Skills */}
        {userInfo?.skills && userInfo.skills.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {userInfo.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last synced */}
        {leetcode.lastSyncedAt && (
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            Last synced: {new Date(leetcode.lastSyncedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
