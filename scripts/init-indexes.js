/**
 * Database index initialization script for InterviewIQ.
 * Creates unique index on users.normalizedEmail and compound indexes on interviews.
 *
 * Usage:
 *   node scripts/init-indexes.js
 *   npm run init-db
 */
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
// Load environment variables from .env.local / .env
loadEnvConfig(process.cwd());

import { initDatabaseIndexes, isMongoConfigured } from "../src/lib/mongodb.js";

async function main() {
  console.log("==============================================");
  console.log("  InterviewIQ: MongoDB Atlas Index Initializer");
  console.log("==============================================\n");

  if (!isMongoConfigured()) {
    console.error("Error: MONGODB_URI environment variable is not configured.");
    console.error("Please add MONGODB_URI to your .env.local file and re-run.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas and creating indexes...");
    const result = await initDatabaseIndexes();

    console.log("\n[SUCCESS] Indexes initialized successfully:");
    result.indexesCreated.forEach((idx) => {
      console.log(` - ${idx}`);
    });
    console.log("\nDatabase schema indexes are ready for production.");
    process.exit(0);
  } catch (err) {
    console.error(`\n[ERROR] Failed to initialize indexes: ${err.message}`);
    process.exit(1);
  }
}

main();
