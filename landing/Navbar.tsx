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
          ? "bg-zinc-950/70 backdrop-blur border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo2.png"
            alt=""
            className="max-h-12 w-full select-none"
          />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          <a href="#features" className="hover:text-white transition-colors">
            Product
          </a>
          <a href="#how" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security
          </a>
        </div>

        <div className="flex items-center gap-4 ">
          <Link href={"/login"}>
            <button className="hover:cursor-pointer text-sm font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95 bg-sky-400 text-zinc-950 hover:bg-sky-300 shadow-lg shadow-sky-400/10">
              Start free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
