import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "admin";
export type AuthProvider = "credentials" | "google" | "github";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Only for credentials auth (hashed)
  image?: string;
  authProvider: AuthProvider;
  role: UserRole;
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
    authProvider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// Indexes for faster queries
// Note: email index is already created by unique: true
UserSchema.index({ role: 1 });

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
