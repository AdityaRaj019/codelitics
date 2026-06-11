"use client";

import { useState } from "react";
import { useProfileStore, useAuthStore } from "@/stores";
import { Link2, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface ConnectPlatformProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function ConnectLeetCode({
  onSuccess,
  compact = false,
}: ConnectPlatformProps) {
  const { connectLeetCode, leetcode, isLoading, error, clearError } =
    useProfileStore();
  const { currentUser } = useAuthStore();
  const [input, setInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !currentUser) return;

    try {
      await connectLeetCode(input.trim());
      setInput("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  const isConnected = !!leetcode?.username;

  if (compact && isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span>Connected: {leetcode.username}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🔗</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Connect LeetCode
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sync your LeetCode progress
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span>Successfully connected!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Connected State */}
      {isConnected && !showSuccess && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <CheckCircle className="w-5 h-5" />
              <span>Connected as {leetcode.username}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {leetcode.lastSyncedAt
                ? `Last synced: ${new Date(leetcode.lastSyncedAt).toLocaleString()}`
                : ""}
            </span>
          </div>
        </div>
      )}

      {/* Connect Form */}
      <form onSubmit={handleConnect} className="flex gap-3">
        <div className="relative flex-1">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Username or profile URL"
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim() || !currentUser}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : isConnected ? (
            "Update"
          ) : (
            "Connect"
          )}
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Enter your LeetCode username or paste your profile URL (e.g.,
        leetcode.com/u/username)
      </p>
    </div>
  );
}
