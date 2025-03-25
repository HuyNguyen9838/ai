import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import UploadSection from "@/components/UploadSection";
import ResultsSection from "@/components/ResultsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialSection from "@/components/TestimonialSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useState } from "react";
import { ClothingItem } from "@shared/schema";

export default function Home() {
  const [activeStep, setActiveStep] = useState<"upload" | "processing" | "results">("upload");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const handleItemCreated = (item: ClothingItem) => {
    setSelectedItem(item);
    setActiveStep("processing");
  };

  const handleItemProcessed = (item: ClothingItem) => {
    setSelectedItem(item);
    setActiveStep("results");
  };

  const handleReset = () => {
    setSelectedItem(null);
    setActiveStep("upload");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      
      {activeStep === "upload" && (
        <UploadSection onItemCreated={handleItemCreated} />
      )}

      {activeStep === "processing" && selectedItem && (
        <UploadSection 
          onItemCreated={handleItemCreated} 
          processingItem={selectedItem} 
          onItemProcessed={handleItemProcessed}
        />
      )}

      {activeStep === "results" && selectedItem && (
        <ResultsSection 
          item={selectedItem} 
          onReset={handleReset}
        />
      )}
      
      <FeaturesSection />
      <TestimonialSection />
      <CTASection onClick={() => setActiveStep("upload")} />
      <Footer />
    </div>
  );
}
