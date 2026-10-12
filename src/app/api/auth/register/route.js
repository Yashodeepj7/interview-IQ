import { getDb, isMongoConfigured, sanitizeMongoError } from "@/lib/mongodb";
import {
  normalizeEmail,
  validateRegistrationInput,
  hashPassword,
  sanitizeUser,
} from "@/lib/auth-helpers";

export async function POST(request) {
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

  const { name, email, password, confirmPassword } = body || {};

  // Validate all fields
  const validationError = validateRegistrationInput({
    name,
    email,
    password,
    confirmPassword,
  });

  if (validationError) {
    return Response.json(
      {
        success: false,
        error: validationError,
      },
      { status: 400 }
    );
  }

  if (!isMongoConfigured()) {
    return Response.json(
      {
        success: false,
        error: "Database connection is not configured.",
        setupRequired: true,
        instructions:
          "Please add MONGODB_URI to your .env.local file and restart the development server.",
      },
      { status: 503 }
    );
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const db = await getDb();
    const usersCollection = db.collection("users");

    // Check for existing account with normalized email
    const existingUser = await usersCollection.findOne({ normalizedEmail });
    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    // Hash the password securely with bcrypt
    const passwordHash = await hashPassword(password);

    const now = new Date();
    const newUserDoc = {
      name: name.trim(),
      email: email.trim(),
      normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(newUserDoc);

    const createdUser = {
      _id: result.insertedId,
      ...newUserDoc,
    };

    return Response.json(
      {
        success: true,
        message: "Registration successful. You can now sign in with your credentials.",
        user: sanitizeUser(createdUser),
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000) gracefully
    if (error?.code === 11000) {
      return Response.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    const safeErr = sanitizeMongoError(error);
    return Response.json(
      {
        success: false,
        error: "Registration failed due to a database error. Please try again later.",
        details: safeErr.message,
      },
      { status: 500 }
    );
  }
}
