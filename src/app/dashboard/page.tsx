import UserCard from "@/components/UserCard";
import StatCard from "@/components/StatCard";
import AchievementCard from "@/components/AchievementCard";
import ProblemList from "@/components/ProblemList";

// Mock Data
const mockUser = { 
  name: "Aditya Raj", 
  rating: 1800, 
  totalSolved: 245 
};

const mockProblems = [
  { id: 1, title: "Two Sum", category: "Array", solved: true },
  { id: 2, title: "Binary Search", category: "Search", solved: false },
  { id: 3, title: "Merge Intervals", category: "Greedy", solved: true },
  { id: 4, title: "Longest Common Subsequence", category: "DP", solved: false },
  { id: 5, title: "Graph Traversal BFS", category: "Graph", solved: true },
  { id: 6, title: "Binary Tree Inorder", category: "Tree", solved: false },
];

const mockAchievements = [
  { id: 1, title: "100 Problems Solved", date: "2025-08-20", icon: "🎯" },
  { id: 2, title: "Consistency Streak: 30 Days", date: "2025-09-05", icon: "🔥" },
  { id: 3, title: "Array Master", date: "2025-09-15", icon: "⚡" },
  { id: 4, title: "First Contest Win", date: "2025-10-01", icon: "🏆" },
];

const mockStats = [
  { icon: "💻", label: "LeetCode Solved", value: 120, color: "indigo" },
  { icon: "🌟", label: "Codeforces Rating", value: 1500, color: "emerald" },
  { icon: "📝", label: "Daily Streak", value: "30 days", color: "purple" },
  { icon: "🎓", label: "Topics Covered", value: 15, color: "orange" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {mockUser.name}! 👋
          </h1>
          <p className="text-gray-600">
            Here&#39;s your DSA progress overview
          </p>
        </div>

        {/* User Card */}
        <div className="mb-8">
          <UserCard
            name={mockUser.name}
            rating={mockUser.rating}
            totalSolved={mockUser.totalSolved}
          />
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockStats.map((stat, index) => (
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

        {/* Problems and Achievements */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Problem List */}
          <div className="lg:col-span-2">
            <ProblemList problems={mockProblems} />
          </div>

          {/* Achievements */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  🏆 Achievements
                </h3>
                <p className="text-sm text-gray-600">Your milestones</p>
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

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
          <p className="text-indigo-100 text-lg mb-6">
            You&#39;ve solved {mockUser.totalSolved} problems so far. 
            That&#39;s amazing progress! Keep up the momentum.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Next Milestone</span>
              <p className="text-xl font-bold">250 Problems</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Problems to go</span>
              <p className="text-xl font-bold">5 more!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}