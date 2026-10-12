import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import { normalizeEmail, verifyPassword, sanitizeUser } from "@/lib/auth-helpers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = normalizeEmail(credentials.email);
        if (!normalizedEmail) {
          return null;
        }

        try {
          const db = await getDb();
          const user = await db.collection("users").findOne({ normalizedEmail });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return sanitizeUser(user);
        } catch (err) {
          console.error("Authorize database error:", err.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
