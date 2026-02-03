
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/chat-pilot-logo.png"
                alt="Chat Pilot"
                className="h-9 w-auto opacity-90"
              />
              <span className="text-sm font-semibold tracking-tight">
                Chat Pilot
              </span>
            </div>
            <p className="mt-4 text-sm text-zinc-300 leading-relaxed max-w-sm">
              A design-forward platform for deploying customer support agents
              that feel simple and perform reliably.
            </p>

            <div className="mt-6 flex items-center gap-4 text-sm text-zinc-400">
              <a
                href="https://github.com/piyushhsainii"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
              <a
                href="https://x.com/piyushsainii"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                X
              </a>
              <a
                href="https://www.linkedin.com/in/piyushhsainii/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Product
            </h5>
            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              <li>
                <a href="#how" className="hover:text-white transition">
                  How it works
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Resources
            </h5>
            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  API
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Company
            </h5>
            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Trust center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="text-xs text-zinc-400">
            © 2026 Chat Pilot. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
              SOC 2 Type II
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300">
              GDPR
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
