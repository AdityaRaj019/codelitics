import mongoose, { Schema, Document, Model } from "mongoose";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform =
  | "LeetCode"
  | "Codeforces"
  | "CodeChef"
  | "HackerRank"
  | "GeeksforGeeks"
  | "Other";

export interface IProblem extends Document {
  _id: mongoose.Types.ObjectId;
  platform: Platform;
  title: string;
  difficulty: Difficulty;
  category: string;
  url: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
    },
    platform: {
      type: String,
      enum: [
        "LeetCode",
        "Codeforces",
        "CodeChef",
        "HackerRank",
        "GeeksforGeeks",
        "Other",
      ],
      default: "LeetCode",
      required: [true, "Platform is required"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Problem URL is required"],
      trim: true,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// Indexes for common queries
ProblemSchema.index({ platform: 1 });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ category: 1 });
ProblemSchema.index({ title: 1, platform: 1 }, { unique: true });

// Prevent model recompilation in development
const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem;
