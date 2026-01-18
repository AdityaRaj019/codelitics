export type UserCardProps = {
  name: string;
  rating: number;
  totalSolved: number;
};

export type StatCardProps = {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
};

export type AchievementCardProps = {
  title: string;
  date: string;
  icon?: string;
};

export type Problem = {
  id: number;
  title: string;
  link: string;
  category: string;
  difficulty: string;
  platform: string;
  solved: boolean;
  solvedDate?: string;
};

export type RecentProblem = {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  solvedDate: string;
  platform: string;
};

export type RecentProblemsSolvedProps = {
  problems: RecentProblem[];
};

// Legacy - ProblemList now uses Zustand store directly
export type ProblemListProps = {
  problems: Problem[];
};
