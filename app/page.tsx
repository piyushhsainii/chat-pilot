"use client";
import React from "react";
import Navbar from "@/landing/Navbar";
import HowItWorks from "@/landing/HowItWorks";
import Benefits from "@/landing/Benefits";
import FinalCTA from "@/landing/FinalCTA";
import Footer from "@/landing/Footer";
import Hero2 from "@/landing/Hero2";
const App: React.FC = () => {


  return (
    <div className="relative ">
      <Navbar />
      <main>
        <Hero2 />
        {/* <Hero3 /> */}
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
