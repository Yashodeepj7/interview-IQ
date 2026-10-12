import { auth } from "@/auth";
import { getDb, ObjectId, isMongoConfigured, sanitizeMongoError } from "@/lib/mongodb";

export async function GET(request, { params }) {
  // 1. Authenticate user from session
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: Please sign in to view this interview.",
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

  const { id } = await params;
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return Response.json(
      {
        success: false,
        error: "Invalid interview record identifier.",
      },
      { status: 400 }
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
    const interviewObjectId = new ObjectId(id);

    // Enforce ownership: query by both _id and userId
    const interview = await db.collection("interviews").findOne({
      _id: interviewObjectId,
      userId: userObjectId,
    });

    if (!interview) {
      return Response.json(
        {
          success: false,
          error: "Interview not found.",
        },
        { status: 404 }
      );
    }

    const serialized = {
      id: interview._id.toString(),
      status: interview.status,
      settings: interview.settings,
      questions: interview.questions,
      answers: interview.answers,
      evaluation: interview.evaluation,
      overallScore: interview.overallScore,
      answeredCount: interview.answeredCount,
      skippedCount: interview.skippedCount,
      durationSeconds: interview.durationSeconds,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    };

    return Response.json({
      success: true,
      interview: serialized,
    });
  } catch (error) {
    const safeErr = sanitizeMongoError(error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch interview details.",
        details: safeErr.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // 1. Authenticate user from session
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: "Unauthorized: Please sign in to delete interview records.",
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

  const { id } = await params;
  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return Response.json(
      {
        success: false,
        error: "Invalid interview record identifier.",
      },
      { status: 400 }
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
    const interviewObjectId = new ObjectId(id);

    // Enforce ownership: delete only matching _id and userId
    const result = await db.collection("interviews").deleteOne({
      _id: interviewObjectId,
      userId: userObjectId,
    });

    if (result.deletedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Interview not found or unauthorized to delete.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Interview record deleted successfully.",
    });
  } catch (error) {
    const safeErr = sanitizeMongoError(error);
    return Response.json(
      {
        success: false,
        error: "Failed to delete interview record.",
        details: safeErr.message,
      },
      { status: 500 }
    );
  }
}
