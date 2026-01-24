"use client";

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
  const { bots, workspace } = useDashboardStore();

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
              {workspace?.workspaces?.name}
            </h1>
          </div>
          <div className="text-sm font-bold text-indigo-600">
            {credits.totalCredits - credits.usedCredits} / {credits.totalCredits} credits
          </div>
        </header>

        {/* Bot Grid */}
        {bots && bots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bots.map((bot) => {
              const checks = getBotConfigChecks(bot);
              const progress = getConfigProgress(checks);
              const configured = isBotFullyConfigured(bot);

              return (
                <button
                  key={bot.id}
                  disabled={!configured}
                  onClick={() => configured && setSelectedBotId(bot.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all
                    ${!configured
                      ? "bg-slate-100 border-red-200 cursor-not-allowed opacity-75"
                      : selectedBotId === bot.id
                        ? "bg-white border-indigo-500 shadow-md scale-[1.02]"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
                    }`}
                >
                  {/* Config error badge */}
                  {!configured && (
                    <Link
                      href={`/dashboard/bots/${bot.id}/config`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 right-2 group"
                    >
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold uppercase">
                        Config Error
                      </span>

                      {/* Tooltip */}
                      <div className="absolute z-10 right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <p className="text-[10px] font-bold text-slate-600 mb-2 uppercase">
                          Missing configuration
                        </p>
                        <ul className="space-y-1">
                          {checks
                            .filter((c) => !c.valid)
                            .map((c) => (
                              <li
                                key={c.label}
                                className="text-[11px] text-red-600"
                              >
                                • {c.label}
                              </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-[10px] text-indigo-600 font-semibold">
                          Click to fix →
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Bot header */}
                  <p className="text-sm font-bold text-slate-800 mb-1 truncate">
                    {bot.name}
                  </p>

                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                    {bot.tone}
                  </span>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-1">
                      <span>Configuration</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all ${progress === 100
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                          }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500 text-sm">
              No bots found. Create one to get started.
            </p>
          </div>
        )}

        {/* Playground */}
        {selectedBot && isBotFullyConfigured(selectedBot) && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
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
