"use client";
import { useEffect, useState } from "react";
import BotCard from "./BotCard";
import NewAgentStepper from "./NewAgentStepper";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/dashboardStore";



const Agents = () => {
  const { bots } = useDashboardStore()
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [summary, setSummary] = useState<{
    perBot: Record<string, { totalMessages: number; connectors: string[] }>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/agents/summary");
        if (!res.ok) return;
        const json = (await res.json()) as any;
        if (!cancelled) setSummary(json);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black tracking-tighter">My Agents</h2>
          <motion.button
            onClick={() => setShowNewAgent(true)}
            whileHover="hover"
            whileTap={{ scale: 0.96 }}
            initial="rest"
            animate="rest"
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.05 },
            }}
            className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs tracking-tight shadow-lg"
          >
            {/* Glow */}
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

            {/* Sparkle */}
            <motion.span
              variants={{
                rest: { opacity: 0, y: 10 },
                hover: { opacity: 1, y: -10 },
              }}
              transition={{ duration: 0.4 }}
              className="absolute right-3 top-1 text-lg"
            >
              ✨
            </motion.span>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              <motion.span
                variants={{
                  rest: { rotate: 0, x: 0 },
                  hover: { rotate: 20, x: 4 },
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-base"
              >
                🤖
              </motion.span>

              <span>New Agent</span>
            </span>
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots && bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              stats={summary?.perBot?.[bot.id]}
            />
          ))}
        </div>
      </div>
      {showNewAgent && (
        <NewAgentStepper onClose={() => setShowNewAgent(false)} />
      )}
    </>
  );
};

export default Agents;
