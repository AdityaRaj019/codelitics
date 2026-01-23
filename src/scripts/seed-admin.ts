// Script to seed an admin user in the database
// Run with: npx tsx src/scripts/seed-admin.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI environment variable in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    image: String,
    authProvider: { type: String, default: "credentials" },
    role: { type: String, default: "user" },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected!");

    const adminEmail = "admin@dsa.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      authProvider: "credentials",
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log(`  ID: ${admin._id}`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
