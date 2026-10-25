import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MockInterviewSetup from "@/components/MockInterviewSetup";

export const metadata = {
  title: "Configure AI Mock Interview — Voice & Typed Practice",
  description:
    "Set up your customized AI mock interview session with targeted roles, experience levels, question counts, and real-time voice synthesis.",
  alternates: {
    canonical: "/mock-interview",
  },
  openGraph: {
    title: "Configure AI Mock Interview — InterviewIQ",
    description:
      "Practice customized technical and behavioral interview sessions with automated AI voice questions and instant feedback.",
    url: "https://interviewiq-career.vercel.app/mock-interview",
  },
};

export default function MockInterviewPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <MockInterviewSetup />
      </main>
      <Footer />
    </div>
  );
}
