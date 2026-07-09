import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Problem, UserProblemProgress, PlatformStats, IProblem } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth";

// Title Normalization Helper (removes spaces, capitalization, punctuation)
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Slug Extraction Helper from GFG or LeetCode URLs
function extractSlug(url: string): string {
  try {
    const clean = url.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const parts = clean.split("/");
    let slug = parts[parts.length - 1];
    
    if (slug === "0" || slug === "1" || slug === "2" || slug.match(/^\d+$/)) {
      slug = parts[parts.length - 2];
    }
    
    if (parts.includes("problems")) {
      const idx = parts.indexOf("problems");
      if (idx < parts.length - 1) {
        slug = parts[idx + 1];
      }
    }
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  } catch {
    return "";
  }
}

// POST /api/problems/sync - Bulk import and auto-mark solved problems from LeetCode/GFG
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult.userId;

    const { leetcodeUsername, gfgUsername } = await request.json();

    if (!leetcodeUsername && !gfgUsername) {
      return NextResponse.json(
        { success: false, error: "Provide at least one username (LeetCode or GFG)" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Load all problems in the database for local in-memory matching (faster than individual DB calls)
    const allDbProblems = await Problem.find({});
    
    // Create quick lookup indexes
    const dbProblemsByNormalizedTitle = new Map<string, IProblem>();
    const dbProblemsBySlug = new Map<string, IProblem>();
    
    allDbProblems.forEach((p) => {
      const normTitle = normalizeTitle(p.title);
      dbProblemsByNormalizedTitle.set(normTitle, p);
      
      const slug = extractSlug(p.url);
      if (slug) {
        dbProblemsBySlug.set(slug, p);
      }
    });

    let leetcodeSyncedCount = 0;
    let gfgSyncedCount = 0;

    // ────────────────────────────────────────────────────────
    // 1. SYNC LEETCODE SOLVED PROBLEMS
    // ────────────────────────────────────────────────────────
    if (leetcodeUsername) {
      try {
        // Fetch up to 300 accepted submissions
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${leetcodeUsername}/acSubmission?limit=300`);
        if (res.ok) {
          const data = await res.json();
          const submissions = data.submission || [];
          
          // Get unique solved problem titles/slugs from LeetCode
          interface LeetCodeAcSubmission {
            title: string;
            titleSlug: string;
            statusDisplay: string;
          }
          const solvedSet = new Set<string>();
          const solvedSubmissions = submissions.filter((sub: LeetCodeAcSubmission) => {
            if (sub.statusDisplay === "Accepted" && !solvedSet.has(sub.titleSlug)) {
              solvedSet.add(sub.titleSlug);
              return true;
            }
            return false;
          });

          // Match each solved problem to our DB problems
          for (const sub of solvedSubmissions) {
            // Match by slug or normalized title
            const dbProb = dbProblemsBySlug.get(sub.titleSlug.toLowerCase()) || 
                           dbProblemsByNormalizedTitle.get(normalizeTitle(sub.title));
            
            if (dbProb) {
              // Upsert solved user progress
              await UserProblemProgress.findOneAndUpdate(
                { userId, problemId: dbProb._id },
                { status: "solved" },
                { upsert: true, new: true }
              );
              leetcodeSyncedCount++;
            }
          }
        }
      } catch (err) {
        console.error("Error syncing LeetCode solved problems:", err);
      }
    }

    // ────────────────────────────────────────────────────────
    // 2. SYNC GEEKFORGEEKS SOLVED PROBLEMS
    // ────────────────────────────────────────────────────────
    if (gfgUsername) {
      try {
        const res = await fetch(`https://geeks-for-geeks-api.vercel.app/${gfgUsername}`);
        if (res.ok) {
          const data = await res.json();
          const solvedStats = data.solvedStats || {};
          
          // Flatten all solved categories: school, basic, easy, medium, hard
          const categories = ["school", "basic", "easy", "medium", "hard"];
          const gfgSolvedProblems: { title: string; url: string }[] = [];
          
          categories.forEach((cat) => {
            const list = solvedStats[cat]?.questions || [];
            interface GfgQuestion {
              question: string;
              questionUrl?: string;
            }
            list.forEach((q: GfgQuestion) => {
              if (q.question) {
                gfgSolvedProblems.push({
                  title: q.question,
                  url: q.questionUrl || "",
                });
              }
            });
          });

          // Match each solved GFG problem to our DB problems
          for (const q of gfgSolvedProblems) {
            const apiSlug = extractSlug(q.url);
            const dbProb = (apiSlug ? dbProblemsBySlug.get(apiSlug) : null) || 
                           dbProblemsByNormalizedTitle.get(normalizeTitle(q.title));
            
            if (dbProb) {
              // Upsert solved user progress
              await UserProblemProgress.findOneAndUpdate(
                { userId, problemId: dbProb._id },
                { status: "solved" },
                { upsert: true, new: true }
              );
              gfgSyncedCount++;
            }
          }

          // Save GFG stats to PlatformStats so it renders on profile
          const totalSolved = parseInt(data.info?.totalProblemsSolved || "0", 10) || gfgSolvedProblems.length;
          
          const gfgStatsData = {
            userId,
            platform: "geeksforgeeks" as const,
            username: gfgUsername,
            totalSolved,
            easy: (solvedStats.easy?.count || 0) + (solvedStats.basic?.count || 0) + (solvedStats.school?.count || 0),
            medium: solvedStats.medium?.count || 0,
            hard: solvedStats.hard?.count || 0,
            rating: parseInt(data.info?.codingScore || "0", 10) || 0,
            ranking: parseInt(data.info?.rank || "0", 10) || 0,
            acceptanceRate: 100, // Placeholder
            streak: 0,
            userInfo: {
              name: data.info?.name || gfgUsername,
              avatar: "https://media.geeksforgeeks.org/gfg-gg-logo.svg",
              country: data.info?.country || "India",
              skills: [],
            },
            lastSyncedAt: new Date(),
          };

          await PlatformStats.findOneAndUpdate(
            { userId, platform: "geeksforgeeks" },
            gfgStatsData,
            { upsert: true, new: true, runValidators: true }
          );
        }
      } catch (err) {
        console.error("Error syncing GeeksforGeeks solved problems:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Synchronization completed successfully!",
      data: {
        leetcodeSolvedImported: leetcodeSyncedCount,
        gfgSolvedImported: gfgSyncedCount,
        totalImported: leetcodeSyncedCount + gfgSyncedCount,
      }
    });

  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during sync" },
      { status: 500 }
    );
  }
}
