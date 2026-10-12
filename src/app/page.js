"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import MockInterviewModal from "@/components/MockInterviewModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar onOpenMockModal={handleOpenModal} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero onOpenMockModal={handleOpenModal} />

        {/* Feature Cards Grid Section */}
        <FeaturesSection />

        {/* Call to Action Section */}
        <CTASection onOpenMockModal={handleOpenModal} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Mock Interview Configuration Modal */}
      <MockInterviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
