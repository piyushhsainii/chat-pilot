import Link from "next/link";
import React from "react";

interface NavbarProps {
  scrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass border-b border-slate-200/50 py-3 shadow-sm" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo2.png"
            alt=""
            className="max-h-12 w-full select-none"
          />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"></div>

        <div className="flex items-center gap-4 ">
          <Link href={"/login"}>
            <button className="bg-slate-900 hover:cursor-pointer text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10">
              Try for Free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
