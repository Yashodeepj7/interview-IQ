import { MongoClient, ObjectId } from "mongodb";

const DEFAULT_DB_NAME = "interviewiq";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cachedClient = global._mongoClient;
let cachedPromise = global._mongoClientPromise;

/**
 * Checks if MONGODB_URI environment variable is configured.
 * Never logs or reveals the URI itself.
 */
export function isMongoConfigured() {
  const uri = process.env.MONGODB_URI?.trim();
  return Boolean(uri && uri.length > 0);
}

/**
 * Sanitizes MongoDB connection error messages to prevent leaking credentials
 * or internal host details.
 */
export function sanitizeMongoError(error) {
  if (!error) return new Error("Unknown database error occurred.");

  const rawMessage = error.message || "";
  // Redact connection strings with passwords like mongodb+srv://user:pass@host
  const sanitizedMsg = rawMessage
    .replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@)/gi, "$1[REDACTED]$2")
    .replace(/password=[^&\s]+/gi, "password=[REDACTED]");

  const safeError = new Error(
    sanitizedMsg.length > 0 ? sanitizedMsg : "Database operation failed."
  );
  safeError.code = error.code || "DB_ERROR";
  return safeError;
}

/**
 * Connects to MongoDB Atlas or returns the cached connection promise.
 *
 * @returns {Promise<MongoClient>}
 */
export async function getClient() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    const err = new Error(
      "MONGODB_URI is not configured. Please add your connection string to .env.local."
    );
    err.code = "MISSING_MONGODB_URI";
    throw err;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  // In production, instantiate client or reuse cached instance
  if (!cachedPromise) {
    const client = new MongoClient(uri, options);
    cachedPromise = client.connect();
  }

  return cachedPromise;
}

/**
 * Returns the MongoDB Database instance for the configured database name.
 *
 * @param {string} [customDbName]
 * @returns {Promise<import("mongodb").Db>}
 */
export async function getDb(customDbName) {
  const client = await getClient();
  const dbName =
    customDbName ||
    process.env.MONGODB_DB?.trim() ||
    DEFAULT_DB_NAME;

  return client.db(dbName);
}

/**
 * Idempotently initializes required database collections and indexes.
 * Creates:
 * 1. `users` collection unique index on `normalizedEmail`
 * 2. `interviews` collection compound index on `{ userId: 1, createdAt: -1 }`
 * 3. `interviews` collection index on `{ userId: 1, sessionIdentifier: 1 }`
 *
 * @returns {Promise<{ success: boolean, indexesCreated: string[] }>}
 */
export async function initDatabaseIndexes() {
  try {
    const db = await getDb();
    const created = [];

    // Users collection: unique normalizedEmail
    const usersCollection = db.collection("users");
    const userIndexName = await usersCollection.createIndex(
      { normalizedEmail: 1 },
      { unique: true, name: "idx_users_normalized_email_unique" }
    );
    created.push(`users.${userIndexName}`);

    // Interviews collection: userId + createdAt descending
    const interviewsCollection = db.collection("interviews");
    const historyIndexName = await interviewsCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: "idx_interviews_user_created_desc" }
    );
    created.push(`interviews.${historyIndexName}`);

    // Interviews collection: idempotency session index
    const sessionIndexName = await interviewsCollection.createIndex(
      { userId: 1, sessionIdentifier: 1 },
      { sparse: true, name: "idx_interviews_user_session" }
    );
    created.push(`interviews.${sessionIndexName}`);

    return {
      success: true,
      indexesCreated: created,
    };
  } catch (err) {
    throw sanitizeMongoError(err);
  }
}

export { ObjectId };
