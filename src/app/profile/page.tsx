"use client";

import { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import StatCard from "@/components/StatCard";
import AchievementCard from "@/components/AchievementCard";
import RecentProblemsSolved from "@/components/RecentProblemsSolved";

const mockUser = { 
  name: "Aditya Raj", 
  rating: 1800, 
  totalSolved: 245 
};

interface Problem {
  id: number;
  title: string;
  link: string;
  category: string;
  difficulty: string;
  platform: string;
  solved: boolean;
  solvedDate: string;
}

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

export default function ProfilePage() {
  const [recentProblems, setRecentProblems] = useState<Problem[]>([]);
  const [totalSolved, setTotalSolved] = useState(0);

  useEffect(() => {
    const savedProblems = localStorage.getItem("problems");
    if (savedProblems) {
      const allProblems: Problem[] = JSON.parse(savedProblems);
      const solvedProblems = allProblems.filter((p) => p.solved && p.solvedDate);
      const sortedByDate = solvedProblems.sort((a, b) => {
        return new Date(b.solvedDate!).getTime() - new Date(a.solvedDate!).getTime();
      });
      setRecentProblems(sortedByDate);
      setTotalSolved(solvedProblems.length);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">
            Welcome back, {mockUser.name}! 👋
          </h1>
          <p className="text-gray-400">
            Here&#39;s your DSA progress overview
          </p>
        </div>

        <div className="mb-8">
          <UserCard
            name={mockUser.name}
            rating={mockUser.rating}
            totalSolved={totalSolved || mockUser.totalSolved}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">
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

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RecentProblemsSolved problems={recentProblems} />
          </div>

          <div>
            <div className="bg-zinc-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-amber-950 to-orange-950 border-b border-gray-800">
                <h3 className="text-lg font-bold text-gray-200">
                  🏆 Achievements
                </h3>
                <p className="text-sm text-gray-400">Your milestones</p>
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

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Keep Going! 💪</h2>
          <p className="text-indigo-100 text-lg mb-6">
            You&#39;ve solved {totalSolved || mockUser.totalSolved} problems so far. 
            That&#39;s amazing progress! Keep up the momentum.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Next Milestone</span>
              <p className="text-xl font-bold">250 Problems</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-sm text-indigo-100">Problems to go</span>
              <p className="text-xl font-bold">{250 - (totalSolved || mockUser.totalSolved)} more!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
