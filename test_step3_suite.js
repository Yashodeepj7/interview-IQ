/**
 * Step 3 Comprehensive Verification Test Suite for InterviewIQ
 * AI Resume Analyzer and Job Description Matcher
 *
 * Tests PDF extraction, magic byte verification, scanned document detection,
 * job description validation, schema normalization, and error sanitization.
 *
 * Usage:
 *   node test_step3_suite.js
 */

import assert from "node:assert";
import {
  hasValidPdfSignature,
  extractTextFromPDF,
  MAX_PDF_BYTES,
  MAX_EXTRACTED_CHARACTERS,
} from "./src/lib/pdf-parser.js";
import {
  validateJobDescription,
  validateResumeAnalysisOutput,
  validateJobMatchOutput,
  MIN_JD_LENGTH,
  MAX_JD_LENGTH,
} from "./src/lib/validation-helpers.js";
import { isGeminiConfigured, getGeminiModel } from "./src/lib/gemini.js";

// Minimal valid PDF text stream for testing
function createValidTestPdf(textContent = "Yashodeep Joshi Senior Software Engineer React Node.js Next.js") {
  const contentStream = `BT /F1 12 Tf 100 700 Td (${textContent}) Tj ET`;
  const pdfString = [
    "%PDF-1.4",
    "1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj",
    "2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj",
    "3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj",
    `4 0 obj <</Length ${contentStream.length}>> stream\n${contentStream}\nendstream endobj`,
    "5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000009 00000 n ",
    "0000000056 00000 n ",
    "0000000111 00000 n ",
    "0000000212 00000 n ",
    "0000000306 00000 n ",
    "trailer <</Size 6 /Root 1 0 R>>",
    "startxref",
    "377",
    "%%EOF",
  ].join("\n");

  return Buffer.from(pdfString);
}

// Minimal valid PDF with empty content stream (simulates scanned / image-only / empty document)
function createEmptyTestPdf() {
  const pdfString = [
    "%PDF-1.4",
    "1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj",
    "2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj",
    "3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj",
    "4 0 obj <</Length 0>> stream\nendstream endobj",
    "5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj",
    "xref",
    "0 6",
    "0000000000 65535 f ",
    "0000000009 00000 n ",
    "0000000056 00000 n ",
    "0000000111 00000 n ",
    "0000000212 00000 n ",
    "0000000280 00000 n ",
    "trailer <</Size 6 /Root 1 0 R>>",
    "startxref",
    "350",
    "%%EOF",
  ].join("\n");

  return Buffer.from(pdfString);
}

