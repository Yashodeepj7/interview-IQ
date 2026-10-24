import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InterviewSessionClient from "@/components/InterviewSessionClient";

export const metadata = {
  title: "Mock Interview Session — InterviewIQ",
  description:
    "Active AI-driven mock interview session with real-time question prompts and answer recording.",
};

export default function InterviewSessionPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--foreground)] flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1">
        <InterviewSessionClient />
      </main>
      <Footer />
    </div>
  );
}
