import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MockInterviewSetup from "@/components/MockInterviewSetup";

export const metadata = {
  title: "Configure Mock Interview — InterviewIQ",
  description:
    "Set up your customized AI mock interview session with targeted roles, experience levels, and question categories.",
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
