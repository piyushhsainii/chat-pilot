"use client";

import React from "react";

interface NavbarProps {
  scrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur border-b border-zinc-200 py-3"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/chat-pilot-logo.png"
            alt="Chat Pilot"
            className={`max-h-10 w-auto select-none transition-opacity ${scrolled ? "opacity-100" : "opacity-90"
              }`}
          />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { id: "how", label: "How it works" },
            { id: "services", label: "Services" },
            { id: "contact", label: "Contact" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => handleScroll(l.id)}
              className={
                "inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold tracking-tight transition " +
                (scrolled
                  ? "border-zinc-200 bg-white/60 text-zinc-700 hover:bg-white hover:text-zinc-950"
                  : "border-zinc-900/10 bg-white/45 text-zinc-900/80 hover:bg-white/70 hover:text-zinc-950")
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
