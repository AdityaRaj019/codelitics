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

    const { leetcodeUsername, gfgUsername, leetcodeSlugs, universalText } = await request.json();

    if (!leetcodeUsername && !gfgUsername && (!leetcodeSlugs || !Array.isArray(leetcodeSlugs)) && !universalText) {
      return NextResponse.json(
        { success: false, error: "Provide a username, list of solved slugs, or text to import" },
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
    // 00. SYNC VIA UNIVERSAL TEXT MATCHING (PASTED BY USER)
    // ────────────────────────────────────────────────────────
    if (universalText && typeof universalText === "string") {
      const inputLines = universalText
        .split(/[\n,\t"\[\]\)\(]+/)
        .map(line => normalizeTitle(line.trim()))
        .filter(line => line.length > 3);

      for (const dbProb of allDbProblems) {
        const dbNorm = normalizeTitle(dbProb.title);
        
        const isMatched = inputLines.some(line => {
          if (line === dbNorm) return true;
          if (dbNorm.includes(line) && line.length > 10) return true;
          if (line.includes(dbNorm) && dbNorm.length > 8) return true;
          return false;
        });

        if (isMatched) {
          await UserProblemProgress.findOneAndUpdate(
            { userId, problemId: dbProb._id },
            { status: "solved" },
            { upsert: true, new: true }
          );
          if (dbProb.platform === "LeetCode") {
            leetcodeSyncedCount++;
          } else {
            gfgSyncedCount++;
          }
        }
      }
    }

    // ────────────────────────────────────────────────────────
    // 0. SYNC DIRECT LEETCODE SLUGS (PASTED BY USER)
    // ────────────────────────────────────────────────────────
    if (leetcodeSlugs && Array.isArray(leetcodeSlugs)) {
      for (const rawSlug of leetcodeSlugs) {
        if (typeof rawSlug === "string") {
          const slug = rawSlug.trim().toLowerCase();
          const dbProb = dbProblemsBySlug.get(slug);
          if (dbProb) {
            await UserProblemProgress.findOneAndUpdate(
              { userId, problemId: dbProb._id },
              { status: "solved" },
              { upsert: true, new: true }
            );
            leetcodeSyncedCount++;
          }
        }
      }
    }

    // ────────────────────────────────────────────────────────
    // 1. SYNC LEETCODE SOLVED PROBLEMS (RECENT)
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
        const res = await fetch(`https://auth.geeksforgeeks.org/user/${gfgUsername}/`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
          }
        });
        if (res.ok) {
          const html = await res.text();
          
          // Regex search for user stats in Next.js props
          const totalMatch = html.match(/"total_problems_solved"\s*:\s*(\d+)/);
          const scoreMatch = html.match(/"score"\s*:\s*(\d+)/);
          const rankMatch = html.match(/"institute_rank"\s*:\s*(\d+)/);
          
          const totalSolved = totalMatch ? parseInt(totalMatch[1], 10) : 0;
          const rating = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
          const ranking = rankMatch ? parseInt(rankMatch[1], 10) : 0;

          // Save GFG stats to PlatformStats so it renders on profile
          const gfgStatsData = {
            userId,
            platform: "geeksforgeeks" as const,
            username: gfgUsername,
            totalSolved,
            easy: 0,
            medium: 0,
            hard: 0,
            rating,
            ranking,
            acceptanceRate: 100, // Placeholder
            streak: 0,
            userInfo: {
              name: gfgUsername,
              avatar: "https://media.geeksforgeeks.org/gfg-gg-logo.svg",
              country: "India",
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
