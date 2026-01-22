import Link from "next/link";
import React from "react";

const Hero: React.FC = () => {
  const logos = [
    "Sage",
    "Chuck E Cheese",
    "Miele",
    "IHG",
    "Opal",
    "F45 Training",
    "Al.pian",
    "Sage",
    "Chuck E Cheese",
    "Miele",
    "IHG",
    "Opal",
    "F45 Training",
    "Al.pian",
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-6 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Now powered by Gemini 3 Pro
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
          AI agents for <span className="gradient-text">magical</span>{" "}
          <br className="hidden md:block" /> customer experiences
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Build, train and deploy custom AI support agents that solve customer
          problems instantly, 24/7. No coding required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link href={"/dashboard"}>
            <button className="gradient-bg bg-black px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300">
              Build your agent
            </button>
          </Link>
        </div>
        <p className="text-sm text-slate-400 mb-20 italic">
          No credit card required
        </p>

        <div className="relative max-w-5xl mx-auto mb-24 rounded-2xl p-2 bg-gradient-to-br from-slate-200 to-white shadow-2xl animate-float">
          <div className="rounded-xl overflow-hidden bg-white border border-slate-100">
            <img
              src="https://picsum.photos/seed/dashboard/1200/675"
              alt="Product Dashboard"
              className="w-full h-auto opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
          </div>
        </div>

        <div className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-10">
          Trusted by 10,000+ businesses worldwide
        </div>

        <div className="overflow-hidden relative w-full mask-logos">
          <div className="logo-carousel flex gap-12 items-center">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="text-2xl font-bold text-slate-300 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all min-w-[200px]"
              >
                {logo}
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
