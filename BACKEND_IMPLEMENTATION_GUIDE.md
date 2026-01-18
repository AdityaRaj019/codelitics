# 🚀 Backend Implementation Plan - CodeLitics DSA Tracker

**Date:** 2026-01-18  
**Project:** CodeLitics - DSA Problem Tracker  
**Status:** Frontend Complete ✅ → Backend Implementation Phase  

---

## 📋 Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Technology Stack](#2-technology-stack)
3. [Phase 1: Database Setup (MongoDB Atlas)](#3-phase-1-database-setup-mongodb-atlas)
4. [Phase 2: Database Schemas (Mongoose)](#4-phase-2-database-schemas-mongoose)
5. [Phase 3: Authentication (NextAuth.js + OAuth 2.0)](#5-phase-3-authentication-nextauthjs--oauth-20)
6. [Phase 4: REST API Routes](#6-phase-4-rest-api-routes)
7. [Phase 5: Frontend Integration](#7-phase-5-frontend-integration)
8. [Security & Encryption Best Practices](#8-security--encryption-best-practices)
9. [Environment Variables](#9-environment-variables)
10. [Deployment Considerations](#10-deployment-considerations)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Overview & Architecture

### Current Architecture (Frontend Only)
```
┌─────────────────┐      ┌─────────────────┐
│   React/Next.js │ ──── │   LocalStorage  │
│   Components    │      │   (Zustand)     │
└─────────────────┘      └─────────────────┘
```

### Target Architecture (Full-Stack)
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React/Next.js │ ──── │  Next.js API    │ ──── │  MongoDB Atlas  │
│   Components    │      │  Routes         │      │  (Cloud DB)     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                       │
         │                       └── NextAuth.js (Sessions)
         │                                │
         └── Zustand (Sync Manager) ──────┘
                    │
                    └── OAuth 2.0 (Google/GitHub)
```

### Data Flow
1. User performs action (add problem, login, etc.)
2. Zustand action calls Next.js API route
3. API route validates request & session
4. MongoDB performs CRUD operation
5. Response sent back → Zustand updates UI

---

## 2. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Next.js 15 | Full-stack React framework |
| **Database** | MongoDB Atlas | Cloud NoSQL database |
| **ODM** | Mongoose 8.x | MongoDB object modeling |
| **Authentication** | NextAuth.js 5 | OAuth & credential auth |
| **OAuth Providers** | Google, GitHub | Social login |
| **Password Hashing** | bcrypt | Industry-standard hashing |
| **Validation** | Zod | Runtime type validation |
| **API Security** | CORS, Rate Limiting | Protection against attacks |

---

## 3. Phase 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new project: `codelitics`

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** tier (Shared)
3. Select cloud provider: **AWS** (or Google Cloud)
4. Select region closest to your users (e.g., Mumbai for India)
5. Cluster name: `codelitics-cluster`

### Step 3: Configure Database Access
1. Go to "Database Access" → Add New Database User
2. Create user:
   - Username: `codelitics-admin`
   - Password: Generate secure password (SAVE THIS!)
   - Role: `Atlas Admin` or `readWriteAnyDatabase`

### Step 4: Configure Network Access
1. Go to "Network Access" → Add IP Address
2. For development: Add `0.0.0.0/0` (Allow from anywhere)
3. For production: Add specific IPs or use VPC Peering

### Step 5: Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Copy connection string:
```
mongodb+srv://codelitics-admin:<password>@codelitics-cluster.xxxxx.mongodb.net/codelitics?retryWrites=true&w=majority
```

### Step 6: Install Dependencies
```bash
npm install mongoose @auth/mongodb-adapter mongodb
```

---

## 4. Phase 2: Database Schemas (Mongoose)

### Directory Structure
```
src/
├── lib/
│   └── db/
│       ├── connect.ts       # Database connection
│       └── models/
│           ├── User.ts      # User schema
│           ├── Problem.ts   # Problem schema
│           ├── Profile.ts   # Platform profiles
│           └── index.ts     # Export all models
```

### 4.1 Database Connection (`src/lib/db/connect.ts`)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

### 4.2 User Schema (`src/lib/db/models/User.ts`)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;        // Only for credentials auth
  image?: string;
  role: 'user' | 'admin';
  
  // Stats (can be fetched from LeetCode or calculated)
  totalSolved: number;
  rating: number;
  streak: number;
  
  // Platform connections
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  
  // Timestamps
  emailVerified?: Date;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false }, // Never return password by default
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    
    totalSolved: { type: Number, default: 0 },
    rating: { type: Number, default: 1000 },
    streak: { type: Number, default: 0 },
    
    leetcodeUsername: { type: String },
    codeforcesUsername: { type: String },
    
    emailVerified: { type: Date },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

### 4.3 Problem Schema (`src/lib/db/models/Problem.ts`)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;  // Reference to User
  
  title: string;
  link: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'LeetCode' | 'Codeforces' | 'CodeChef' | 'HackerRank' | 'GeeksforGeeks' | 'Other';
  
  solved: boolean;
  solvedDate?: Date;
  notes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    
    title: { type: String, required: true },
    link: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      required: true 
    },
    platform: { 
      type: String, 
      enum: ['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'Other'],
      default: 'LeetCode'
    },
    
    solved: { type: Boolean, default: false },
    solvedDate: { type: Date },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's problems
ProblemSchema.index({ userId: 1, createdAt: -1 });
ProblemSchema.index({ userId: 1, solved: 1 });

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
```

### 4.4 Platform Profile Schema (`src/lib/db/models/Profile.ts`)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  platform: 'leetcode' | 'codeforces' | 'codechef';
  username: string;
  
  // Cached stats from platform API
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ranking: number;
    acceptanceRate: number;
  };
  
  userInfo: {
    name: string;
    avatar: string;
    country: string;
    skills: string[];
  };
  
  lastSynced: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformProfileSchema = new Schema<IPlatformProfile>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    platform: { 
      type: String, 
      enum: ['leetcode', 'codeforces', 'codechef'],
      required: true 
    },
    username: { type: String, required: true },
    
    stats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
    },
    
    userInfo: {
      name: { type: String },
      avatar: { type: String },
      country: { type: String },
      skills: [{ type: String }],
    },
    
    lastSynced: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one profile per platform per user
PlatformProfileSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.models.PlatformProfile || 
  mongoose.model<IPlatformProfile>('PlatformProfile', PlatformProfileSchema);
```

---

## 5. Phase 3: Authentication (NextAuth.js + OAuth 2.0)

### 5.1 Install NextAuth.js
```bash
npm install next-auth@beta @auth/mongodb-adapter bcryptjs
npm install -D @types/bcryptjs
```

### 5.2 NextAuth Configuration (`src/auth.ts`)
```typescript
import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/db/mongodb';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // Google OAuth 2.0
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // GitHub OAuth 2.0
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password (Credentials)
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email })
          .select('+password');
        
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
});
```

### 5.3 API Route Handler (`src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

### 5.4 Setting Up OAuth Providers

#### Google OAuth 2.0 Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

#### GitHub OAuth 2.0 Setup:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: `CodeLitics`
   - Homepage URL: `http://localhost:3000` (or production URL)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

---

## 6. Phase 4: REST API Routes

### API Structure
```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth handlers
├── users/
│   ├── route.ts              # GET all users (admin), POST register
│   ├── [id]/
│   │   └── route.ts          # GET, PUT, DELETE specific user
│   └── me/
│       └── route.ts          # GET current user profile
├── problems/
│   ├── route.ts              # GET all, POST new problem
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE specific problem
├── profiles/
│   ├── route.ts              # GET connected profiles
│   ├── leetcode/
│   │   └── route.ts          # POST connect, DELETE disconnect
│   └── sync/
│       └── route.ts          # POST refresh stats from API
└── stats/
    └── route.ts              # GET dashboard statistics
```

### 6.1 User Registration API (`src/app/api/users/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/users - Register new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    await dbConnect();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password (10 rounds = ~10 hashes/sec, good balance)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });
    
    // Don't return password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    return NextResponse.json(userResponse, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6.2 Problems API (`src/app/api/problems/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Problem from '@/lib/db/models/Problem';
import { z } from 'zod';

// Validation schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  link: z.string().url('Invalid URL'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  platform: z.enum(['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'Other']),
  notes: z.string().optional(),
});

