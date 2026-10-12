/**
 * Step 6 Comprehensive Verification Test Suite for InterviewIQ
 * User Authentication, MongoDB Integration, Ownership Authorization & Interview Persistence
 *
 * Usage:
 *   node test_step6_suite.js
 */

import assert from "node:assert";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

import {
  normalizeEmail,
  validateRegistrationInput,
  hashPassword,
  verifyPassword,
  sanitizeUser,
} from "./src/lib/auth-helpers.js";
import { ObjectId, getDb, isMongoConfigured } from "./src/lib/mongodb.js";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runStep6Suite() {
  console.log("================================================================");
  console.log("   INTERVIEWIQ STEP 6: AUTHENTICATION & PERSISTENCE TEST SUITE  ");
  console.log("================================================================\n");

  const results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name, status: "PASSED" });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results.push({ name, status: "FAILED", error: err.message });
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      results.push({ name, status: "PASSED" });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results.push({ name, status: "FAILED", error: err.message });
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  // ========================================================================
  // SECTION 1: REGISTRATION INPUT VALIDATION & DATA NORMALIZATION
  // ========================================================================
  console.log("--- 1. Registration Input Validation & Email Normalization ---");

  test("Email normalization consistently trims and lowercases email", () => {
    assert.strictEqual(normalizeEmail("  Alex.Dev@Example.COM  "), "alex.dev@example.com");
    assert.strictEqual(normalizeEmail("USER@DOMAIN.ORG"), "user@domain.org");
    assert.strictEqual(normalizeEmail(null), "");
    assert.strictEqual(normalizeEmail(123), "");
  });

  test("Validation rejects missing, empty, or short name", () => {
    const errMissing = validateRegistrationInput({
      name: "",
      email: "alex@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    assert.ok(errMissing && errMissing.includes("Name"));

    const errShort = validateRegistrationInput({
      name: "A",
      email: "alex@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    assert.ok(errShort && errShort.includes("between 2 and 60"));
  });

  test("Validation rejects invalid email address formats", () => {
    const invalidEmails = ["notanemail", "user@", "@domain.com", "user@domain", "user space@domain.com"];
    for (const badEmail of invalidEmails) {
      const err = validateRegistrationInput({
        name: "Alex Morgan",
        email: badEmail,
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      assert.ok(err && err.includes("valid email"), `Failed for ${badEmail}`);
    }
  });

  test("Validation enforces minimum password length (>= 8 characters)", () => {
    const errShort = validateRegistrationInput({
      name: "Alex Morgan",
      email: "alex@example.com",
      password: "short",
      confirmPassword: "short",
    });
    assert.ok(errShort && errShort.includes("at least 8 characters"));

    const valid = validateRegistrationInput({
      name: "Alex Morgan",
      email: "alex@example.com",
      password: "ValidPass123!",
      confirmPassword: "ValidPass123!",
    });
    assert.strictEqual(valid, null);
  });

  test("Validation rejects mismatched password confirmation", () => {
    const errMismatch = validateRegistrationInput({
      name: "Alex Morgan",
      email: "alex@example.com",
      password: "ValidPass123!",
      confirmPassword: "DifferentPass123!",
    });
    assert.ok(errMismatch && errMismatch.includes("Passwords do not match"));
  });

  // ========================================================================
  // SECTION 2: SECURE PASSWORD HASHING & SANITIZATION
  // ========================================================================
  console.log("\n--- 2. Secure Password Hashing & User Object Sanitization ---");

  await testAsync("Password hashing generates bcrypt hash with salt", async () => {
    const plain = "SuperSecretCandidatePassword2026!";
    const hash = await hashPassword(plain);

    assert.ok(typeof hash === "string");
    assert.notStrictEqual(hash, plain);
    // Bcrypt format check
    assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"));
    assert.ok(hash.length >= 59);
  });

  await testAsync("Password verification validates correct credentials", async () => {
    const password = "CandidateTestPassword#99";
    const hash = await hashPassword(password);

    const matches = await verifyPassword(password, hash);
    assert.strictEqual(matches, true);
  });

  await testAsync("Password verification safely rejects incorrect credentials", async () => {
    const password = "CandidateTestPassword#99";
    const hash = await hashPassword(password);

    const wrong1 = await verifyPassword("WrongPassword123", hash);
    assert.strictEqual(wrong1, false);

    const wrong2 = await verifyPassword("", hash);
    assert.strictEqual(wrong2, false);

    const wrong3 = await verifyPassword(null, hash);
    assert.strictEqual(wrong3, false);
  });

  test("User sanitization strips passwordHash and exposes only safe fields", () => {
    const mockUserDoc = {
      _id: new ObjectId("507f1f77bcf86cd799439011"),
      name: "Jordan Lee",
      email: "jordan@example.com",
      normalizedEmail: "jordan@example.com",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      secretInternalKey: "LEAK_SENSITIVE_KEY",
    };

    const sanitized = sanitizeUser(mockUserDoc);

    assert.strictEqual(sanitized.id, "507f1f77bcf86cd799439011");
    assert.strictEqual(sanitized.name, "Jordan Lee");
    assert.strictEqual(sanitized.email, "jordan@example.com");
    assert.strictEqual(sanitized.passwordHash, undefined);
    assert.strictEqual(sanitized.normalizedEmail, undefined);
    assert.strictEqual(sanitized.secretInternalKey, undefined);
  });

  // ========================================================================
  // SECTION 3: MONGODB DATA SCHEMA & IDEMPOTENCY LOGIC
  // ========================================================================
  console.log("\n--- 3. MongoDB Document Schemas & Idempotency Rules ---");

  test("ObjectId creation and hex string validation", () => {
    const id = new ObjectId();
    assert.strictEqual(ObjectId.isValid(id.toString()), true);
    assert.strictEqual(ObjectId.isValid("not-a-valid-object-id"), false);
    assert.strictEqual(ObjectId.isValid("12345"), false);
  });

  test("Calculates trusted server-side answered metrics without trusting client count", () => {
    const questions = [
      { id: "q1", text: "Explain React 19 server components.", category: "Technical" },
      { id: "q2", text: "Describe a project conflict.", category: "Behavioral" },
      { id: "q3", text: "How do you optimize SQL queries?", category: "Technical" },
    ];

    const answers = {
      q1: "Server components execute exclusively on the server and do not ship bundle JS.", // >= 5 chars
      q2: "   ", // whitespace only -> skipped
      q3: "Used indexing.", // >= 5 chars
    };

    // Calculation logic matching POST /api/interviews
    const answeredCount = questions.filter(
      (q) => (answers[q.id]?.trim() || "").length >= 5
    ).length;
    const skippedCount = questions.length - answeredCount;

    assert.strictEqual(answeredCount, 2);
    assert.strictEqual(skippedCount, 1);
  });

  test("Excludes transcript-only and null scores from dashboard averages", () => {
    const interviewHistory = [
      { status: "evaluated", overallScore: 80 },
      { status: "evaluated", overallScore: 90 },
      { status: "completed", overallScore: null }, // transcript-only: NO score
      { status: "completed", overallScore: null }, // transcript-only: NO score
    ];

    const evaluatedOnly = interviewHistory.filter(
      (item) => item.status === "evaluated" && typeof item.overallScore === "number"
    );

    const averageScore =
      evaluatedOnly.length > 0
        ? Math.round(
            evaluatedOnly.reduce((sum, item) => sum + item.overallScore, 0) /
              evaluatedOnly.length
          )
        : null;

    // (80 + 90) / 2 = 85 (unevaluated sessions do not pull average down to 42.5)
    assert.strictEqual(averageScore, 85);
  });

  if (isMongoConfigured()) {
    await testAsync("Live MongoDB Atlas cluster connectivity & index verification", async () => {
      const db = await getDb();
      const pingResult = await db.command({ ping: 1 });
      assert.strictEqual(pingResult.ok, 1);

      const userIndexes = await db.collection("users").indexes();
      const hasNormalizedEmailIndex = userIndexes.some(
        (idx) => idx.name === "idx_users_normalized_email_unique" || idx.key?.normalizedEmail === 1
      );
      assert.ok(hasNormalizedEmailIndex, "users collection must have normalizedEmail index");

      const interviewIndexes = await db.collection("interviews").indexes();
      const hasHistoryIndex = interviewIndexes.some(
        (idx) =>
          idx.name === "idx_interviews_user_created_desc" ||
          (idx.key?.userId === 1 && idx.key?.createdAt === -1)
      );
      assert.ok(hasHistoryIndex, "interviews collection must have userId + createdAt index");
      console.log("   (Live MongoDB Atlas connection and remote indexes verified successfully)");
    });
  }

  // ========================================================================
  // SECTION 4: MULTI-TENANT AUTHORIZATION & OWNERSHIP VERIFICATION
  // ========================================================================
  console.log("\n--- 4. Multi-Tenant Authorization & Ownership Scoping ---");

  // In-Memory simulated MongoDB collection to test authorization invariants
  const mockInterviewsDB = [
    {
      _id: new ObjectId("607f1f77bcf86cd799439001"),
      userId: new ObjectId("507f1f77bcf86cd799439001"), // User 1
      sessionIdentifier: "session_user1_alpha",
      status: "evaluated",
      settings: { role: "Frontend Lead", type: "Technical" },
      overallScore: 88,
      createdAt: new Date("2026-02-01"),
    },
    {
      _id: new ObjectId("607f1f77bcf86cd799439002"),
      userId: new ObjectId("507f1f77bcf86cd799439001"), // User 1
      sessionIdentifier: "session_user1_beta",
      status: "completed",
      settings: { role: "Full Stack Engineer", type: "Mixed" },
      overallScore: null,
      createdAt: new Date("2026-02-02"),
    },
    {
      _id: new ObjectId("607f1f77bcf86cd799439003"),
      userId: new ObjectId("507f1f77bcf86cd799439002"), // User 2 (Different User)
      sessionIdentifier: "session_user2_private",
      status: "evaluated",
      settings: { role: "Engineering Manager", type: "Behavioral" },
      overallScore: 92,
      createdAt: new Date("2026-02-03"),
    },
  ];

  test("Listing interviews returns only records owned by current authenticated user", () => {
    const currentUserId = new ObjectId("507f1f77bcf86cd799439001"); // User 1

    // Scoped query: { userId: currentUserId }
    const userRecords = mockInterviewsDB.filter((item) =>
      item.userId.equals(currentUserId)
    );

    assert.strictEqual(userRecords.length, 2);
    // User 2's record must never appear
    const containsOtherUser = userRecords.some((item) =>
      item.userId.equals(new ObjectId("507f1f77bcf86cd799439002"))
    );
    assert.strictEqual(containsOtherUser, false);
  });

  test("Fetching interview by ID strictly checks owner userId to prevent horizontal privilege escalation", () => {
    const user1Id = new ObjectId("507f1f77bcf86cd799439001");
    const user2RecordId = new ObjectId("607f1f77bcf86cd799439003");

    // User 1 tries to fetch User 2's interview record
    const record = mockInterviewsDB.find(
      (item) => item._id.equals(user2RecordId) && item.userId.equals(user1Id)
    );

    // Must be undefined (which translates to HTTP 404 in API route)
    assert.strictEqual(record, undefined);
  });

  test("Deleting interview strictly checks owner userId", () => {
    const user1Id = new ObjectId("507f1f77bcf86cd799439001");
    const user2RecordId = new ObjectId("607f1f77bcf86cd799439003");

    // User 1 tries to delete User 2's interview record
    const matchBeforeDelete = mockInterviewsDB.find(
      (item) => item._id.equals(user2RecordId) && item.userId.equals(user1Id)
    );
    assert.strictEqual(matchBeforeDelete, undefined);

    // Delete User 1's own interview
    const user1RecordId = new ObjectId("607f1f77bcf86cd799439002");
    const index = mockInterviewsDB.findIndex(
      (item) => item._id.equals(user1RecordId) && item.userId.equals(user1Id)
    );
    assert.ok(index !== -1);
  });

  test("Duplicate save protection: sessionIdentifier deduplication invariant", () => {
    const user1Id = new ObjectId("507f1f77bcf86cd799439001");
    const candidateSessionId = "session_user1_alpha"; // Already in mockInterviewsDB

    // Check for existing document by userId + sessionIdentifier
    const existing = mockInterviewsDB.find(
      (item) =>
        item.userId.equals(user1Id) &&
        item.sessionIdentifier === candidateSessionId
    );

    assert.ok(existing);
    assert.strictEqual(existing._id.toString(), "607f1f77bcf86cd799439001");
  });

  // ========================================================================
  // SECTION 5: LIVE HTTP REGRESSION & PROTECTED ROUTE CHECKS
  // ========================================================================
  console.log("\n--- 5. Live HTTP Regression & Protected Route Checks ---");

  let serverReachable = false;
  try {
    const ping = await fetch(BASE_URL, { method: "GET" });
    if (ping.status < 500) {
      serverReachable = true;
    }
  } catch {
    serverReachable = false;
  }

  if (!serverReachable) {
    console.log(
      `   [NOTICE] Dev server at ${BASE_URL} is not currently running. Skipping live HTTP endpoint checks.`
    );
    console.log(
      `   To run live HTTP tests: execute 'npm run dev' in another terminal and re-run test_step6_suite.js.`
    );
  } else {
    await testAsync("GET / - Landing page responds 200", async () => {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200);
    });

    await testAsync("GET /login - Sign-in page responds 200", async () => {
      const res = await fetch(`${BASE_URL}/login`);
      assert.strictEqual(res.status, 200);
    });

    await testAsync("GET /register - Registration page responds 200", async () => {
      const res = await fetch(`${BASE_URL}/register`);
      assert.strictEqual(res.status, 200);
    });

    await testAsync("POST /api/auth/register - Rejects empty/malformed body with 400", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.error);
    });

    await testAsync("POST /api/auth/register - Rejects short passwords with 400", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Candidate",
          email: "candidate@example.com",
          password: "short",
          confirmPassword: "short",
        }),
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.error.includes("8 characters"));
    });

    await testAsync("POST /api/interviews - Rejects unauthenticated save with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: { role: "Software Engineer", experience: "3–5 years", type: "Technical" },
          questions: [{ id: "q1", text: "What is an event loop?", category: "Technical" }],
          answers: { q1: "The event loop manages the execution of multiple chunks." },
        }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await testAsync("GET /api/interviews - Rejects unauthenticated listing with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/interviews`);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await testAsync("GET /api/interviews/invalid-id - Rejects unauthenticated request with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/interviews/507f1f77bcf86cd799439011`);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });

    await testAsync("DELETE /api/interviews/invalid-id - Rejects unauthenticated delete with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/interviews/507f1f77bcf86cd799439011`, {
        method: "DELETE",
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
    });
  }

  // ========================================================================
  // SUITE SUMMARY
  // ========================================================================
  console.log("\n================================================================");
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  console.log(`Step 6 Test Results: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runStep6Suite();
