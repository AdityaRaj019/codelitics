"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, AuthUser } from "@/stores";
import {
  ChevronRight,
  Users,
  Activity,
  TrendingUp,
  X,
  Lock,
  Shield,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isAdmin, registeredUsers } =
    useAuthStore();
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
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
            Please sign in to access the admin dashboard.
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

  // Show access denied if not admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&apos;t have permission to access the admin dashboard. This
            area is restricted to administrators only.
          </p>
          <Link
            href="/dashboard/user"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Filter out admin users - only show regular users
  const users = registeredUsers.filter((u) => u.role !== "admin");
  const totalUsers = users.length;
  const totalProblemsSolved = users.reduce((sum, u) => sum + u.totalSolved, 0);
  const avgRating =
    totalUsers > 0
      ? Math.round(users.reduce((sum, u) => sum + u.rating, 0) / totalUsers)
      : 0;
  const activeToday = users.filter(
    (u) => u.lastActive === new Date().toISOString().split("T")[0]
  ).length;

  const getActivityStatus = (lastActive: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    if (lastActive === today)
      return { text: "Active today", color: "text-green-500" };
    if (lastActive === yesterday)
      return { text: "Active yesterday", color: "text-yellow-500" };
    return { text: "Inactive", color: "text-gray-500" };
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 2000)
      return {
        text: "Expert",
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      };
    if (rating >= 1800)
      return {
        text: "Advanced",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
    if (rating >= 1500)
      return {
        text: "Intermediate",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    return {
      text: "Beginner",
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
              Admin Dashboard
            </h1>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full">
              Admin
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor user activity and progress
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-indigo-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Active Today</p>
                <p className="text-3xl font-bold">{activeToday}</p>
              </div>
              <Activity className="w-10 h-10 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Problems Solved</p>
                <p className="text-3xl font-bold">{totalProblemsSolved}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold">{avgRating}</p>
              </div>
              <span className="text-4xl">⭐</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-100 dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Registered Users ({totalUsers})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalUsers > 0
                ? "Click on a user to view details"
                : "Users will appear here when they register"}
            </p>
          </div>

          {totalUsers === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No Users Yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                When users register on the platform, they will appear here. You
                can monitor their progress, stats, and activity.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => {
                const activity = getActivityStatus(user.lastActive);
                const ratingBadge = getRatingBadge(user.rating);

                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                              {user.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Solved
                            </p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {user.totalSolved}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Streak
                            </p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              🔥 {user.streak}
                            </p>
                          </div>
                          <div className="text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${ratingBadge.color}`}
                            >
                              {ratingBadge.text}
                            </span>
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-sm font-medium ${activity.color}`}
                            >
                              {activity.text}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {selectedUser.name}
                      </h2>
                      {selectedUser.role === "admin" && (
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedUser.rating}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Problems Solved
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {selectedUser.totalSolved}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Streak
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      🔥 {selectedUser.streak}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 capitalize">
                      {selectedUser.role}
                    </p>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Activity & Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">
                        Last Active
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedUser.lastActive}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">
                        Joined
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedUser.joinedAt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400">
                        Level
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          getRatingBadge(selectedUser.rating).color
                        }`}
                      >
                        {getRatingBadge(selectedUser.rating).text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`font-medium ${
                          getActivityStatus(selectedUser.lastActive).color
                        }`}
                      >
                        {getActivityStatus(selectedUser.lastActive).text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Progress to Next Milestone
                  </h3>
                  <div className="relative">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (selectedUser.totalSolved / 500) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{selectedUser.totalSolved} solved</span>
                      <span>500 (Legend)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
