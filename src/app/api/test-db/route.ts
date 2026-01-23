import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import mongoose from "mongoose";

// GET /api/test-db - Test database read/write operations
export async function GET() {
  try {
    await dbConnect();

    // Get database stats
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not connected");
    }

    // List all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Get document counts for each collection
    const collectionStats = await Promise.all(
      collectionNames.map(async (name) => {
        const count = await db.collection(name).countDocuments();
        return { name, documentCount: count };
      }),
    );

    return NextResponse.json({
      status: "ok",
      message: "Database test successful",
      database: db.databaseName,
      collections: collectionStats,
      connectionState:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Database test failed",
      },
      { status: 500 },
    );
  }
}

// POST /api/test-db - Test inserting a document
export async function POST() {
  try {
    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not connected");
    }

    // Create a test collection and insert a test document
    const testCollection = db.collection("_test_collection");

    const testDoc = {
      testField: "Hello from CodeLitics!",
      createdAt: new Date(),
      randomValue: Math.random(),
    };

    const result = await testCollection.insertOne(testDoc);

    // Immediately read it back to verify
    const insertedDoc = await testCollection.findOne({
      _id: result.insertedId,
    });

    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: result.insertedId });

    return NextResponse.json({
      status: "ok",
      message: "Write/Read test successful!",
      tests: {
        insert: {
          success: result.acknowledged,
          insertedId: result.insertedId.toString(),
        },
        read: { success: !!insertedDoc, document: insertedDoc },
        cleanup: { success: true, message: "Test document deleted" },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database write test error:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Database write test failed",
      },
      { status: 500 },
    );
  }
}
