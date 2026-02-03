import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Database,
  Fingerprint,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";

type HowStep = {
  id: string;
  number: string;
  title: string;
  desc: string;
  mediaSrc?: string;
  theme: {
    // Background wash for the right panel.
    bg: string;
    // Accent color used for highlights.
    accent: string;
    // Soft card tint.
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
      card: "bg-amber-50 border-amber-amber-200",
    },
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    id: "embed-website",
    number: "03",
    title: "Embed on Your Website",
    desc:
      "Copy a single snippet (or use a 1-click install) to add the bot to your site. The bot verifies it’s live and working in real time—no developer required.",
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
    theme: {
      bg: "bg-[radial-gradient(900px_circle_at_30%_20%,rgba(251,191,36,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_75%,rgba(147,197,253,0.55),transparent_55%)]",
      accent: "#111827",
      card: "bg-zinc-50 border-zinc-200",
    },
    mediaSrc: "/step4.png",
    icon: <BarChart3 className="h-5 w-5" />,
  },

];


function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function usePrefersReducedMotionValue() {
  const reduced = useReducedMotion();
  return Boolean(reduced);
}

const StepItem: React.FC<{
  step: HowStep;
  idx: number;
  isActive: boolean;
  shouldReduceMotion: boolean;
  onActivate: (idx: number) => void;
  onSelect: (idx: number) => void;
  registerRef: (idx: number, node: HTMLDivElement | null) => void;
}> = ({
  step,
  idx,
  isActive,
  shouldReduceMotion,
  onActivate,
  onSelect,
  registerRef,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const inView = useInView(ref, {
      amount: 0,
      // Treat "center line" as the activation trigger.
      margin: "-50% 0px -50% 0px",
    });

    useEffect(() => {
      if (!inView) return;
      onActivate(idx);
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
          aria-current={isActive ? "step" : undefined}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={
            "group w-full rounded-3xl border px-6 py-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/15 " +
            (isActive
              ? "bg-white border-zinc-200 shadow-[0_18px_70px_-55px_rgba(0,0,0,0.55)]"
              : "bg-white/40 border-transparent hover:bg-white hover:border-zinc-200")
          }
        >
          <div className="flex items-start gap-4">
            <div className="pt-0.5">
              <div
                className={
                  "h-9 w-9 rounded-2xl border flex items-center justify-center shadow-sm transition-colors " +
                  (isActive
                    ? "bg-zinc-950 border-zinc-950 text-white"
                    : "bg-white border-zinc-200 text-zinc-700")
                }
              >
                {step.icon}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <div
                  className={
                    "text-xs font-black tracking-[0.18em] tabular-nums " +
                    (isActive ? "text-zinc-900" : "text-zinc-400")
                  }
                >
                  {step.number}
                </div>
                <div
                  className={
                    "text-lg md:text-xl font-semibold tracking-tight " +
                    (isActive ? "text-zinc-950" : "text-zinc-500")
                  }
                >
                  {step.title}
                </div>
              </div>

              <motion.p
                initial={false}
                animate={
                  shouldReduceMotion
                    ? { opacity: isActive ? 1 : 0 }
                    : {
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                      marginTop: isActive ? 10 : 0,
                    }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: "easeOut" }
                }
                className="overflow-hidden text-sm text-zinc-600 leading-relaxed max-w-[54ch]"
              >
                {step.desc}
              </motion.p>
            </div>
          </div>
        </motion.button>
      </div>
    );
  };

const ConnectorViz: React.FC<{
  activeIdx: number;
  accent: string;
  shouldReduceMotion: boolean;
}> = ({ activeIdx, accent, shouldReduceMotion }) => {
  const nodes = useMemo(
    () => [
      {
        label: "Meta",
        style: "bg-white border-zinc-200",
        icon: (
          <div className="h-9 w-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 font-black">
            m
          </div>
        ),
        pos: { x: 14, y: 54 },
      },
      {
        label: "Google",
        style: "bg-white border-zinc-200",
        icon: (
          <div className="h-9 w-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-black">
            g
          </div>
        ),
        pos: { x: 74, y: 34 },
      },
      {
        label: "Ads",
        style: "bg-white border-zinc-200",
        icon: (
          <div className="h-9 w-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black">
            a
          </div>
        ),
        pos: { x: 80, y: 70 },
      },
      {
        label: "Site",
        style: "bg-white border-zinc-200",
        icon: (
          <div className="h-9 w-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black">
            w
          </div>
        ),
        pos: { x: 28, y: 24 },
      },
    ],
    [],
  );

  const hub = { x: 48, y: 52 };
  const activeNode = nodes[clamp(activeIdx, 0, nodes.length - 1)];

  const pathFor = (from: { x: number; y: number }) => {
    const midX = (from.x + hub.x) / 2;
    const midY = (from.y + hub.y) / 2;
    const c1 = { x: midX, y: from.y };
    const c2 = { x: midX, y: hub.y };
    return `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${hub.x} ${hub.y}`;
  };

  return (
    <div className="relative h-[360px] sm:h-[420px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {nodes.map((n) => {
          const d = pathFor(n.pos);
          const isActive = n.label === activeNode.label;

          return (
            <g key={n.label}>
              <path
                d={d}
                stroke="rgba(148,163,184,0.55)"
                strokeWidth={0.9}
                strokeLinecap="round"
              />

              {!shouldReduceMotion ? (
                <motion.path
                  d={d}
                  stroke={isActive ? accent : "rgba(148,163,184,0.35)"}
                  strokeWidth={isActive ? 1.7 : 1.1}
                  strokeLinecap="round"
                  strokeDasharray={"3 10"}
                  animate={{ strokeDashoffset: [0, -80] }}
                  transition={{
                    duration: isActive ? 1.35 : 2.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  opacity={isActive ? 0.95 : 0.55}
                />
              ) : null}
            </g>
          );
        })}

        <circle
          cx={hub.x}
          cy={hub.y}
          r={12.5}
          fill="rgba(255,255,255,0.9)"
          stroke="rgba(226,232,240,1)"
        />
        {!shouldReduceMotion ? (
          <motion.circle
            cx={hub.x}
            cy={hub.y}
            r={18.5}
            fill="none"
            stroke={accent}
            strokeWidth={0.8}
            animate={{ opacity: [0.12, 0.35, 0.12], r: [17, 19, 17] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </svg>

      {nodes.map((n) => {
        const isActive = n.label === activeNode.label;
        return (
          <div
            key={n.label}
            className={
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 shadow-sm backdrop-blur-sm transition " +
              (isActive
                ? "bg-white/90 border-slate-200 shadow-[0_16px_40px_-26px_rgba(0,0,0,0.45)]"
                : "bg-white/75 border-white/40")
            }
            style={{ left: `${n.pos.x}%`, top: `${n.pos.y}%` }}
          >
            <div className="flex items-center gap-2">
              {n.icon}
              <div className="text-xs font-bold text-zinc-800 whitespace-nowrap">
                {n.label}
              </div>
            </div>
          </div>
        );
      })}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
      >
        <div className="h-[78px] w-[78px] rounded-[22px] bg-white/90 border border-white/60 shadow-[0_20px_55px_-34px_rgba(0,0,0,0.65)] flex items-center justify-center">
          <div className="h-[58px] w-[58px] rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),rgba(255,255,255,0.15))] border border-white/70 flex items-center justify-center">
            <LinkIcon className="h-6 w-6" style={{ color: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const VisualPanel: React.FC<{
  step: HowStep;
  activeIdx: number;
  shouldReduceMotion: boolean;
}> = ({ step, activeIdx, shouldReduceMotion }) => {
  return (
    <div
      className={
        "rounded-[2.25rem] border border-zinc-200 bg-white/80 p-3 shadow-[0_40px_120px_-85px_rgba(0,0,0,0.45)]" +
        " backdrop-blur-sm"
      }
    >
      <div
        className={
          "relative overflow-hidden rounded-[1.85rem] border border-zinc-200 bg-white " +
          step.theme.bg
        }
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.85]" />

        <div className="relative px-6 pt-6 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={
                  "h-11 w-11 rounded-2xl border shadow-sm flex items-center justify-center " +
                  step.theme.card
                }
                style={{ color: step.theme.accent }}
              >
                {step.icon}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
                  Step {step.number}
                </div>
                <div className="text-base font-bold tracking-tight text-zinc-950">
                  {step.title}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] font-semibold text-zinc-700">
                Live preview
              </span>
            </div>
          </div>

          <div className="mt-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <img src={step.mediaSrc} className="max-h-96 mx-auto" alt="" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorks: React.FC<{ steps?: HowStep[] }> = ({ steps = DEFAULT_STEPS }) => {
  const shouldReduceMotion = usePrefersReducedMotionValue();
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const active = useMemo(() => steps[clamp(activeStep, 0, steps.length - 1)], [steps, activeStep]);

  const registerStepRef = useCallback((idx: number, node: HTMLDivElement | null) => {
    stepRefs.current[idx] = node;
  }, []);

  const setActiveFromScroll = useCallback((idx: number) => {
    setActiveStep((prev) => (prev === idx ? prev : idx));
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const el = stepRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <section
      id="how"
      className="relative py-20 md:py-28 bg-zinc-50 border-y border-zinc-200 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-28 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.07),transparent_60%)]" />
        <div className="absolute -bottom-40 right-[-240px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.05),transparent_60%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            A scroll-guided workflow that stays clear
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Scroll to explore. The preview stays put while the steps advance.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Steps (left) */}
          <div className="relative lg:col-span-5">
            <div className="absolute left-3 top-3 bottom-3 w-px bg-zinc-200" aria-hidden="true" />
            <motion.div
              className="absolute left-3 top-3 w-px origin-top bg-zinc-950/35"
              aria-hidden="true"
              animate={{
                height:
                  steps.length <= 1
                    ? "0%"
                    : `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 300, damping: 34 }
              }
            />

            <div className="space-y-6">
              {steps.map((s, idx) => (
                <div key={s.id} className="relative pl-6">
                  <div
                    className={
                      "absolute left-0 top-7 h-3.5 w-3.5 rounded-full border bg-white transition-colors " +
                      (idx === activeStep
                        ? "border-zinc-950"
                        : "border-zinc-300")
                    }
                    aria-hidden="true"
                  />

                  <StepItem
                    step={s}
                    idx={idx}
                    isActive={idx === activeStep}
                    shouldReduceMotion={shouldReduceMotion}
                    onActivate={setActiveFromScroll}
                    onSelect={scrollTo}
                    registerRef={registerStepRef}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Visual (right) */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <VisualPanel
                step={active}
                activeIdx={activeStep}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
