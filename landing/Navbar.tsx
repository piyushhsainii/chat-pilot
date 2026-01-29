import Link from "next/link";
import React from "react";

interface NavbarProps {
  scrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur border-b border-zinc-200 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo2.png"
            alt="Chat Pilot"
            className={`max-h-10 w-auto select-none transition-opacity ${
              scrolled ? "opacity-100" : "opacity-90"
            }`}
          />
        </div>

        <div
          className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${
            scrolled ? "text-zinc-600" : "text-zinc-200"
          }`}
        >
          <a
            href="#features"
            className={`hover:opacity-100 transition-opacity ${
              scrolled ? "opacity-80 hover:text-zinc-900" : "opacity-80 hover:text-white"
            }`}
          >
            Product
          </a>
          <a
            href="#how"
            className={`hover:opacity-100 transition-opacity ${
              scrolled ? "opacity-80 hover:text-zinc-900" : "opacity-80 hover:text-white"
            }`}
          >
            How it works
          </a>
          <a
            href="#security"
            className={`hover:opacity-100 transition-opacity ${
              scrolled ? "opacity-80 hover:text-zinc-900" : "opacity-80 hover:text-white"
            }`}
          >
            Security
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-sm font-semibold px-5 py-2.5 rounded-full transition active:scale-[0.99] ${
              scrolled
                ? "bg-zinc-950 text-white hover:bg-zinc-900"
                : "bg-white text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
