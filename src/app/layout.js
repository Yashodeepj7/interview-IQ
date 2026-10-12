import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InterviewIQ — AI-Powered Career & Mock Interview Platform",
  description:
    "Supercharge your career preparation with AI-driven voice mock interviews, resume ATS analysis, job matching, and real-time performance analytics.",
  keywords: [
    "AI Mock Interview",
    "Career Coach",
    "Resume Analyzer",
    "Tech Interview Preparation",
    "STAR Method Feedback",
    "Job Description Matcher",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

