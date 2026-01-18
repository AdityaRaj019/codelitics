import mongoose, { Schema, Document, Model } from "mongoose";

export type PlatformType = "leetcode" | "codeforces" | "codechef";

export interface IPlatformProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  platform: PlatformType;
  username: string;

  // Cached stats from platform API
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    ranking: number;
    acceptanceRate: number;
    contributionPoints: number;
  };

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

  lastSynced: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformProfileSchema = new Schema<IPlatformProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    platform: {
      type: String,
      enum: ["leetcode", "codeforces", "codechef"],
      required: [true, "Platform is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      totalEasy: { type: Number, default: 0 },
      totalMedium: { type: Number, default: 0 },
      totalHard: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      contributionPoints: { type: Number, default: 0 },
    },

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

    lastSynced: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one profile per platform per user
PlatformProfileSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Prevent model recompilation in development
const PlatformProfile: Model<IPlatformProfile> =
  mongoose.models.PlatformProfile ||
  mongoose.model<IPlatformProfile>("PlatformProfile", PlatformProfileSchema);

export default PlatformProfile;
