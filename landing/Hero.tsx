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
  ];

  return (
    <section className="relative overflow-hidden bg-white text-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_15%,rgba(56,189,248,0.20),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_85%,rgba(99,102,241,0.14),transparent_60%)]" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-20 md:pt-40 md:pb-28 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-900/10 bg-white/70 text-xs font-semibold text-zinc-700 mb-6 shadow-sm backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          Production-ready AI agents for customer support
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-balance">
          Build an AI agent that resolves issues
          <br className="hidden md:block" /> with speed and certainty.
        </h1>

        <p className="mt-5 text-base md:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Train on your docs, connect your tools, and deploy everywhere. Simple
          for your team, powerful for your customers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto  inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition"
          >
            <button className="border border-black">
              Build your agent
            </button>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-zinc-900/15 bg-transparent text-zinc-900 text-sm font-semibold hover:bg-zinc-900/5 transition"
          >
            See it in action
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          No credit card required.
        </p>

        <div className="mt-14 md:mt-20">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-zinc-900/10 bg-white/80 p-2 shadow-[0_40px_120px_-60px_rgba(24,24,27,0.25)]">
            <div className="relative rounded-2xl overflow-hidden bg-white border border-zinc-900/10">
              <video
                src="/chat-pilot-initial-walkthrough.mp4"
                controls
                muted
                autoPlay
                className="w-full h-auto opacity-95 contrast-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
            </div>
          </div>

          <div className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Trusted by teams worldwide
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-zinc-500">
            {logos.map((logo) => (
              <span key={logo} className="opacity-80 hover:opacity-100 transition">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
