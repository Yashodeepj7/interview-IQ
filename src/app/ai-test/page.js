import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AITestClient from "@/components/AITestClient";

export const metadata = {
  title: "Test Your AI Connection — InterviewIQ",
  description:
    "Verify end-to-end integration with Google Gemini 3.8 Flash using the official @google/genai SDK.",
};

export default function AITestPage() {
  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1">
        <AITestClient />
      </main>
      <Footer />
    </div>
  );
}
