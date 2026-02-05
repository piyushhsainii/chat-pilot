"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  BarChart3,
  Database,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

type HowStep = {
  id: string;
  number: string;
  title: string;
  desc: string;
  mediaSrc?: string;
  theme: {
    bg: string;
    accent: string;
    card: string;
  };
  icon: React.ReactNode;
};

const DEFAULT_STEPS: HowStep[] = [
  {
    id: "deploy-bot",
    number: "01",
    title: "Setup & Deploy the Bot",
    desc:
      "Launch the setup bot, answer a few prompts, and it generates your configuration instantly. No manual setup—go from zero to ready-to-install in minutes.",
    mediaSrc: "/step1.png",
    theme: {
      bg: "bg-[radial-gradient(900px_circle_at_30%_20%,rgba(167,243,208,0.55),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(186,230,253,0.55),transparent_55%)]",
      accent: "#10b981",
      card: "bg-emerald-50 border-emerald-200",
    },
    icon: <Fingerprint className="h-5 w-5" />,
  },
  {
    id: "connect-tools",
    number: "02",
    title: "Connect Multiple Tools",
    desc:
      "Link your favorite tools (CRM, email, analytics, ads, Slack, etc.). The bot auto-detects what you already use and guides you through secure one-click connections.",
    mediaSrc: "/step2.png",
    theme: {
      bg: "bg-[radial-gradient(900px_circle_at_25%_20%,rgba(253,224,71,0.50),transparent_55%),radial-gradient(900px_circle_at_85%_70%,rgba(251,207,232,0.55),transparent_55%)]",
      accent: "#eab308",
      card: "bg-amber-50 border-amber-200",
    },
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    id: "embed-website",
    number: "03",
    title: "Embed on Your Website",
    desc:
      "Copy a single snippet (or use a 1-click install) to add the bot to your site. The bot verifies it's live and working in real time—no developer required.",
    mediaSrc: "/step3.png",
    theme: {
      bg: "bg-[radial-gradient(900px_circle_at_25%_15%,rgba(191,219,254,0.65),transparent_55%),radial-gradient(900px_circle_at_90%_85%,rgba(199,210,254,0.60),transparent_55%)]",
      accent: "#3b82f6",
      card: "bg-sky-50 border-sky-200",
    },
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: "automate",
    number: "04",
    title: "Track Analytics That Drive Growth",
    desc:
      "See leads, bookings, revenue, and ROAS in one dashboard. Track what converts, prove ROI, and double down on the workflows and channels that generate real results.",
    mediaSrc: "/step4.png",
    theme: {
      bg: "bg-[radial-gradient(900px_circle_at_30%_20%,rgba(251,191,36,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_75%,rgba(147,197,253,0.55),transparent_55%)]",
      accent: "#111827",
      card: "bg-zinc-50 border-zinc-200",
    },
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const StepItem: React.FC<{
  step: HowStep;
  idx: number;
  isActive: boolean;
  onActivate: (idx: number) => void;
  onSelect: (idx: number) => void;
  registerRef: (idx: number, node: HTMLDivElement | null) => void;
}> = ({ step, idx, isActive, onActivate, onSelect, registerRef }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "center center"],
  });

  // Height grows ONLY for active step
  const animatedHeight = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 115, 120]
  );

  const inView = useInView(ref, {
    margin: "-50% 0px -50% 0px",
  });

  useEffect(() => {
    if (inView) onActivate(idx);
  }, [idx, inView, onActivate]);

  return (
    <div
      ref={(node) => {
        ref.current = node;
        registerRef(idx, node);
      }}
      className="relative"
    >
      <motion.button
        type="button"
        onClick={() => onSelect(idx)}
        className="group w-full text-left"
      >
        <h3
          className={`text-xl pt-2 md:text-2xl transition-colors ${isActive ? "text-slate-900" : "text-slate-400"
            }`}
        >
          {step.title}
        </h3>

        {/* Description */}
        <motion.div
          style={{ height: isActive ? animatedHeight : 0 }}
          className="overflow-hidden"
        >
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-[48ch] pt-2">
            {step.desc}
          </p>
        </motion.div>

        {idx < DEFAULT_STEPS.length - 1 && (
          <div className="pt-8 mt-8 border-b border-slate-200" />
        )}
      </motion.button>
    </div>
  );
};

const VisualPanel: React.FC<{ step: HowStep }> = ({ step }) => {
  return (
    <div className="rounded-3xl border bg-white/80 p-4 shadow-xl backdrop-blur mt-14">
      <div className={`rounded-2xl p-6 ${step.theme.bg}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={step.id}
            src={step.mediaSrc}
            alt={step.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="max-h-96 mx-auto object-contain mt-10"
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isManualScrolling = useRef(false);

  const active = useMemo(
    () => DEFAULT_STEPS[clamp(activeStep, 0, DEFAULT_STEPS.length - 1)],
    [activeStep]
  );

  const registerStepRef = useCallback((idx, node) => {
    stepRefs.current[idx] = node;
  }, []);

  const setActiveFromScroll = useCallback((idx) => {
    if (!isManualScrolling.current) setActiveStep(idx);
  }, []);

  const scrollTo = useCallback((idx) => {
    const el = stepRefs.current[idx];
    if (!el) return;

    isManualScrolling.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      isManualScrolling.current = false;
    }, 600);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          {DEFAULT_STEPS.map((s, idx) => (
            <StepItem
              key={s.id}
              step={s}
              idx={idx}
              isActive={idx === activeStep}
              onActivate={setActiveFromScroll}
              onSelect={scrollTo}
              registerRef={registerStepRef}
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-24">
          <VisualPanel step={active} />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
