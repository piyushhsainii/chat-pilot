"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const StepItem = React.memo(({
  step,
  idx,
  isActive,
  scrollTo,
}: {
  step: HowStep;
  idx: number;
  isActive: boolean;
  scrollTo: (idx: number) => void;
}) => {
  return (
    <button onClick={() => scrollTo(idx)} className="w-full text-left">
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

      <motion.div
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="pb-6">
          <p className="text-slate-600 max-w-[46ch] leading-relaxed">
            {step.desc}
          </p>
        </div>
      </motion.div>

      <div className="border-b border-slate-200" />
    </button>
  );
});


/* ---------------- VISUAL PANEL ---------------- */

const VisualPanel = ({ step }: { step: HowStep }) => {
  return (
    <div className="h-[520px] rounded-3xl border bg-white shadow-xl overflow-hidden">
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
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const active = useMemo(() => STEPS[activeStep], [activeStep]);

  // 🔑 Click only scrolls
  const scrollTo = useCallback((idx: number) => {
    const isLg = window.matchMedia("(min-width: 1024px)").matches;

    if (isLg && sectionRef.current) {
      const top =
        sectionRef.current.getBoundingClientRect().top + window.scrollY;
      const height = sectionRef.current.offsetHeight;
      const max = Math.max(1, height - window.innerHeight);
      const p = (idx + 0.5) / STEPS.length;
      window.scrollTo({ top: top + p * max, behavior: "smooth" });
      return;
    }

    const el = stepRefs.current[idx];
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - 24;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    let raf = 0;

    const update = () => {
      if (!mq.matches) return;
      const el = sectionRef.current;
      if (!el) return;

      const top = el.getBoundingClientRect().top + window.scrollY;
      const height = el.offsetHeight;
      const max = Math.max(1, height - window.innerHeight);
      const y = window.scrollY - top;
      const p = Math.min(1, Math.max(0, y / max));
      const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
      setActiveStep((prev) => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      if (!mq.matches) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    const onMqChange = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    if ("addEventListener" in mq) mq.addEventListener("change", onMqChange);
    // @ts-expect-error - Safari
    else mq.addListener(onMqChange);

    update();
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if ("removeEventListener" in mq)
        mq.removeEventListener("change", onMqChange);
      // @ts-expect-error - Safari
      else mq.removeListener(onMqChange);
    };
  }, []);


  return (
    <section className="bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={sectionRef} className="relative lg:min-h-[250vh]">
          <div className="py-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
            <div className="w-full grid lg:grid-cols-2 gap-16">
              {/* LEFT */}
              <div className="order-2 lg:order-1">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    ref={(el) => {
                      stepRefs.current[idx] = el;
                    }}
                  >
                    <StepItem
                      step={step}
                      idx={idx}
                      isActive={idx === activeStep}
                      scrollTo={scrollTo}
                    />
                  </div>
                ))}
              </div>

              {/* RIGHT */}
              <div className="order-1 lg:order-2">
                <VisualPanel step={active} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
