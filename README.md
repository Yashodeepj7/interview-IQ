# InterviewIQ — AI-Powered Career & Mock Interview Platform

InterviewIQ is a full-stack career preparation suite built with the Next.js App Router, React 19, Tailwind CSS, Lucide React icons, and Google Gemini AI.

---

## Step 6: Authentication & Persistent Interview History

Step 6 adds secure user authentication and persistent database storage:

- **Auth.js (NextAuth.js v5)** with Credentials provider and JWT session management.
- **MongoDB Atlas Integration** using the official Node.js driver (`mongodb`).
- **Secure Password Hashing** using `bcryptjs` with salted rounds.
- **Persistent Interview History**: Saves candidate questions, answers, and Gemini AI evaluations.
- **Protected Dashboard**: View saved sessions, average competency scores, and practice metrics.
- **Ownership Authorization**: Every record query and mutation is strictly scoped to the authenticated user's ID.
- **History Management & Deletion**: Authenticated candidates can delete individual interview sessions with confirmation.
- **Public Session Accessibility**: Anonymous users can still explore the landing page and practice mock interviews without being forced to authenticate.

---

## Setup & Configuration Guide

### 1. Create a MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new organization and project, or use an existing one.
3. Deploy a free **M0 Sandbox** cluster (or preferred tier) in your target cloud region.

### 2. Create a Database User
1. In the Atlas sidebar under **Security**, navigate to **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication method.
4. Set a dedicated username (e.g., `interviewiq_app`) and generate a strong password.
5. Under **Database User Privileges**, select **Read and write to any database** (or assign a custom role restricted to the `interviewiq` database).
6. Save the user.

### 3. Restrict Atlas Network Access
1. Under **Security**, navigate to **Network Access**.
2. Click **Add IP Address**.
3. For local development, add your current IP address (or `0.0.0.0/0` with temporary access if working in dynamic environments).
4. For production, whitelist the dedicated outbound IP addresses of your hosting provider.

### 4. Construct the Connection URI
1. In the Atlas dashboard, click **Connect** on your cluster.
2. Select **Drivers** (Node.js).
3. Copy the SRV connection URI:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials. Never expose this URI to browser components or commit it to version control.

### 5. Generate an Auth.js Secret
Generate a cryptographically secure 32-byte secret using OpenSSL or Node.js:

```bash
# Using openssl:
openssl rand -base64 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Configure Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```env
# Gemini AI (Existing)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=interviewiq

# Auth.js / NextAuth
AUTH_SECRET=your_generated_32_byte_secret
AUTH_URL=http://localhost:3000
```

### 7. Install Dependencies
Install all required project dependencies:

```bash
npm install
```

### 8. Initialize Database Indexes
Run the idempotent index initialization script to create unique indexes and compound indexes in your MongoDB Atlas cluster:

```bash
npm run init-db
# Or: node scripts/init-indexes.js
```

This creates:
- `users`: `{ normalizedEmail: 1 }` (unique)
- `interviews`: `{ userId: 1, createdAt: -1 }` (compound query index)
- `interviews`: `{ userId: 1, sessionIdentifier: 1 }` (sparse idempotency index)

### 9. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

### Running Automated Test Suites

1. **Step 6 Authentication & Persistence Test Suite**:
   ```bash
   node test_step6_suite.js
   ```

2. **Step 5 Voice Integration Regression Suite**:
   ```bash
   node test_step5_suite.js
   ```

3. **Code Quality and Build Verification**:
   ```bash
   npm run lint
   npm run build
   ```

---

## API Routes Implemented

- `POST /api/auth/register` — Validates and creates a new user account with hashed password.
- `GET/POST /api/auth/[...nextauth]` — NextAuth credentials handler for login, session, and CSRF token.
- `POST /api/interviews` — Persists a completed or evaluated interview session scoped to the authenticated user.
- `GET /api/interviews` — Returns the current authenticated user's interview history.
- `GET /api/interviews/[id]` — Returns details of a specific interview owned by the user.
- `DELETE /api/interviews/[id]` — Deletes an owned interview record.
