// Types for platform profile data

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface DifficultyStats {
  difficulty: string;
  count: number;
  submissions: number;
}

export interface LeetCodeProfile {
  totalSolved: number;
  totalSubmissions: DifficultyStats[];
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  ranking: number;
  contributionPoint: number;
  reputation: number;
  submissionCalendar: Record<string, number>;
  recentSubmissions: LeetCodeSubmission[];
  matchedUserStats: {
    acSubmissionNum: DifficultyStats[];
    totalSubmissionNum: DifficultyStats[];
  };
}

export interface LeetCodeUserInfo {
  username: string;
  name: string;
  birthday: string;
  avatar: string;
  ranking: number;
  reputation: number;
  gitHub: string | null;
  twitter: string | null;
  linkedIN: string | null;
  website: string[];
  country: string;
  company: string | null;
  school: string | null;
  skillTags: string[];
  about: string;
}

export interface PlatformProfile {
  platform: "leetcode" | "codeforces" | "codechef" | "geeksforgeeks";
  username: string;
  userInfo: LeetCodeUserInfo | null;
  stats: LeetCodeProfile | null;
  lastFetched: string | null;
  error: string | null;
}

// Unified stats interface for dashboard display
export interface UnifiedStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number;
  reputation: number;
  streak: number;
  contributionPoints: number;
  acceptanceRate: number;
  recentSubmissions: {
    title: string;
    difficulty: string;
    status: string;
    timestamp: Date;
    platform: string;
    link: string;
  }[];
}