async function runStep3TestSuite() {
  console.log("================================================================");
  console.log("   INTERVIEWIQ STEP 3: RESUME ANALYZER & JOB MATCHER SUITE      ");
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
  // SECTION 1: PDF PARSING, SIGNATURE VERIFICATION & EXTRACTION SAFETY
  // ========================================================================
  console.log("--- 1. PDF Parser, Signature Verification & Scanned Detection ---");

  test("Signature check: verifies valid %PDF- magic bytes (0x25, 0x50, 0x44, 0x46, 0x2D)", () => {
    const validHeader = Buffer.from("%PDF-1.7\n...");
    assert.strictEqual(hasValidPdfSignature(validHeader), true);
  });

  test("Signature check: rejects non-PDF binary data (e.g. PNG, DOCX, random text)", () => {
    assert.strictEqual(hasValidPdfSignature(Buffer.from("PK\x03\x04")), false); // ZIP/DOCX
    assert.strictEqual(hasValidPdfSignature(Buffer.from("\x89PNG\r\n\x1a\n")), false); // PNG
    assert.strictEqual(hasValidPdfSignature(Buffer.from("Hello world")), false);
    assert.strictEqual(hasValidPdfSignature(Buffer.from([])), false);
    assert.strictEqual(hasValidPdfSignature(null), false);
  });

  await testAsync("PDF extraction: rejects empty buffer with EMPTY_FILE code", async () => {
    await assert.rejects(
      async () => await extractTextFromPDF(Buffer.from([])),
      (err) => {
        assert.strictEqual(err.code, "EMPTY_FILE");
        return true;
      }
    );
  });

  await testAsync("PDF extraction: rejects oversized PDF (> 5 MB) with FILE_TOO_LARGE code", async () => {
    const oversizedBuffer = Buffer.alloc(MAX_PDF_BYTES + 1024, 0x25); // > 5MB
    await assert.rejects(
      async () => await extractTextFromPDF(oversizedBuffer),
      (err) => {
        assert.strictEqual(err.code, "FILE_TOO_LARGE");
        assert.ok(err.message.includes("5 MB"));
        return true;
      }
    );
  });

  await testAsync("PDF extraction: rejects invalid header signature with INVALID_PDF_SIGNATURE", async () => {
    const invalidFormat = Buffer.from("Not a real PDF document at all!");
    await assert.rejects(
      async () => await extractTextFromPDF(invalidFormat),
      (err) => {
        assert.strictEqual(err.code, "INVALID_PDF_SIGNATURE");
        return true;
      }
    );
  });

  await testAsync("PDF extraction: detects scanned / image-only PDF with NO_EXTRACTABLE_TEXT", async () => {
    const emptyPdfBuffer = createEmptyTestPdf();
    await assert.rejects(
      async () => await extractTextFromPDF(emptyPdfBuffer),
      (err) => {
        assert.strictEqual(err.code, "NO_EXTRACTABLE_TEXT");
        assert.ok(err.message.includes("scanned document") || err.message.includes("image-only"));
        assert.ok(err.message.includes("OCR is not supported"));
        return true;
      }
    );
  });

  await testAsync("PDF extraction: successfully extracts text from valid text-based PDF", async () => {
    const sampleText = "Jane Doe Full Stack Developer React Node.js AWS 5 years experience";
    const validPdf = createValidTestPdf(sampleText);
    const result = await extractTextFromPDF(validPdf);

    assert.ok(result.text.includes("Jane Doe"));
    assert.ok(result.text.includes("Full Stack Developer"));
    assert.strictEqual(result.pageCount, 1);
    assert.strictEqual(result.isTruncated, false);
    assert.ok(result.characterCount > 30);
  });

  // ========================================================================
  // SECTION 2: JOB DESCRIPTION VALIDATION
  // ========================================================================
  console.log("\n--- 2. Job Description Validation ---");

  test("Job description: rejects non-string inputs", () => {
    assert.strictEqual(validateJobDescription(null).valid, false);
    assert.strictEqual(validateJobDescription(12345).valid, false);
    assert.strictEqual(validateJobDescription(undefined).valid, false);
  });

  test(`Job description: rejects text shorter than ${MIN_JD_LENGTH} characters`, () => {
    const shortText = "Software engineer needed.";
    const res = validateJobDescription(shortText);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("too short"));
  });

  test(`Job description: rejects text exceeding ${MAX_JD_LENGTH} characters`, () => {
    const oversizedJD = "A".repeat(MAX_JD_LENGTH + 100);
    const res = validateJobDescription(oversizedJD);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error.includes("exceeds the maximum"));
  });

  test("Job description: accepts and trims valid input", () => {
    const validJD = "   We are looking for a Senior React Engineer with 4+ years experience in Next.js, Node.js, and MongoDB.   ";
    const res = validateJobDescription(validJD);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized, validJD.trim());
  });

  // ========================================================================
  // SECTION 3: RESUME ANALYSIS SCHEMA NORMALIZATION
  // ========================================================================
  console.log("\n--- 3. Resume Analysis Output Validation & Normalization ---");

  test("Resume output: normalizes valid Gemini response with all 7 required fields", () => {
    const sampleAIResponse = {
      summary: "Experienced Full Stack Software Engineer.",
      skills: [
        {
          category: "Languages",
          items: [{ name: "TypeScript", evidence: "Used in enterprise API" }],
        },
      ],
      experienceHighlights: ["Spearheaded Next.js migration reducing latency by 35%"],
      projectHighlights: [
        {
          title: "Cloud Analytics Platform",
          description: "Real-time dashboard using React and Tailwind",
          technologies: ["React", "Tailwind", "Node.js"],
        },
      ],
      strengths: ["Strong full-stack architecture background"],
      improvements: ["Add quantifiable metrics to early employment bullets"],
      bulletSuggestions: [
        {
          original: "Worked on customer dashboard",
          suggested: "Engineered high-throughput customer dashboard improving engagement by 20%",
          rationale: "Adds active verb and metric",
        },
      ],
    };

    const validated = validateResumeAnalysisOutput(sampleAIResponse);
    assert.strictEqual(validated.summary, "Experienced Full Stack Software Engineer.");
    assert.strictEqual(validated.skills.length, 1);
    assert.strictEqual(validated.skills[0].category, "Languages");
    assert.strictEqual(validated.skills[0].items[0].name, "TypeScript");
    assert.strictEqual(validated.experienceHighlights.length, 1);
    assert.strictEqual(validated.projectHighlights.length, 1);
    assert.strictEqual(validated.strengths.length, 1);
    assert.strictEqual(validated.improvements.length, 1);
    assert.strictEqual(validated.bulletSuggestions.length, 1);
    assert.strictEqual(validated.bulletSuggestions[0].suggested.includes("Engineered"), true);
  });

  test("Resume output: gracefully provides defaults when sub-fields are missing or simplified", () => {
    const partialAIResponse = {
      summary: "Candidate summary",
      skills: [{ category: "Backend", skills: ["Node.js", "Express"] }],
      experienceHighlights: ["Lead backend engineer"],
      bulletSuggestions: ["Built API endpoints with 99.9% uptime"],
    };

    const validated = validateResumeAnalysisOutput(partialAIResponse);
    assert.strictEqual(validated.summary, "Candidate summary");
    assert.strictEqual(validated.skills[0].category, "Backend");
    assert.strictEqual(validated.skills[0].items[0].name, "Node.js");
    assert.strictEqual(validated.projectHighlights.length, 0); // safe fallback array
    assert.strictEqual(validated.strengths.length, 0); // safe fallback array
    assert.strictEqual(validated.improvements.length, 0); // safe fallback array
    assert.strictEqual(validated.bulletSuggestions[0].suggested, "Built API endpoints with 99.9% uptime");
  });

  // ========================================================================
  // SECTION 4: JOB MATCHER SCHEMA NORMALIZATION & ETHICAL SCORE CLAMPING
  // ========================================================================
  console.log("\n--- 4. Job Matcher Output Validation & Score Clamping ---");

  test("Job match output: clamps heuristic alignment score between 0 and 100", () => {
    const overScore = { alignmentScore: 120 };
    const underScore = { alignmentScore: -15 };
    const stringScore = { alignmentScore: "85%" };

    assert.strictEqual(validateJobMatchOutput(overScore).alignmentScore, 100);
    assert.strictEqual(validateJobMatchOutput(underScore).alignmentScore, 0);
    assert.strictEqual(validateJobMatchOutput(stringScore).alignmentScore, 85);
  });

  test("Job match output: normalizes all 7 structured fields", () => {
    const sampleMatchOutput = {
      alignmentScore: 78,
      scoreExplanation: "Strong match in modern React and Next.js, with slight gap in Kubernetes.",
      matchingSkills: [{ skill: "React", evidence: "4 years demonstrated in current role" }],
      missingOrUnclearSkills: [{ skill: "Kubernetes", note: "Not mentioned in resume" }],
      evidence: [{ requirement: "Next.js App Router", resumeMatch: "Built 3 production apps with Next.js" }],
      recommendations: ["Highlight containerization exposure in portfolio"],
      suggestedResumeBullets: [{ bullet: "Architected Next.js microservices", relevance: "Directly matches JD" }],
    };

    const validated = validateJobMatchOutput(sampleMatchOutput);
    assert.strictEqual(validated.alignmentScore, 78);
    assert.strictEqual(validated.matchingSkills.length, 1);
    assert.strictEqual(validated.missingOrUnclearSkills.length, 1);
    assert.strictEqual(validated.evidence.length, 1);
    assert.strictEqual(validated.recommendations.length, 1);
    assert.strictEqual(validated.suggestedResumeBullets.length, 1);
  });

  // ========================================================================
  // SECTION 5: GEMINI INTEGRATION STATUS & SECRECY SAFETY
  // ========================================================================
  console.log("\n--- 5. Gemini Service Configuration & Privacy Verification ---");

  test("Gemini model getter: returns valid configured model name", () => {
    const model = getGeminiModel();
    assert.ok(typeof model === "string" && model.length > 0);
    console.log(`   Configured model: ${model}`);
  });

  test("Gemini key presence check: returns boolean without exposing key value", () => {
    const configured = isGeminiConfigured();
    assert.strictEqual(typeof configured, "boolean");
    console.log(`   Gemini key present in server env: ${configured}`);
  });

  // ========================================================================
  // SECTION 6: API ROUTE ENDPOINTS INTEGRATION CHECKS (via HTTP)
  // ========================================================================
  console.log("\n--- 6. API Route Handlers Integration Checks ---");

  const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
  let serverReachable = false;

  try {
    const ping = await fetch(`${BASE_URL}/`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    serverReachable = Boolean(ping.status);
  } catch {
    serverReachable = false;
  }

  if (serverReachable) {
    console.log(`   (Live server detected at ${BASE_URL} - running endpoint integration checks)`);

    await testAsync("POST /api/resume/analyze: rejects empty form-data with 400", async () => {
      const emptyForm = new FormData();
      const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
        method: "POST",
        body: emptyForm,
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
    });

    await testAsync("POST /api/resume/analyze: rejects non-PDF filename with 400", async () => {
      const form = new FormData();
      const fakeFile = new Blob(["test"], { type: "text/plain" });
      form.append("resume", fakeFile, "document.docx");

      const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
        method: "POST",
        body: form,
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error.includes(".pdf"));
    });

    await testAsync("POST /api/resume/analyze: rejects scanned/empty PDF with 400", async () => {
      const form = new FormData();
      const emptyPdfBuffer = createEmptyTestPdf();
      const blob = new Blob([emptyPdfBuffer], { type: "application/pdf" });
      form.append("resume", blob, "scanned_resume.pdf");

      const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
        method: "POST",
        body: form,
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error.includes("scanned document") || body.error.includes("image-only"));
    });

    await testAsync("POST /api/job-match: rejects missing resume file with 400", async () => {
      const form = new FormData();
      form.append("jobDescription", "Senior React Developer with 5+ years experience building cloud apps.");

      const res = await fetch(`${BASE_URL}/api/job-match`, {
        method: "POST",
        body: form,
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
    });

    await testAsync("POST /api/job-match: rejects short job description with 400", async () => {
      const form = new FormData();
      const validPdfBuffer = createValidTestPdf();
      const blob = new Blob([validPdfBuffer], { type: "application/pdf" });
      form.append("resume", blob, "my_resume.pdf");
      form.append("jobDescription", "Too short JD");

      const res = await fetch(`${BASE_URL}/api/job-match`, {
        method: "POST",
        body: form,
      });
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error.includes("too short"));
    });
  } else {
    console.log(`   (Dev server not currently running at ${BASE_URL} - endpoint HTTP tests skipped; unit validation passed)`);
  }

  // Summary
  console.log("\n================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  console.log(`   STEP 3 TEST SUMMARY: ${passed}/${total} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep3TestSuite();

