// Script to seed an admin user in the database
// Run with: npx tsx src/scripts/seed-admin.ts
//
// Required environment variables in .env.local:
//   ADMIN_EMAIL    — email for the admin account
//   ADMIN_PASSWORD — password for the admin account (min 8 chars)

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error("Please set MONGODB_URI environment variable in .env.local");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables in .env.local",
  );
  console.error("Example:");
  console.error('  ADMIN_EMAIL=admin@example.com');
  console.error('  ADMIN_PASSWORD=your-secure-password');
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters long");
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

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log(`  Email: ${ADMIN_EMAIL}`);
      // SECURITY: Never log passwords
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, 12);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      authProvider: "credentials",
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log(`  ID: ${admin._id}`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    // SECURITY: Password is NOT logged

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
