import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type UseCase = {
  id: string;
  title: string;
  desc: string;
};

type Integration = {
  id: string;
  label: string;
  src: string;
  pos: { x: number; y: number };
};

const useCases: UseCase[] = [
  {
    id: "personal-assistant",
    title: "Personal assistant",
    desc: "Handles reminders, tasks, and quick answers with your business context.",
  },
  {
    id: "faq-chatbot",
    title: "FAQ chatbot",
    desc: "Deflects repetitive questions using your docs and help center sources.",
  },
  {
    id: "appointment-booking",
    title: "Appointment booking",
    desc: "Books meetings and captures intake details without back-and-forth.",
  },
  {
    id: "email-sending",
    title: "Email sending bot",
    desc: "Drafts and sends emails for receipts, follow-ups, and support workflows.",
  },
  {
    id: "shopify-agent",
    title: "Shopify shopping agent",
    desc: "Helps customers browse, compare, and buy products in-chat.",
  },
];

const integrations: Integration[] = [
  {
    id: "instagram",
    label: "Instagram",
    src: "https://cdn.simpleicons.org/instagram",
    pos: { x: 145, y: 115 },
  },
  {
    id: "googleads",
    label: "Google Ads",
    src: "https://cdn.simpleicons.org/googleads",
    pos: { x: 250, y: 115 },
  },
  {
    id: "meta",
    label: "Meta",
    src: "https://cdn.simpleicons.org/meta",
    pos: { x: 355, y: 115 },
  },
  {
    id: "stripe",
    label: "Stripe",
    src: "https://cdn.simpleicons.org/stripe",
    pos: { x: 460, y: 115 },
  },
  {
    id: "shopify",
    label: "Shopify",
    src: "https://cdn.simpleicons.org/shopify",
    pos: { x: 565, y: 115 },
  },
];

const HUB = { x: 355, y: 330 };

