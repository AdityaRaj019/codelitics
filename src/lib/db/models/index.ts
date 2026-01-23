// Database Models - Following the schema structure:
// users, platformStats, problems, userProblemProgress

export {
  default as User,
  type IUser,
  type UserRole,
  type AuthProvider,
} from "./User";
export {
  default as PlatformStats,
  type IPlatformStats,
  type PlatformType,
} from "./PlatformStats";
export {
  default as Problem,
  type IProblem,
  type Difficulty,
  type Platform,
} from "./Problem";
export {
  default as UserProblemProgress,
  type IUserProblemProgress,
  type ProblemStatus,
} from "./UserProblemProgress";
