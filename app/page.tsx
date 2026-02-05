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
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative ">
      <Navbar scrolled={scrolled} />
      <main>
        <Hero2 />
        <section id="how">
          <HowItWorks />
        </section>
        <section id="services">
          <Benefits />
        </section>
        <section id="contact">
          <FinalCTA />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default App;
