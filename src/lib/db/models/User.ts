import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Only for credentials auth (hashed)
  image?: string;
  role: UserRole;

  // Stats (can be synced from platforms)
  totalSolved: number;
  rating: number;
  streak: number;

  // Platform connections
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  codechefUsername?: string;

  // Timestamps
  emailVerified?: Date;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Never return password by default
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Stats
    totalSolved: { type: Number, default: 0 },
    rating: { type: Number, default: 1000 },
    streak: { type: Number, default: 0 },

    // Platform usernames
    leetcodeUsername: { type: String },
    codeforcesUsername: { type: String },
    codechefUsername: { type: String },

    // Auth fields
    emailVerified: { type: Date },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
