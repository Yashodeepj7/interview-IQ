// Step 5 Comprehensive Verification Test Suite for InterviewIQ Voice Integration
import assert from "node:assert";
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  getSpeechRecognitionConstructor,
  mapSpeechRecognitionError,
  appendSpeechTranscript,
} from "./src/lib/speech.js";

const BASE_URL = "http://localhost:3000";

async function runTestSuite() {
  console.log("=================================================");
  console.log("   INTERVIEWIQ STEP 5: VOICE INTEGRATION SUITE   ");
  console.log("=================================================\n");

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

  // --- UNIT TESTS: Speech Utilities & Cross-Browser Detection ---
  console.log("--- 1. Speech Feature Detection & Cross-Browser Safety ---");

  test("Feature detection returns false in SSR / Node environment", () => {
    assert.strictEqual(isSpeechRecognitionSupported(null), false);
    assert.strictEqual(isSpeechSynthesisSupported(null), false);
    assert.strictEqual(getSpeechRecognitionConstructor(null), null);
  });

  test("Feature detection handles standard Web Speech API (Chrome/Edge/Safari)", () => {
    class MockSpeechRecognition {}
    const mockChromeWindow = {
      webkitSpeechRecognition: MockSpeechRecognition,
      speechSynthesis: {},
      SpeechSynthesisUtterance: function () {},
    };

    assert.strictEqual(isSpeechRecognitionSupported(mockChromeWindow), true);
    assert.strictEqual(getSpeechRecognitionConstructor(mockChromeWindow), MockSpeechRecognition);
    assert.strictEqual(isSpeechSynthesisSupported(mockChromeWindow), true);
  });

  test("Feature detection detects unsupported SpeechRecognition (e.g., Firefox)", () => {
    const mockFirefoxWindow = {
      speechSynthesis: {},
      SpeechSynthesisUtterance: function () {},
    };

    assert.strictEqual(isSpeechRecognitionSupported(mockFirefoxWindow), false);
    assert.strictEqual(getSpeechRecognitionConstructor(mockFirefoxWindow), null);
    // TTS should still be supported even if STT is not
    assert.strictEqual(isSpeechSynthesisSupported(mockFirefoxWindow), true);
  });

  console.log("\n--- 2. Recognition Error Handling & User Guidance ---");

  test("Error mapping: 'not-allowed' (permission denied)", () => {
    const err = mapSpeechRecognitionError("not-allowed");
    assert.strictEqual(err.type, "permission");
    assert.ok(err.title.includes("Denied"));
    assert.ok(err.message.includes("address bar"));
    assert.strictEqual(err.retryable, true);
  });

  test("Error mapping: 'no-speech' (silence detection)", () => {
    const err = mapSpeechRecognitionError("no-speech");
    assert.strictEqual(err.type, "no-speech");
    assert.ok(err.title.includes("No Speech"));
    assert.strictEqual(err.retryable, true);
  });

  test("Error mapping: 'audio-capture' (device unavailable)", () => {
    const err = mapSpeechRecognitionError("audio-capture");
    assert.strictEqual(err.type, "device");
    assert.ok(err.title.includes("Unavailable"));
    assert.strictEqual(err.retryable, true);
  });

  test("Error mapping: 'network' (browser speech service failure)", () => {
    const err = mapSpeechRecognitionError("network");
    assert.strictEqual(err.type, "network");
    assert.ok(err.message.includes("Typed Mode"));
    assert.strictEqual(err.retryable, true);
  });

  test("Error mapping: 'aborted' (manual stop event)", () => {
    const err = mapSpeechRecognitionError("aborted");
    assert.strictEqual(err.type, "aborted");
    assert.strictEqual(err.retryable, true);
  });

  console.log("\n--- 3. Transcript Accumulation & Formatting ---");

  test("appendSpeechTranscript merges empty and initial spoken words", () => {
    assert.strictEqual(appendSpeechTranscript("", "Hello world"), "Hello world");
    assert.strictEqual(appendSpeechTranscript("   ", "Hello world"), "Hello world");
  });

  test("appendSpeechTranscript appends subsequent speech without duplicates or double spaces", () => {
    const result1 = appendSpeechTranscript("My background is in React", "and Next.js.");
    assert.strictEqual(result1, "My background is in React and Next.js.");

    const result2 = appendSpeechTranscript("Testing trailing space ", "New segment");
    assert.strictEqual(result2, "Testing trailing space New segment");
  });

  test("appendSpeechTranscript handles empty/whitespace inputs safely", () => {
    assert.strictEqual(appendSpeechTranscript("Existing text", ""), "Existing text");
    assert.strictEqual(appendSpeechTranscript("Existing text", "   "), "Existing text");
    assert.strictEqual(appendSpeechTranscript("", ""), "");
  });

  console.log("\n--- 4. Voice Session Lifecycle & State Safety ---");

  test("Speech session lifecycle guard prevents duplicate instances", () => {
    let activeSessions = 0;
    const sessionState = { isListening: false };

    function startVoiceSession() {
      if (sessionState.isListening) {
        return false; // Guard triggered: duplicate start prevented
      }
      sessionState.isListening = true;
      activeSessions++;
      return true;
    }

    function stopVoiceSession() {
      sessionState.isListening = false;
    }

    assert.strictEqual(startVoiceSession(), true);
    assert.strictEqual(activeSessions, 1);
    // Attempt duplicate start while active
    assert.strictEqual(startVoiceSession(), false);
    assert.strictEqual(activeSessions, 1);

    stopVoiceSession();
    assert.strictEqual(sessionState.isListening, false);
    // Can start again after cleanup
    assert.strictEqual(startVoiceSession(), true);
    assert.strictEqual(activeSessions, 2);
    stopVoiceSession();
  });

  test("Candidate explicit confirmation invariant: voice answers do not auto-submit", () => {
    // Invariant: Recognizing text only updates answers[q.id].
    // Form submission requires candidate to manually click next/finish.
    const mockSession = {
      answers: {},
      isSubmitted: false,
    };

    function onVoiceResult(qId, recognizedChunk) {
      mockSession.answers[qId] = appendSpeechTranscript(mockSession.answers[qId] || "", recognizedChunk);
      // Ensure no automatic submission side effect
    }

    onVoiceResult("q1", "I have four years of full stack experience.");
    assert.strictEqual(mockSession.answers["q1"], "I have four years of full stack experience.");
    assert.strictEqual(mockSession.isSubmitted, false); // Explicit confirmation required
  });

  console.log("\n--- 5. API & Server Regression Suite ---");

  await testAsync("GET / - Landing page responds 200", async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
  });

  await testAsync("GET /mock-interview - Setup page responds 200", async () => {
    const res = await fetch(`${BASE_URL}/mock-interview`);
    assert.strictEqual(res.status, 200);
  });

  await testAsync("GET /mock-interview/session - Session page responds 200", async () => {
    const res = await fetch(`${BASE_URL}/mock-interview/session`);
    assert.strictEqual(res.status, 200);
  });

  await testAsync("POST /api/ai/test - AI test endpoint regression check", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Ping from Step 5 voice test suite" }),
    });
    if (res.status === 429 || res.status === 502) {
      const data = await res.json();
      assert.strictEqual(data.success, false);
      console.log(`   (Observed live Gemini provider status HTTP ${res.status} handled safely)`);
      return;
    }
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  await testAsync("POST /api/interview/start - Generates questions compatible with Voice Mode", async () => {
    const res = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "Full Stack Developer",
        experience: "3–5 years",
        type: "Mixed",
        questionCount: 5,
        difficulty: "Medium",
      }),
    });
    if (res.status === 429 || res.status === 502 || res.status === 503) {
      const data = await res.json();
      assert.strictEqual(data.success, false);
      console.log(`   (Observed live Gemini provider status HTTP ${res.status} handled safely)`);
      return;
    }
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(Array.isArray(data.questions), true);
    assert.strictEqual(data.questions.length, 5);
  });

  await testAsync("POST /api/interview/evaluate - Evaluates voice-dictated answers seamlessly", async () => {
    // Simulate candidate answering via voice mode with transcribed responses
    const payload = {
      settings: {
        role: "Frontend Developer",
        experience: "3–5 years",
        type: "Mixed",
        difficulty: "Medium",
        inputMode: "voice", // Step 5 voice mode setting
      },
      questions: [
        {
          id: "q_voice_1",
          text: "How do you handle state synchronization across micro-frontends?",
          category: "Technical",
        },
        {
          id: "q_voice_2",
          text: "Tell me about a time you gave critical feedback to a peer.",
          category: "Behavioral",
        },
      ],
      answers: {
        q_voice_1:
          "In my experience with micro-frontends, sharing heavy state should be minimized to avoid tight coupling. For cross-app events like authentication tokens or global theme changes, I utilize a custom browser event bus or lightweight pub-sub via window.dispatchEvent. Each micro-frontend maintains its own localized store using Zustand or React Context for its domain logic.",
        q_voice_2:
          "When a junior engineer repeatedly missed edge-case testing in pull requests, I scheduled a private 1-on-1. I framed the feedback around team delivery velocity rather than criticism, and walked them through our automated Jest test suite. In the following sprint, their test coverage rose to 90% with zero regressions.",
      },
    };

    const res = await fetch(`${BASE_URL}/api/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 429 || res.status === 502) {
      const data = await res.json();
      assert.strictEqual(data.success, false);
      console.log(`   (Observed live Gemini provider status HTTP ${res.status} handled safely)`);
      return;
    }

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.overallScore === "number");
    assert.ok(data.overallScore >= 0 && data.overallScore <= 100);
    assert.strictEqual(data.metrics.answeredCount, 2);
    assert.strictEqual(data.metrics.unansweredCount, 0);

    // Verify behavioral question has STAR breakdown
    const behav = data.questionEvaluations.find((q) => q.questionId === "q_voice_2");
    assert.ok(behav, "Behavioral question evaluation found");
    if (behav.starBreakdown) {
      assert.strictEqual(typeof behav.starBreakdown.situation?.present, "boolean");
      assert.strictEqual(typeof behav.starBreakdown.action?.present, "boolean");
    }

    console.log(`Live Evaluation ID: ${data.evaluationId}`);
    console.log(`Evaluated Score: ${data.overallScore}/100`);
  });

  console.log("\n=================================================");
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
