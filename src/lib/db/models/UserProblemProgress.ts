import mongoose, { Schema, Document, Model } from "mongoose";

export type ProblemStatus = "solved" | "attempted" | "bookmarked";

export interface IUserProblemProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  status: ProblemStatus;
  notes?: string;
  updatedAt: Date;
  createdAt: Date;
}

const UserProblemProgressSchema = new Schema<IUserProblemProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["solved", "attempted", "bookmarked"],
      required: [true, "Status is required"],
      default: "solved",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Unique constraint: one progress entry per user per problem
UserProblemProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// Compound indexes for common queries
UserProblemProgressSchema.index({ userId: 1, status: 1 });
UserProblemProgressSchema.index({ userId: 1, updatedAt: -1 });

// Prevent model recompilation in development
const UserProblemProgress: Model<IUserProblemProgress> =
  mongoose.models.UserProblemProgress ||
  mongoose.model<IUserProblemProgress>(
    "UserProblemProgress",
    UserProblemProgressSchema,
  );

export default UserProblemProgress;