// GET /api/problems - Get all problems for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const problems = await Problem.find({ userId: session.user.id })
      .sort({ createdAt: -1 });
    
    return NextResponse.json(problems);
    
  } catch (error) {
    console.error('Get problems error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/problems - Create new problem
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate input
    const validation = problemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const problem = await Problem.create({
      userId: session.user.id,
      ...validation.data,
    });
    
    return NextResponse.json(problem, { status: 201 });
    
  } catch (error) {
    console.error('Create problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6.3 Toggle Problem Solved (`src/app/api/problems/[id]/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Problem from '@/lib/db/models/Problem';

// PATCH /api/problems/[id] - Update problem (toggle solved, add notes)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    await dbConnect();
    
    // Find problem and verify ownership
    const problem = await Problem.findOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    // Update fields
    if (typeof body.solved === 'boolean') {
      problem.solved = body.solved;
      problem.solvedDate = body.solved ? new Date() : undefined;
    }
    if (body.notes !== undefined) {
      problem.notes = body.notes;
    }
    
    await problem.save();
    
    return NextResponse.json(problem);
    
  } catch (error) {
    console.error('Update problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/problems/[id] - Delete problem
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const result = await Problem.deleteOne({
      _id: params.id,
      userId: session.user.id,
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Delete problem error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6.4 Connect LeetCode Profile (`src/app/api/profiles/leetcode/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import PlatformProfile from '@/lib/db/models/Profile';
import { fetchCompleteLeetCodeData } from '@/lib/platforms/leetcode';

// POST /api/profiles/leetcode - Connect LeetCode account
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { username } = await req.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    // Fetch data from LeetCode API
    const { profile, userInfo } = await fetchCompleteLeetCodeData(username);
    
    await dbConnect();
    
    // Upsert (update or insert) profile
    const platformProfile = await PlatformProfile.findOneAndUpdate(
      { userId: session.user.id, platform: 'leetcode' },
      {
        username: userInfo.username,
        stats: {
          totalSolved: profile.totalSolved,
          easySolved: profile.easySolved,
          mediumSolved: profile.mediumSolved,
          hardSolved: profile.hardSolved,
          ranking: profile.ranking,
          acceptanceRate: Math.round(
            (profile.matchedUserStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.submissions || 0) /
            (profile.matchedUserStats?.totalSubmissionNum?.find(s => s.difficulty === 'All')?.submissions || 1) * 100
          ),
        },
        userInfo: {
          name: userInfo.name,
          avatar: userInfo.avatar,
          country: userInfo.country,
          skills: userInfo.skillTags || [],
        },
        lastSynced: new Date(),
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(platformProfile);
    
  } catch (error) {
    console.error('Connect LeetCode error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect' },
      { status: 500 }
    );
  }
}
```

---

## 7. Phase 5: Frontend Integration

### 7.1 Update Zustand Stores

Transform from localStorage to API calls:

```typescript
// Before (localStorage)
addProblem: (problem) => set((state) => ({
  problems: [{ ...problem, id: Date.now() }, ...state.problems]
}))

// After (API calls)
addProblem: async (problemData) => {
  set({ isLoading: true });
  
  try {
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData),
    });
    
    if (!res.ok) throw new Error('Failed to add problem');
    
    const savedProblem = await res.json();
    set((state) => ({
      problems: [savedProblem, ...state.problems],
      isLoading: false,
    }));
    
    return savedProblem;
  } catch (error) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
}
```

### 7.2 Session Provider

Wrap app with NextAuth SessionProvider:

```typescript
// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### 7.3 Using Session in Components

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function LoginButton() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }
  
  return (
    <div>
      <button onClick={() => signIn('google')}>Sign in with Google</button>
      <button onClick={() => signIn('github')}>Sign in with GitHub</button>
    </div>
  );
}
```

---

## 8. Security & Encryption Best Practices

### 8.1 Password Hashing

| Method | Recommendation | Notes |
|--------|----------------|-------|
| **bcrypt** | ✅ Recommended | Industry standard, adaptive |
| **Argon2** | ✅ Best | Winner of Password Hashing Competition |
| **scrypt** | ✅ Good | Memory-hard function |
| **SHA-256** | ❌ Never | Too fast, vulnerable to brute force |
| **MD5** | ❌ Never | Broken, collision attacks |

**Implementation:**
```typescript
import bcrypt from 'bcryptjs';

// Hashing (registration)
const saltRounds = 12; // Higher = more secure but slower
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verification (login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 8.2 JWT Security

```typescript
// NextAuth handles JWT securely, but configure properly:
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days max
},

// Use strong secret (32+ random bytes)
// Generate: openssl rand -base64 32
secret: process.env.NEXTAUTH_SECRET,
```

### 8.3 API Security Measures

| Security Measure | Implementation |
|------------------|----------------|
| **HTTPS Only** | Force HTTPS in production |
| **Rate Limiting** | Use `@upstash/ratelimit` or similar |
| **Input Validation** | Validate all inputs with Zod |
| **SQL Injection** | N/A (MongoDB uses BSON) |
| **NoSQL Injection** | Sanitize user inputs, use Mongoose |
| **XSS Protection** | React escapes by default, sanitize HTML |
| **CSRF Protection** | NextAuth has built-in protection |
| **CORS** | Configure for production domains only |

### 8.4 Rate Limiting Example

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Continue with request...
}
```

### 8.5 Environment Variables Security

```bash
# .env.local (NEVER commit this file)
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-32-byte-secret-here
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

## 9. Environment Variables

### Required Variables
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Generate NEXTAUTH_SECRET
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32))
```

---

## 10. Deployment Considerations

### 10.1 Vercel Deployment (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### 10.2 MongoDB Atlas Security for Production

1. **Remove `0.0.0.0/0`** from Network Access
2. Add Vercel's static IPs or use MongoDB Atlas Private Endpoint
3. Use separate database for production vs development

### 10.3 Production Checklist

- [ ] HTTPS enabled
- [ ] Environment variables set in hosting platform
- [ ] MongoDB IP whitelist updated
- [ ] Rate limiting enabled
- [ ] Error logging configured (Sentry, etc.)
- [ ] Database backups scheduled
- [ ] Monitoring set up

---

## 11. Implementation Checklist

### Phase 1: Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (M0 free tier)
- [ ] Create database user
- [ ] Configure network access
- [ ] Get connection string
- [ ] Install mongoose package

### Phase 2: Database Schemas
- [ ] Create `src/lib/db/connect.ts`
- [ ] Create User model
- [ ] Create Problem model
- [ ] Create PlatformProfile model
- [ ] Test database connection

### Phase 3: Authentication
- [ ] Install NextAuth.js
- [ ] Configure NextAuth with MongoDB adapter
- [ ] Set up Google OAuth app
- [ ] Set up GitHub OAuth app
- [ ] Configure Credentials provider
- [ ] Test login flows

### Phase 4: API Routes
- [ ] POST `/api/users` - Registration
- [ ] GET `/api/problems` - List problems
- [ ] POST `/api/problems` - Add problem
- [ ] PATCH `/api/problems/[id]` - Toggle solved
- [ ] DELETE `/api/problems/[id]` - Delete problem
- [ ] POST `/api/profiles/leetcode` - Connect LeetCode
- [ ] GET `/api/users/me` - Get current user

### Phase 5: Frontend Integration
- [ ] Add SessionProvider to app
- [ ] Update authStore to use NextAuth
- [ ] Update problemStore to use API calls
- [ ] Update profileStore to use API calls
- [ ] Remove localStorage persistence
- [ ] Test all flows end-to-end

### Phase 6: Security & Polish
- [ ] Add rate limiting
- [ ] Add input validation (Zod)
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test security measures
- [ ] Deploy to Vercel

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Zod Documentation](https://zod.dev/)
- [bcrypt.js on npm](https://www.npmjs.com/package/bcryptjs)

---

**Estimated Implementation Time:** 3-5 days (depending on experience)

✅ **Ready to begin implementation!**
