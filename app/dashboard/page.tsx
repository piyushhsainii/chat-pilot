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
  const [credits, setCredits] = useState({
    totalCredits: 500,
    usedCredits: 142,
    planName: "Starter",
    costPerQuery: 1,
  });

  useEffect(() => {
    if (bots && bots.length > 0) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots]);


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
            {credits.totalCredits - credits.usedCredits} / {credits.totalCredits} credits
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
        {selectedBot && isBotFullyConfigured(selectedBot) && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg max-w-[1000px]">
            <Playground
              selectedBot={selectedBot}
              credits={credits}
              setCredits={setCredits}
            />
          </div>
        )}

        {selectedBot && !isBotFullyConfigured(selectedBot) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-700">
            ⚠️ This bot is disabled because it’s not fully configured.
            <Link
              href={`/dashboard/bots/${selectedBot.id}/config`}
              className="ml-2 underline font-semibold text-red-800"
            >
              Fix configuration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
