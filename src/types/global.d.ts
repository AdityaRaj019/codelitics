// User Card Props
export type UserCardProps = {
  name: string;
  rating: number;
  totalSolved: number;
};

// Stat Card Props
export type StatCardProps = {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
};

// Achievement Card Props
export type AchievementCardProps = {
  title: string;
  date: string;
  icon?: string;
};

// Problem type - matches the schema
export type Problem = {
  id: string;
  title: string;
  link: string;
  url: string;
  category: string;
  difficulty: string;
  platform: string;
  solved: boolean;
  solvedDate?: string;
  status: "solved" | "attempted" | "bookmarked";
  notes?: string;
  updatedAt?: string;
};

// Recent problem for display
export type RecentProblem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  solvedDate: string;
  platform: string;
};

// Props types for components
export type RecentProblemsSolvedProps = {
  problems: RecentProblem[];
};

export type ProblemListProps = {
  problems: Problem[];
};

// Platform stats type - matches PlatformStats schema
export type PlatformStatsData = {
  id: string;
  userId: string;
  platform: "leetcode" | "codeforces" | "codechef";
  username: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number;
  acceptanceRate: number;
  streak: number;
  userInfo: {
    name: string;
    avatar: string;
    country: string;
    school?: string;
    company?: string;
    skills: string[];
    about?: string;
  } | null;
  recentSubmissions: {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }[];
  lastSyncedAt: string;
};

// User type - matches User schema
export type UserData = {
  id: string;
  name: string;
  email: string;
  image?: string;
  authProvider: "credentials" | "google" | "github";
  role: "user" | "admin";
  createdAt: string;
};
