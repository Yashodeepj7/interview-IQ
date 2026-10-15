/**
 * Validation and schema normalization utilities for AI Resume Analyzer and Job Description Matcher.
 */

export const MIN_JD_LENGTH = 30;
export const MAX_JD_LENGTH = 15000;

/**
 * Validates a submitted job description string.
 *
 * @param {any} jd
 * @returns {{ valid: boolean, error?: string, sanitized?: string }}
 */
export function validateJobDescription(jd) {
  if (typeof jd !== "string") {
    return {
      valid: false,
      error: "Job description is required and must be text.",
    };
  }

  const trimmed = jd.trim();

  if (trimmed.length < MIN_JD_LENGTH) {
    return {
      valid: false,
      error: `Job description is too short (minimum ${MIN_JD_LENGTH} characters required). Please paste a complete job description or key responsibilities.`,
    };
  }

  if (trimmed.length > MAX_JD_LENGTH) {
    return {
      valid: false,
      error: `Job description exceeds the maximum length of ${MAX_JD_LENGTH.toLocaleString()} characters (received ${trimmed.length.toLocaleString()} characters). Please trim auxiliary company marketing copy.`,
    };
  }

  return {
    valid: true,
    sanitized: trimmed,
  };
}

/**
 * Validates and normalizes structured output from Gemini Resume Analysis.
 * Guarantees all required fields exist and conform to consistent UI types.
 *
 * @param {any} raw
 * @returns {object} Validated, normalized resume analysis
 */
