"use client";
import React, { useState, useEffect } from "react";
// import { Bot, CreditSystem } from "./types";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/landing/Navbar";
import Hero from "@/landing/Hero";
import Highlights from "@/landing/Highlights";
import HowItWorks from "@/landing/HowItWorks";
import Features from "@/landing/Features";
import PlatformPreview from "@/landing/PlatformPreview";
import Benefits from "@/landing/Benefits";
import Advantages from "@/landing/Advantages";
import Testimonials from "@/landing/Testimonials";
import Security from "@/landing/Security";
import FinalCTA from "@/landing/FinalCTA";
import Footer from "@/landing/Footer";
import Hero2 from "@/landing/Hero2";

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <Navbar scrolled={scrolled} />
      <main>
        <Hero2 />
        <HowItWorks />
        <Benefits />
        {/* <Testimonials /> */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
