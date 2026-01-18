"use client";

import { useProfileStore } from "@/stores";

export default function RecentLeetCodeSubmissions() {
  const { getRecentSubmissions, leetcode } = useProfileStore();

  if (!leetcode) return null;

  const submissions = getRecentSubmissions();

  if (submissions.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "Wrong Answer":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      case "Time Limit Exceeded":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
      case "Runtime Error":
        return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
      case "Compile Error":
        return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          📝 Recent Submissions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your latest LeetCode activity
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {submissions.map((sub, index) => (
          <a
            key={`${sub.titleSlug}-${sub.timestamp}-${index}`}
            href={`https://leetcode.com/problems/${sub.titleSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-500 transition-colors">
                {sub.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(sub.timestamp)} • {sub.platform}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
            >
              {sub.status}
            </span>
          </a>
        ))}
      </div>

      {submissions.length > 0 && (
        <a
          href={`https://leetcode.com/u/${leetcode.username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border-t border-gray-200 dark:border-gray-800"
        >
          View all on LeetCode →
        </a>
      )}
    </div>
  );
}
