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
  userId: mongoose.Types.ObjectId; // Reference to User

  title: string;
  link: string;
  category: string;
  difficulty: Difficulty;
  platform: Platform;

  solved: boolean;
  solvedDate?: Date;
  notes?: string;
  tags?: string[];

  // For custom lists
  listId?: mongoose.Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "Problem link is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
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
    },

    solved: { type: Boolean, default: false },
    solvedDate: { type: Date },
    notes: { type: String },
    tags: [{ type: String }],

    listId: {
      type: Schema.Types.ObjectId,
      ref: "ProblemList",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
ProblemSchema.index({ userId: 1, createdAt: -1 });
ProblemSchema.index({ userId: 1, solved: 1 });
ProblemSchema.index({ userId: 1, difficulty: 1 });
ProblemSchema.index({ userId: 1, category: 1 });

// Prevent model recompilation in development
const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem;
