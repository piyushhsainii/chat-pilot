"use client";
import GlassSurface from "@/components/GlassSurface";
import PillNav from "@/components/NavPill";
import React from "react";

interface NavbarProps {
  scrolled: boolean;
}

const Navbar: React.FC = () => {
  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none ">
      <GlassSurface
        backgroundOpacity={10}
        className={`
          pointer-events-auto
           w-full  min-w-[1200px]
          rounded-2xl
          border border-white/20
          backdrop-blur-xl
          transition-all duration-300
        `}
      >
        <PillNav
          logo={"/chat-pilot-logo.png"}
          logoAlt="Chat Pilot"
          items={[
            { href: "#how", label: "How it works" },
            { href: "#services", label: "Services" },
            { href: "#contact", label: "Contact" },
          ]}
          activeHref="/"
          className="custom-nav"
          ease="power2.easeOut"
          pillColor="#"
          hoveredPillTextColor="#"
          pillTextColor="#"
        />
      </GlassSurface>
    </div>
  );
};

export default Navbar;
