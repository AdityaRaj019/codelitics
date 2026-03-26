"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores";

export default function Home() {
  const { isAuthenticated, currentUser, isAdmin } = useAuthStore();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/dashboard/user"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Go to Dashboard →
                  </Link>
                </motion.div>
                {isAdmin() && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard/admin"
                      className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-gray-700 w-full sm:w-auto"
                    >
                      Admin Panel
                    </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Get Started →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/problems"
                    className="inline-block bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-gray-700 w-full sm:w-auto"
                  >
                    Explore Problems
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Welcome message for logged in users */}
          {isAuthenticated && currentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Welcome back, {currentUser.name}!
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Track DSA Progress",
              description:
                "Keep track of all your solved problems across multiple platforms. LeetCode, Codeforces, and more in one place.",
              icon: "📊",
              color: "from-indigo-500 to-indigo-600",
            },
            {
              title: "Visualize Stats & Graphs",
              description:
                "Beautiful charts and graphs to visualize your progress over time. See your growth and identify areas to improve.",
              icon: "📈",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              title: "Earn Achievements",
              description:
                "Unlock badges and achievements as you progress. Stay motivated with milestones and consistency streaks.",
              icon: "🏆",
              color: "from-purple-500 to-purple-600",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{
                y: -10,
                transition: { duration: 0.2 },
              }}
              className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Level Up Your DSA Skills?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of developers tracking their coding journey.
          </p>
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/problems"
                className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all"
              >
                Start Solving Problems
              </Link>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all"
              >
                Create Free Account
              </Link>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
