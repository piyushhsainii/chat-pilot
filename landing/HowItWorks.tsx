import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Build & deploy your agent",
    desc: "Upload docs, sync your help center, or point to your URL. Deploy in minutes.",
    img: "https://picsum.photos/seed/step1/1200/900",
  },
  {
    id: 2,
    title: "Agent solves your customers' problems",
    desc: "Your agent uses real-time context to provide accurate answers instantly.",
    img: "https://picsum.photos/seed/step2/1200/900",
  },
  {
    id: 3,
    title: "Refine & optimize",
    desc: "Use human-in-the-loop to teach your agent and improve response quality.",
    img: "https://picsum.photos/seed/step3/1200/900",
  },
  {
    id: 4,
    title: "Route complex issues to a human",
    desc: "Smart escalation automatically hands off complex tickets to your support team.",
    img: "https://picsum.photos/seed/step4/1200/900",
  },
  {
    id: 5,
    title: "Review analytics & insights",
    desc: "Deep visibility into agent performance and customer satisfaction trends.",
    img: "https://picsum.photos/seed/step5/1200/900",
  },
];

type Step = (typeof steps)[number];

const StepCard: React.FC<{
  step: Step;
  idx: number;
  activeStep: number;
  shouldReduceMotion: boolean;
  onActivateFromScroll: (idx: number) => void;
  onSelect: (idx: number) => void;
  registerRef: (idx: number, node: HTMLDivElement | null) => void;
}> = ({
  step,
  idx,
  activeStep,
  shouldReduceMotion,
  onActivateFromScroll,
  onSelect,
  registerRef,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isActive = activeStep === idx;
  const isInView = useInView(ref, {
    amount: 0.55,
    margin: "-45% 0px -45% 0px",
  });

  useEffect(() => {
    if (!isInView) return;
    onActivateFromScroll(idx);
  }, [idx, isInView, onActivateFromScroll]);

  const number = String(step.id).padStart(2, "0");

  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
        registerRef(idx, node);
      }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative"
    >
      <motion.button
        type="button"
        layout
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 520, damping: 44 }
        }
        onClick={() => onSelect(idx)}
        className={
          "group relative w-full text-left rounded-2xl px-5 py-4 border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 " +
          (isActive
            ? "bg-white border-zinc-200 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.55)]"
            : "bg-transparent border-transparent hover:bg-white hover:border-zinc-200")
        }
        aria-current={isActive ? "step" : undefined}
      >
        {isActive ? (
          <motion.div
            layoutId="howItWorksActive"
            transition={{ type: "spring", stiffness: 520, damping: 44 }}
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_35%_0%,rgba(24,24,27,0.08),transparent_58%)]"
          />
        ) : null}

        <div
          className={
            "relative grid grid-cols-[3.25rem_1fr] gap-4 items-start transition-opacity " +
            (isActive ? "opacity-100" : "opacity-55 group-hover:opacity-80")
          }
        >
          <div className="relative pt-0.5">
            <div className="absolute left-0 top-2 h-5 w-5 rounded-full bg-white border border-zinc-200" />
            <motion.div
              className={
                "absolute left-0 top-2 h-5 w-5 rounded-full border " +
                (isActive ? "bg-zinc-950 border-zinc-950" : "bg-white border-zinc-300")
              }
              animate={
                shouldReduceMotion
                  ? undefined
                  : { scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.65 }
              }
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />

            <div
              className={
                "pl-7 text-sm font-semibold tabular-nums transition-colors " +
                (isActive ? "text-zinc-900" : "text-zinc-400")
              }
            >
              {number}
            </div>
          </div>

          <div className="min-w-0">
            <div
              className={
                "text-lg md:text-xl font-semibold tracking-tight transition-colors " +
                (isActive ? "text-zinc-950" : "text-zinc-500")
              }
            >
              {step.title}
            </div>

            <motion.div
              initial={false}
              animate={
                shouldReduceMotion
                  ? { opacity: isActive ? 1 : 0 }
                  : {
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                      marginTop: isActive ? 8 : 0,
                      scale: isActive ? 1 : 0.985,
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: "easeOut" }
              }
              style={{ overflow: "hidden" }}
              className="origin-top"
            >
              <p className="text-sm text-zinc-600 leading-relaxed max-w-[46ch]">
                {step.desc}
              </p>
            </motion.div>
          </div>
        </div>

        {idx < steps.length - 1 ? (
          <div className="pointer-events-none absolute left-5 right-5 bottom-0 h-px bg-zinc-200/70" />
        ) : null}
      </motion.button>
    </motion.div>
  );
};

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const active = useMemo(() => steps[activeStep], [activeStep]);

  const registerRef = useCallback((idx: number, node: HTMLDivElement | null) => {
    stepRefs.current[idx] = node;
  }, []);

  const scrollToStep = useCallback((idx: number) => {
    const el = stepRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const setActiveFromScroll = useCallback((idx: number) => {
    setActiveStep((prev) => (prev === idx ? prev : idx));
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how"
      className="relative py-20 md:py-28 bg-zinc-50 border-y border-zinc-200 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.08),transparent_60%)]" />
        <div className="absolute -bottom-40 right-[-240px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.06),transparent_60%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950">
            From docs to deployed agent in minutes
          </h2>
          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            A guided workflow that keeps setup simple and results predictable.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div
            className="relative"
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const dir = e.key === "ArrowDown" ? 1 : -1;
              const next = (activeStep + dir + steps.length) % steps.length;
              scrollToStep(next);
            }}
          >
            <div className="absolute left-5 top-1 bottom-1 w-px bg-zinc-200" />

            <motion.div
              className="absolute left-5 top-1 w-px origin-top bg-zinc-950/30"
              animate={{
                height:
                  steps.length <= 1
                    ? "0%"
                    : `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 36 }
              }
            />

            <div className="space-y-6 lg:space-y-10">
              {steps.map((step, idx) => (
                <StepCard
                  key={step.id}
                  step={step}
                  idx={idx}
                  activeStep={activeStep}
                  shouldReduceMotion={!!shouldReduceMotion}
                  onActivateFromScroll={setActiveFromScroll}
                  onSelect={scrollToStep}
                  registerRef={registerRef}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-2 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.45)] lg:sticky lg:top-1/2 lg:-translate-y-1/2">
            <motion.div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={activeStep}
                  src={active.img}
                  alt={active.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.02, y: 8 }}
                  animate={{ opacity: 0.92, scale: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.995, y: -6 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full object-cover saturate-0 contrast-110"
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-zinc-950/20 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.08),transparent_45%)]" />

              <div className="absolute left-4 right-4 bottom-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-200/80">
                  Step {String(active.id).padStart(2, "0")}
                </div>
                <div className="mt-1 text-base font-semibold text-white leading-snug">
                  {active.title}
                </div>
                <div className="mt-2 text-sm text-zinc-200/80 leading-relaxed">
                  {active.desc}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
