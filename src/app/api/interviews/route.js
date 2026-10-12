import { auth } from "@/auth";
import { getDb, ObjectId, isMongoConfigured, sanitizeMongoError } from "@/lib/mongodb";

const ALLOWED_EXPERIENCES = [
  "Fresher",
  "0–2 years",
  "0-2 years",
  "3–5 years",
  "3-5 years",
  "5+ years",
];
const ALLOWED_TYPES = ["Technical", "HR/Behavioral", "Behavioral", "Mixed"];
const ALLOWED_DIFFICULTIES = ["Easy", "Medium", "Hard"];

export async function POST(request) {
  // 1. Authenticate user from session
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: You must be signed in to save interview sessions.",
      },
      { status: 401 }
    );
  }

  const userIdString = session.user.id;
  if (!ObjectId.isValid(userIdString)) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: Invalid user session identifier.",
      },
      { status: 401 }
    );
  }

  // 2. Parse JSON body safely
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: "Validation failed: Invalid or malformed JSON in request body.",
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      {
        success: false,
        error: "Validation failed: Request body must be an object.",
      },
      { status: 400 }
    );
  }

  // 3. Validate settings
  const { settings, questions, answers, evaluation, sessionIdentifier, durationSeconds } = body;

  if (!settings || typeof settings !== "object") {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'settings' object is required.",
      },
      { status: 400 }
    );
  }

  const role = typeof settings.role === "string" ? settings.role.trim() : "";
  if (role.length < 2 || role.length > 100) {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'settings.role' must be between 2 and 100 characters.",
      },
      { status: 400 }
    );
  }

  const experience = typeof settings.experience === "string" ? settings.experience.trim() : "0–2 years";
  const type = typeof settings.type === "string" ? settings.type.trim() : "Mixed";
  const difficulty = typeof settings.difficulty === "string" ? settings.difficulty.trim() : "Medium";
  const questionCount = Number(settings.questionCount) || 5;

  // 4. Validate questions array
  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 15) {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'questions' must be an array of 1 to 15 items.",
      },
      { status: 400 }
    );
  }

  const sanitizedQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q.id !== "string" || !q.id.trim() || typeof q.text !== "string" || q.text.trim().length < 5) {
      return Response.json(
        {
          success: false,
          error: `Validation failed: Question at index ${i} must have valid 'id' and 'text'.`,
        },
        { status: 400 }
      );
    }
    sanitizedQuestions.push({
      id: q.id.trim(),
      text: q.text.trim(),
      category: typeof q.category === "string" ? q.category.trim() : type,
      expectedDurationSeconds: Number.isFinite(Number(q.expectedDurationSeconds))
        ? Math.round(Number(q.expectedDurationSeconds))
        : 120,
    });
  }

  // 5. Validate and sanitize answers
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'answers' must be an object mapping question IDs to responses.",
      },
      { status: 400 }
    );
  }

  const sanitizedAnswers = {};
  sanitizedQuestions.forEach((q) => {
    const rawAns = answers[q.id];
    if (typeof rawAns === "string") {
      sanitizedAnswers[q.id] = rawAns.trim().slice(0, 4000);
    } else {
      sanitizedAnswers[q.id] = "";
    }
  });

  // Calculate server-side metrics
  const answeredCount = sanitizedQuestions.filter(
    (q) => (sanitizedAnswers[q.id] || "").length >= 5
  ).length;
  const skippedCount = sanitizedQuestions.length - answeredCount;

  // 6. Handle evaluation (if provided)
  let sanitizedEvaluation = null;
  let overallScore = null;
  let status = "completed";

  if (evaluation && typeof evaluation === "object") {
    status = "evaluated";
    const rawScore = Number(evaluation.overallScore);
    overallScore = Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 100
      ? Math.round(rawScore)
      : null;

    sanitizedEvaluation = {
      evaluationId: typeof evaluation.evaluationId === "string" ? evaluation.evaluationId : undefined,
      overallScore,
      scoringExplanation: typeof evaluation.scoringExplanation === "string" ? evaluation.scoringExplanation : "",
      summary: typeof evaluation.summary === "string" ? evaluation.summary : "",
      metrics: {
        totalQuestions: sanitizedQuestions.length,
        answeredCount,
        unansweredCount: skippedCount,
      },
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 10) : [],
      improvementAreas: Array.isArray(evaluation.improvementAreas) ? evaluation.improvementAreas.slice(0, 10) : [],
      recommendations: Array.isArray(evaluation.recommendations) ? evaluation.recommendations.slice(0, 10) : [],
      questionEvaluations: Array.isArray(evaluation.questionEvaluations)
        ? evaluation.questionEvaluations.map((qe) => ({
            questionId: qe?.questionId || "",
            questionText: qe?.questionText || "",
            category: qe?.category || "",
            answered: Boolean(qe?.answered),
            candidateAnswer: typeof qe?.candidateAnswer === "string" ? qe.candidateAnswer : "",
            score: Number.isFinite(Number(qe?.score)) ? Math.round(Number(qe.score)) : null,
            feedback: typeof qe?.feedback === "string" ? qe.feedback : "",
            strengths: Array.isArray(qe?.strengths) ? qe.strengths : [],
            improvements: Array.isArray(qe?.improvements) ? qe.improvements : [],
            suggestedAnswer: typeof qe?.suggestedAnswer === "string" ? qe.suggestedAnswer : "",
            starBreakdown: qe?.starBreakdown && typeof qe.starBreakdown === "object" ? qe.starBreakdown : null,
            technicalRubric: qe?.technicalRubric && typeof qe.technicalRubric === "object" ? qe.technicalRubric : null,
          }))
        : [],
      disclaimer: typeof evaluation.disclaimer === "string" ? evaluation.disclaimer : undefined,
    };
  }

  if (!isMongoConfigured()) {
    return Response.json(
      {
        success: false,
        error: "Database connection is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    const db = await getDb();
    const interviewsCollection = db.collection("interviews");
    const userObjectId = new ObjectId(userIdString);

    // Idempotency check: check if already saved by sessionIdentifier
    const cleanSessionId = typeof sessionIdentifier === "string" && sessionIdentifier.trim().length > 0
      ? sessionIdentifier.trim()
      : null;

    if (cleanSessionId) {
      const existing = await interviewsCollection.findOne({
        userId: userObjectId,
        sessionIdentifier: cleanSessionId,
      });

      if (existing) {
        return Response.json(
          {
            success: true,
            interviewId: existing._id.toString(),
            alreadySaved: true,
            message: "Interview session was previously saved.",
          },
          { status: 200 }
        );
      }
    }

    const safeDuration = Number.isFinite(Number(durationSeconds))
      ? Math.max(0, Math.round(Number(durationSeconds)))
      : 0;

    const now = new Date();
    const interviewDoc = {
      userId: userObjectId,
      sessionIdentifier: cleanSessionId,
      status,
      settings: {
        role,
        experience,
        type,
        difficulty,
        questionCount,
        topics: settings.topics ? String(settings.topics).trim().slice(0, 1500) : undefined,
        inputMode: settings.inputMode === "voice" ? "voice" : "typed",
      },
      questions: sanitizedQuestions,
      answers: sanitizedAnswers,
      evaluation: sanitizedEvaluation,
      overallScore,
      answeredCount,
      skippedCount,
      durationSeconds: safeDuration,
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    };

    const insertResult = await interviewsCollection.insertOne(interviewDoc);

    return Response.json(
      {
        success: true,
        interviewId: insertResult.insertedId.toString(),
        message: "Interview session successfully saved to your dashboard history.",
      },
      { status: 201 }
    );
  } catch (error) {
    const safeErr = sanitizeMongoError(error);
    return Response.json(
      {
        success: false,
        error: "Failed to persist interview session to database.",
        details: safeErr.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 1. Authenticate user from session
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: Please sign in to view your interview history.",
      },
      { status: 401 }
    );
  }

  const userIdString = session.user.id;
  if (!ObjectId.isValid(userIdString)) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: Invalid user session identifier.",
      },
      { status: 401 }
    );
  }

  if (!isMongoConfigured()) {
    return Response.json(
      {
        success: false,
        error: "Database connection is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    const db = await getDb();
    const userObjectId = new ObjectId(userIdString);

    const interviews = await db
      .collection("interviews")
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .project({
        _id: 1,
        status: 1,
        settings: 1,
        overallScore: 1,
        answeredCount: 1,
        skippedCount: 1,
        durationSeconds: 1,
        createdAt: 1,
        completedAt: 1,
      })
      .toArray();

    const serialized = interviews.map((item) => ({
      id: item._id.toString(),
      status: item.status,
      settings: item.settings,
      overallScore: item.overallScore,
      answeredCount: item.answeredCount,
      skippedCount: item.skippedCount,
      durationSeconds: item.durationSeconds,
      createdAt: item.createdAt,
      completedAt: item.completedAt,
    }));

    return Response.json({
      success: true,
      interviews: serialized,
      totalCount: serialized.length,
    });
  } catch (error) {
    const safeErr = sanitizeMongoError(error);
    return Response.json(
      {
        success: false,
        error: "Failed to retrieve interview history.",
        details: safeErr.message,
      },
      { status: 500 }
    );
  }
}
