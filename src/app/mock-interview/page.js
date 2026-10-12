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
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1">
        <MockInterviewSetup />
      </main>
      <Footer />
    </div>
  );
}
