import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Track Your DSA Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Master Data Structures & Algorithms with a modern, beautiful tracker.
            Monitor your progress, visualize stats, and unlock achievements.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Get Started →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Track DSA Progress
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Keep track of all your solved problems across multiple platforms.
              LeetCode, Codeforces, and more in one place.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Visualize Stats & Graphs
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Beautiful charts and graphs to visualize your progress over time.
              See your growth and identify areas to improve.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:scale-105 transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Earn Achievements
            </h3>
            <p className="text-gray-600 leading-relaxed">
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
          <Link
            href="/login"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Start Tracking Now
          </Link>
        </div>
      </section>
    </div>
  );
}