export function validateResumeAnalysisOutput(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid resume analysis data: expected an object.");
  }

  const summary = typeof raw.summary === "string" && raw.summary.trim()
    ? raw.summary.trim()
    : "Professional candidate profile extracted from uploaded resume.";

  // Normalize skills categories
  let skills = [];
  if (Array.isArray(raw.skills)) {
    skills = raw.skills
      .map((cat) => {
        if (!cat || typeof cat !== "object") return null;
        const categoryName = typeof cat.category === "string" ? cat.category.trim() : "Core Competencies";
        const items = Array.isArray(cat.items)
          ? cat.items
              .map((item) => {
                if (typeof item === "string" && item.trim()) {
                  return { name: item.trim(), evidence: "" };
                }
                if (item && typeof item === "object" && item.name) {
                  return {
                    name: String(item.name).trim(),
                    evidence: typeof item.evidence === "string" ? item.evidence.trim() : "",
                  };
                }
                return null;
              })
              .filter(Boolean)
          : Array.isArray(cat.skills)
          ? cat.skills
              .map((s) => (typeof s === "string" && s.trim() ? { name: s.trim(), evidence: "" } : null))
              .filter(Boolean)
          : [];

        return items.length > 0 ? { category: categoryName, items } : null;
      })
      .filter(Boolean);
  }

  // Normalize experience highlights
  const experienceHighlights = Array.isArray(raw.experienceHighlights)
    ? raw.experienceHighlights
        .map((item) => (typeof item === "string" ? item.trim() : typeof item?.text === "string" ? item.text.trim() : ""))
        .filter(Boolean)
    : [];

  // Normalize project highlights
  const projectHighlights = Array.isArray(raw.projectHighlights)
    ? raw.projectHighlights
        .map((item) => {
          if (typeof item === "string" && item.trim()) {
            return { title: "Featured Project", description: item.trim(), technologies: [] };
          }
          if (item && typeof item === "object") {
            return {
              title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "Project",
              description: typeof item.description === "string" ? item.description.trim() : "",
              technologies: Array.isArray(item.technologies)
                ? item.technologies.map((t) => String(t).trim()).filter(Boolean)
                : [],
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // Normalize strengths
  const strengths = Array.isArray(raw.strengths)
    ? raw.strengths.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
    : [];

  // Normalize improvements
  const improvements = Array.isArray(raw.improvements)
    ? raw.improvements.map((i) => (typeof i === "string" ? i.trim() : "")).filter(Boolean)
    : [];

  // Normalize bullet suggestions
  const bulletSuggestions = Array.isArray(raw.bulletSuggestions)
    ? raw.bulletSuggestions
        .map((b) => {
          if (typeof b === "string" && b.trim()) {
            return {
              original: "Demonstrated resume responsibility",
              suggested: b.trim(),
              rationale: "Quantifiable impact and action-oriented rewrite.",
            };
          }
          if (b && typeof b === "object") {
            const suggested = typeof b.suggested === "string" ? b.suggested.trim() : "";
            if (!suggested) return null;
            return {
              original: typeof b.original === "string" ? b.original.trim() : "",
              suggested,
              rationale: typeof b.rationale === "string" ? b.rationale.trim() : "Clarifies demonstrated scope and results.",
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return {
    summary,
    skills,
    experienceHighlights,
    projectHighlights,
    strengths,
    improvements,
    bulletSuggestions,
  };
}

/**
 * Validates and normalizes structured output from Gemini Job Description Matcher.
 *
 * @param {any} raw
 * @returns {object} Validated, normalized job match report
 */
export function validateJobMatchOutput(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Invalid job match data: expected an object.");
  }

  // Parse and clamp alignment score (0 - 100)
  let alignmentScore = 50;
  if (typeof raw.alignmentScore === "number" && !isNaN(raw.alignmentScore)) {
    alignmentScore = Math.min(100, Math.max(0, Math.round(raw.alignmentScore)));
  } else if (typeof raw.alignmentScore === "string") {
    const parsed = parseInt(raw.alignmentScore.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed)) {
      alignmentScore = Math.min(100, Math.max(0, parsed));
    }
  }

  const scoreExplanation = typeof raw.scoreExplanation === "string" && raw.scoreExplanation.trim()
    ? raw.scoreExplanation.trim()
    : "Heuristic alignment estimate based on detected overlap between demonstrated resume qualifications and target job requirements.";

  // Normalize matching skills
  const matchingSkills = Array.isArray(raw.matchingSkills)
    ? raw.matchingSkills
        .map((item) => {
          if (typeof item === "string" && item.trim()) {
            return { skill: item.trim(), evidence: "Demonstrated in resume experience or projects." };
          }
          if (item && typeof item === "object" && item.skill) {
            return {
              skill: String(item.skill).trim(),
              evidence: typeof item.evidence === "string" ? item.evidence.trim() : (typeof item.resumeEvidence === "string" ? item.resumeEvidence.trim() : ""),
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // Normalize missing or unclear skills
  const missingOrUnclearSkills = Array.isArray(raw.missingOrUnclearSkills)
    ? raw.missingOrUnclearSkills
        .map((item) => {
          if (typeof item === "string" && item.trim()) {
            return { skill: item.trim(), note: "Not clearly demonstrated or quantified in the supplied resume." };
          }
          if (item && typeof item === "object" && item.skill) {
            return {
              skill: String(item.skill).trim(),
              note: typeof item.note === "string" ? item.note.trim() : "Recommended for clarification during interviews.",
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // Normalize evidence mapping
  const evidence = Array.isArray(raw.evidence)
    ? raw.evidence
        .map((item) => {
          if (typeof item === "string" && item.trim()) {
            return { requirement: "Role Requirement", resumeMatch: item.trim() };
          }
          if (item && typeof item === "object") {
            const req = typeof item.requirement === "string" ? item.requirement.trim() : "Job Requirement";
            const match = typeof item.resumeMatch === "string" ? item.resumeMatch.trim() : (typeof item.evidence === "string" ? item.evidence.trim() : "");
            return { requirement: req, resumeMatch: match };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // Normalize recommendations
  const recommendations = Array.isArray(raw.recommendations)
    ? raw.recommendations.map((r) => (typeof r === "string" ? r.trim() : "")).filter(Boolean)
    : [];

  // Normalize suggested resume bullets
  const suggestedResumeBullets = Array.isArray(raw.suggestedResumeBullets)
    ? raw.suggestedResumeBullets
        .map((b) => {
          if (typeof b === "string" && b.trim()) {
            return { bullet: b.trim(), relevance: "Emphasizes qualifications already evidenced in resume." };
          }
          if (b && typeof b === "object" && b.bullet) {
            return {
              bullet: String(b.bullet).trim(),
              relevance: typeof b.relevance === "string" ? b.relevance.trim() : "Directly aligns existing experience to target posting.",
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return {
    alignmentScore,
    scoreExplanation,
    matchingSkills,
    missingOrUnclearSkills,
    evidence,
    recommendations,
    suggestedResumeBullets,
  };
}