function pathToHub(from: { x: number; y: number }) {
  const midY = 210;
  const c1x = from.x;
  const c1y = from.y + 80;
  const c2x = HUB.x;
  const c2y = midY;
  return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${HUB.x} ${HUB.y}`;
}

const Benefits: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(useCases[2].id);
  const [activeIntegrationId, setActiveIntegrationId] = useState(
    integrations[2].id
  );

  const active = useMemo(
    () => useCases.find((u) => u.id === activeId) ?? useCases[0],
    [activeId]
  );

  return (
    <section className="py-20 md:py-28 bg-white text-zinc-950 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.07),transparent_62%)]" />
        <div className="absolute -bottom-44 left-[-220px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.05),transparent_62%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[2.25rem] bg-zinc-100 border border-zinc-200 p-6 md:p-8 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.35)]">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-zinc-50 border border-zinc-200">
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_10%,rgba(56,189,248,0.12),transparent_55%)]" />

              <div className="relative h-[420px] md:h-[480px]">
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 680 520"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="cpActive" x1="0" y1="0" x2="680" y2="0">
                      <stop offset="0%" stopColor="rgba(2,132,199,0.0)" />
                      <stop offset="35%" stopColor="rgba(2,132,199,0.85)" />
                      <stop offset="100%" stopColor="rgba(2,132,199,0.0)" />
                    </linearGradient>
                  </defs>

                  {integrations.map((i) => {
                    const d = pathToHub({ x: i.pos.x, y: i.pos.y + 34 });
                    const isActive = i.id === activeIntegrationId;

                    return (
                      <g key={i.id}>
                        <path
                          d={d}
                          stroke="rgba(148,163,184,0.55)"
                          strokeWidth={1.25}
                          strokeLinecap="round"
                        />

                        <AnimatePresence initial={false}>
                          {isActive ? (
                            <motion.path
                              key="active"
                              d={d}
                              stroke="url(#cpActive)"
                              strokeWidth={2.25}
                              strokeLinecap="round"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          ) : null}
                        </AnimatePresence>

                        {!shouldReduceMotion ? (
                          <motion.path
                            d={d}
                            stroke={isActive ? "rgba(2,132,199,0.85)" : "rgba(148,163,184,0.35)"}
                            strokeWidth={isActive ? 2 : 1.5}
                            strokeLinecap="round"
                            strokeDasharray={"4 14"}
                            animate={{ strokeDashoffset: [0, -80] }}
                            transition={{
                              duration: isActive ? 1.45 : 2.4,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            opacity={isActive ? 1 : 0.55}
                          />
                        ) : null}
                      </g>
                    );
                  })}

                  <circle
                    cx={HUB.x}
                    cy={HUB.y}
                    r={64}
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(226,232,240,1)"
                  />

                  {!shouldReduceMotion ? (
                    <motion.circle
                      cx={HUB.x}
                      cy={HUB.y}
                      r={86}
                      fill="none"
                      stroke="rgba(2,132,199,0.20)"
                      strokeWidth={1.5}
                      animate={{ opacity: [0.2, 0.65, 0.2], r: [80, 88, 80] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : null}
                </svg>

                <div className="absolute inset-0">
                  <div
                    className="absolute inset-0"
                    onMouseLeave={() => setActiveIntegrationId(integrations[2].id)}
                  >
                    {integrations.map((i) => {
                      const isActive = i.id === activeIntegrationId;
                      const x = (i.pos.x / 680) * 100;
                      const y = (i.pos.y / 520) * 100;

                      return (
                        <motion.button
                          key={i.id}
                          type="button"
                          onMouseEnter={() => setActiveIntegrationId(i.id)}
                          onFocus={() => setActiveIntegrationId(i.id)}
                          onClick={() => setActiveIntegrationId(i.id)}
                          aria-label={i.label}
                          title={i.label}
                          whileHover={
                            shouldReduceMotion
                              ? undefined
                              : {
                                  y: -2,
                                  scale: 1.03,
                                  transition: {
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 26,
                                  },
                                }
                          }
                          className={
                            "absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border h-14 w-14 shadow-sm bg-white/90 backdrop-blur-sm transition overflow-hidden flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/30 " +
                            (isActive
                              ? "border-sky-200 shadow-[0_12px_30px_-16px_rgba(2,132,199,0.65)]"
                              : "border-zinc-200 hover:border-zinc-300")
                          }
                          style={{ left: `${x}%`, top: `${y}%` }}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <img
                            src={i.src}
                            alt={i.label}
                            className="h-7 w-7"
                            loading="lazy"
                            decoding="async"
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(HUB.x / 680) * 100}%`,
                      top: `${(HUB.y / 520) * 100}%`,
                    }}
                    animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="h-[92px] w-[92px] rounded-[22px] bg-white border border-zinc-200 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)] flex items-center justify-center">
                      <div className="h-[70px] w-[70px] rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.35),rgba(14,116,144,0.15))] border border-sky-200/50 flex items-center justify-center shadow-inner">
                        <img
                          src="/logo2.png"
                          alt="Chat Pilot"
                          className="h-10 w-auto select-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Use cases
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
              One platform,
              <br />
              unlimited agents
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 text-white px-6 py-3 text-sm font-semibold shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] transition hover:bg-zinc-900 active:scale-[0.99]"
              >
                View all use cases
              </a>
              <span className="text-sm text-zinc-500">
                Hover a tile to preview.
              </span>
            </div>

            <p className="mt-6 text-base text-zinc-600 leading-relaxed max-w-xl">
              Chat Pilot turns your knowledge and tools into reliable assistants.
              Start with a single workflow, then expand to new agents without
              rebuilding everything.
            </p>

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Featured
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-950">
                {active.title}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mt-2 text-sm text-zinc-600 leading-relaxed"
                >
                  {active.desc}
                </motion.p>
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap gap-2">
                {useCases.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onMouseEnter={() => setActiveId(u.id)}
                    onFocus={() => setActiveId(u.id)}
                    onClick={() => setActiveId(u.id)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/25 " +
                      (u.id === activeId
                        ? "bg-zinc-950 text-white border-zinc-950"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300")
                    }
                  >
                    {u.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
