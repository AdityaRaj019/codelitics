"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores";

export default function Home() {
  const { isAuthenticated, currentUser, isAdmin } = useAuthStore();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Track Your DSA Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Master Data Structures & Algorithms with a modern, beautiful
            tracker. Monitor your progress, visualize stats, and unlock
            achievements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/user"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Go to Dashboard →
                </Link>
                {isAdmin() && (
                  <Link
                    href="/dashboard/admin"
                    className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-zinc-700 hover:scale-105 transition-all border border-gray-200 dark:border-gray-700"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Get Started →
                </Link>
                <Link
                  href="/problems"
                  className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-zinc-700 hover:scale-105 transition-all border border-gray-200 dark:border-gray-700"
                >
                  Explore Problems
                </Link>
              </>
            )}
          </div>

          {/* Welcome message for logged in users */}
          {isAuthenticated && currentUser && (
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Welcome back, {currentUser.name}!
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Track DSA Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Keep track of all your solved problems across multiple platforms.
              LeetCode, Codeforces, and more in one place.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Visualize Stats & Graphs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Beautiful charts and graphs to visualize your progress over time.
              See your growth and identify areas to improve.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Earn Achievements
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Unlock badges and achievements as you progress. Stay motivated
              with milestones and consistency streaks.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Level Up Your DSA Skills?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of developers tracking their coding journey.
          </p>
          {isAuthenticated ? (
            <Link
              href="/problems"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Start Solving Problems
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
