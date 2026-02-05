"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  BarChart3,
  Database,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

type HowStep = {
  id: string;
  title: string;
  desc: string;
  mediaSrc: string;
  icon: React.ReactNode;
};

/* ---------------- DATA ---------------- */

const STEPS: HowStep[] = [
  {
    id: "deploy",
    title: "Setup & Deploy the Bot",
    desc:
      "Launch the setup bot, answer a few prompts, and it generates your configuration instantly.",
    mediaSrc: "/step1.png",
    icon: <Fingerprint />,
  },
  {
    id: "connect",
    title: "Connect Multiple Tools",
    desc:
      "Link your CRM, email, analytics, ads, Slack, and more with one-click setup.",
    mediaSrc: "/step2.png",
    icon: <ShieldCheck />,
  },
  {
    id: "embed",
    title: "Embed on Your Website",
    desc:
      "Drop a single snippet on your site and verify instantly — no developer required.",
    mediaSrc: "/step3.png",
    icon: <Database />,
  },
  {
    id: "track",
    title: "Track Analytics That Drive Growth",
    desc:
      "Track leads, bookings, revenue and ROI in one unified dashboard.",
    mediaSrc: "/step4.png",
    icon: <BarChart3 />,
  },
];

/* ---------------- STEP ITEM ---------------- */

const StepItem = ({
  step,
  idx,
  isActive,
  onEnterView,
  scrollTo,
  setRef,
}: {
  step: HowStep;
  idx: number;
  isActive: boolean;
  onEnterView: (idx: number) => void;
  scrollTo: (idx: number) => void;
  setRef: (el: HTMLDivElement | null) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const inView = useInView(ref, {
    margin: "-45% 0px -45% 0px",
    amount: 0.5,
  });

  useEffect(() => {
    if (inView) onEnterView(idx);
  }, [inView, idx, onEnterView]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        setRef(el);
      }}
    >
      <button onClick={() => scrollTo(idx)} className="w-full text-left">
        {/* Header */}
        <div className="flex items-start gap-4 py-6">
          <motion.span
            animate={{ rotate: isActive ? 0 : 90 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-3xl font-light text-slate-500 leading-none"
          >
            {isActive ? "−" : "+"}
          </motion.span>

          <h3
            className={`text-xl md:text-2xl transition-colors ${isActive ? "text-slate-900" : "text-slate-400"
              }`}
          >
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6">
                <p className="text-slate-600 max-w-[46ch] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-b border-slate-200" />
      </button>
    </div>
  );
};

/* ---------------- VISUAL PANEL ---------------- */

const VisualPanel = ({ step }: { step: HowStep }) => {
  return (
    <div className="sticky top-24 h-[520px] rounded-3xl border bg-white shadow-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={step.id}
          src={step.mediaSrc}
          alt={step.title}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full h-full object-contain"
        />
      </AnimatePresence>
    </div>
  );
};

/* ---------------- MAIN ---------------- */

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const active = useMemo(() => STEPS[activeStep], [activeStep]);

  // 🔑 Scroll decides active step
  const onEnterView = useCallback((idx: number) => {
    setActiveStep((prev) => (prev === idx ? prev : idx));
  }, []);

  // 🔑 Click only scrolls
  const scrollTo = useCallback((idx: number) => {
    const el = refs.current[idx];
    if (!el) return;

    const y =
      window.scrollY +
      el.getBoundingClientRect().top -
      window.innerHeight * 0.35;

    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        {/* LEFT */}
        <div>
          {STEPS.map((step, idx) => (
            <StepItem
              key={step.id}
              step={step}
              idx={idx}
              isActive={idx === activeStep}
              onEnterView={onEnterView}
              scrollTo={scrollTo}
              setRef={(el) => (refs.current[idx] = el)}
            />
          ))}
        </div>

        {/* RIGHT */}
        <VisualPanel step={active} />
      </div>
    </section>
  );
};

export default HowItWorks;
