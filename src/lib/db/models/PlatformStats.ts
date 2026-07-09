import mongoose, { Schema, Document, Model } from "mongoose";

export type PlatformType = "leetcode" | "codeforces" | "codechef" | "geeksforgeeks";

export interface IPlatformStats extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  platform: PlatformType;
  username: string;

  // Stats
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  rating: number;

  // Additional stats for display
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number;
  acceptanceRate: number;
  contributionPoints: number;
  streak: number;

  // User info from platform
  userInfo: {
    name: string;
    avatar: string;
    country: string;
    school?: string;
    company?: string;
    skills: string[];
    about?: string;
  };

  // Submission calendar for streak/heatmap
  submissionCalendar?: Record<string, number>;

  // Recent submissions
  recentSubmissions?: {
    title: string;
    titleSlug: string;
    timestamp: string;
    statusDisplay: string;
    lang: string;
  }[];

  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformStatsSchema = new Schema<IPlatformStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    platform: {
      type: String,
      enum: ["leetcode", "codeforces", "codechef", "geeksforgeeks"],
      required: [true, "Platform is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    // Stats
    totalSolved: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // Additional stats
    totalEasy: { type: Number, default: 0 },
    totalMedium: { type: Number, default: 0 },
    totalHard: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    contributionPoints: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },

    userInfo: {
      name: { type: String },
      avatar: { type: String },
      country: { type: String },
      school: { type: String },
      company: { type: String },
      skills: [{ type: String }],
      about: { type: String },
    },

    submissionCalendar: {
      type: Map,
      of: Number,
    },

    recentSubmissions: [
      {
        title: String,
        titleSlug: String,
        timestamp: String,
        statusDisplay: String,
        lang: String,
      },
    ],

    lastSyncedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Unique constraint: one profile per platform per user
PlatformStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Prevent model recompilation in development
const PlatformStats: Model<IPlatformStats> =
  mongoose.models.PlatformStats ||
  mongoose.model<IPlatformStats>("PlatformStats", PlatformStatsSchema);

export default PlatformStats;
