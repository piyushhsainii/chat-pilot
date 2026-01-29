
import Link from "next/link";
import React from "react";

const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-zinc-950 text-white p-10 md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_0%,rgba(56,189,248,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_90%_120%,rgba(255,255,255,0.08),transparent_55%)]" />

          <div className="relative max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Get started
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
              Make support your competitive edge.
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-300 leading-relaxed">
              Build an agent your team trusts and your customers enjoy using.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition"
              >
                Build your agent
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition"
              >
                Talk to sales
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
