"use client";

import BotSelector from "@/components/BotSelector";
import { Playground } from "@/components/Playground";
import { useDashboardStore } from "@/store/dashboardStore";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ----------------------------------------
   Config validation + scoring helpers
---------------------------------------- */

type ConfigCheck = {
  label: string;
  valid: boolean;
};

const getBotConfigChecks = (bot: any): ConfigCheck[] => {
  return [
    {
      label: "Bot settings configured",
      valid: Boolean(bot.bot_settings?.is_configured),
    },
    {
      label: "Widget created",
      valid: Boolean(bot.widgets),
    },
    {
      label: "Widget title",
      valid: Boolean(bot.widgets?.title),
    },
    {
      label: "Primary color",
      valid: Boolean(bot.widgets?.primary_color),
    },
    {
      label: "Greeting message",
      valid: Boolean(bot.widgets?.greeting_message),
    },
    {
      label: "Theme selected",
      valid: Boolean(bot.widgets?.theme),
    },
    {
      label: "System prompt",
      valid: Boolean(bot.system_prompt && bot.system_prompt.trim().length > 0),
    },
  ];
};

const getConfigProgress = (checks: ConfigCheck[]) => {
  const passed = checks.filter((c) => c.valid).length;
  return Math.round((passed / checks.length) * 100);
};

const isBotFullyConfigured = (bot: any) => {
  return getBotConfigChecks(bot).every((c) => c.valid);
};

/* ----------------------------------------
   Dashboard Page
---------------------------------------- */

const DashboardPage = () => {
  const { bots, workspaces } = useDashboardStore();

  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const selectedBot = bots?.find((b) => b.id === selectedBotId);

  const workspaceTier =
    (workspaces as any)?.workspaces?.tier ?? (workspaces as any)?.tier ?? "free";

  const getPlanCredits = (tierRaw: any) => {
    const t = String(tierRaw || "free").toLowerCase();
    if (t === "business") return 25000;
    if (t === "pro") return 5000;
    return 500;
  };

  const [credits, setCredits] = useState<{ balance: number | null; total: number }>(
    {
      balance: null,
      total: getPlanCredits(workspaceTier),
    },
  );

  const refreshCredits = async () => {
    try {
      const res = await fetch("/api/user/credits", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json().catch(() => ({}))) as any;
      const bal = json?.credits?.balance;
      if (typeof bal === "number") {
        setCredits((prev) => ({ ...prev, balance: bal }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (bots && bots.length > 0) {
      const firstConfigured = bots.find((b) => isBotFullyConfigured(b));
      setSelectedBotId((firstConfigured ?? bots[0]).id);
    }
  }, [bots]);

  useEffect(() => {
    setCredits((prev) => ({ ...prev, total: getPlanCredits(workspaceTier) }));
  }, [workspaceTier]);

  useEffect(() => {
    refreshCredits();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Workspace
            </p>
            <h1 className="text-sm font-bold text-slate-800">
              {workspaces?.workspaces?.name}
            </h1>
          </div>
          <div className="text-sm font-bold text-indigo-600">
            {credits.balance === null ? "…" : credits.balance} / {credits.total} credits
          </div>
        </header>

        {/* Bot Grid */}
        {bots && bots.length > 0 ? (
          <BotSelector
            bots={bots}
            getBotConfigChecks={getBotConfigChecks}
            getConfigProgress={getConfigProgress}
            selectedBotId={selectedBotId}
            setSelectedBotId={setSelectedBotId}
            isBotFullyConfigured={isBotFullyConfigured}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500 text-sm">
              No bots found. Create one to get started.
            </p>
          </div>
        )}

        {/* Playground */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Playground
            </h2>
            <p className="text-sm text-slate-600">
              This is a playground test environment to test out the working of the ai bot agent.
            </p>
          </div>

          {!bots || bots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-slate-500 text-sm">No bot is present. Create one to start testing.</p>
            </div>
          ) : selectedBot && isBotFullyConfigured(selectedBot) ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg max-w-[1000px]">
              <Playground
                selectedBot={selectedBot}
                credits={credits}
                refreshCredits={refreshCredits}
              />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
              Configure a bot to test it out in the Playground.
              {selectedBot ? (
                <Link
                  href={`/dashboard/bots/${selectedBot.id}/config`}
                  className="ml-2 underline font-semibold text-amber-900"
                >
                  Configure now
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
