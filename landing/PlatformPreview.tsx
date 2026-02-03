
import React, { useState } from "react";

const tabs = ["Playground", "Analytics", "Activity", "Sources", "Actions"];

const PlatformPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Playground");

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Platform
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            One command center for your AI workforce
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Configure agents, evaluate quality, and monitor outcomes without
            clutter.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 md:p-8">
          <div
            role="tablist"
            aria-label="Platform sections"
            className="mx-auto w-fit rounded-2xl border border-zinc-200 bg-white p-1"
          >
            <div className="flex flex-wrap justify-center gap-1">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_80px_-60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                </div>
                <div className="ml-3 text-[11px] font-mono text-zinc-500 truncate">
                  https://app.yourdomain.com/{activeTab.toLowerCase()}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Live
                </span>
              </div>
            </div>

            <div className="p-4 md:p-8">
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950">
                <img
                  key={activeTab}
                  src={`/logo.jpeg`}
                  alt={activeTab}
                  className="w-full h-auto opacity-90 saturate-0 contrast-110 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
                />
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                Preview: {activeTab}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPreview;
