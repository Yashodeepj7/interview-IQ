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
    <div className="relative min-h-screen bg-[var(--bg-base)] text-[var(--foreground)] flex flex-col justify-between transition-colors duration-200">
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
