"use client";
import { Playground } from "@/components/Playground";
import { AnswerStyle, Bot, BotTone } from "@/lib/types";
import { useDashboardStore } from "@/store/dashboardStore";
import { useEffect, useState } from "react";

// Main Dashboard Page
const DashboardPage = () => {
  const DEMO_BOTS: Bot[] = [
    {
      id: "bot-1",
      workspaceId: "Demo Workspace",
      name: "Customer Support Bot",
      systemPrompt:
        "You are a helpful customer support assistant. Be empathetic and solve problems efficiently.",
      tone: BotTone.FRIENDLY,
      status: "active",
      answerStyle: AnswerStyle.DETAILED,
      fallbackBehavior:
        "I apologize, but I don't have that information. Let me connect you with a human agent.",
      embedSettings: { theme: "light", primaryColor: "#6366f1" },
      model: "gpt-4o-mini",
      contextChunks: [
        "Our support hours are Monday-Friday 9AM-5PM EST. We offer 24/7 email support with responses within 4 hours.",
        "For account issues, please provide your email and order number. Password resets are available through the login page.",
        "Refund policy: Full refunds within 30 days of purchase. Partial refunds available up to 90 days.",
      ],
    },
    {
      id: "bot-2",
      workspaceId: "Demo Workspace",
      name: "Sales Assistant",
      systemPrompt:
        "You are a sales assistant focused on helping customers find the right products.",
      tone: BotTone.PROFESSIONAL,
      status: "active",
      answerStyle: AnswerStyle.DETAILED,
      fallbackBehavior:
        "I'm not sure about that. Would you like to speak with our sales team?",
      embedSettings: { theme: "light", primaryColor: "#ec4899" },
      model: "gpt-4o-mini",
      contextChunks: [
        "We offer three pricing tiers: Starter ($29/mo), Professional ($79/mo), and Enterprise (custom pricing).",
        "All plans include unlimited users, 24/7 support, and a 14-day free trial. Enterprise includes dedicated support and custom integrations.",
        "Current promotion: 20% off annual plans. Use code ANNUAL20 at checkout.",
      ],
    },
    {
      id: "bot-3",
      workspaceId: "Demo Workspace",
      name: "Tech Support Pro",
      systemPrompt:
        "You are a technical support specialist. Provide clear, step-by-step solutions.",
      tone: BotTone.PROFESSIONAL,
      status: "active",
      answerStyle: AnswerStyle.DETAILED,
      fallbackBehavior:
        "This requires specialized knowledge. I'll escalate to our technical team.",
      embedSettings: { theme: "dark", primaryColor: "#10b981" },
      model: "gpt-4o-mini",
      contextChunks: [
        "API Setup: 1) Generate API key in dashboard 2) Add to environment variables 3) Initialize client with key.",
        "Common error 401: Invalid API key. Check for typos and ensure key is active in dashboard.",
        "Rate limits: 100 requests/minute on Starter, 1000/min on Professional, unlimited on Enterprise.",
      ],
    },
    {
      id: "bot-4",
      workspaceId: "Demo Workspace",
      name: "Casual Chat Bot",
      systemPrompt:
        "You are a friendly conversational AI. Keep things light and engaging.",
      tone: BotTone.FRIENDLY,
      status: "active",
      answerStyle: AnswerStyle.SHORT,
      fallbackBehavior:
        "Hmm, I'm not sure about that one! Want to ask me something else?",
      embedSettings: { theme: "light", primaryColor: "#f59e0b" },
      model: "gpt-4o-mini",
      contextChunks: [
        "Hey there! I'm here to chat and help out with whatever you need. No question is too small!",
        "Fun fact: Our team loves coffee and has consumed over 10,000 cups while building this product.",
        "We're based in San Francisco but work with customers all around the world!",
      ],
    },
  ];
  const { bots, user, workspace } = useDashboardStore()
  // const [bots] = useState(DEMO_BOTS);

  const [selectedBotId, setSelectedBotId] = useState(bots && bots.length > 0 ? bots[0].id : null);
  const [credits, setCredits] = useState({
    totalCredits: 500,
    usedCredits: 142,
    planName: "Starter",
    costPerQuery: 1,
  });

  const selectedBot = bots && bots.find((b) => b.id === selectedBotId)
  useEffect(() => {
    if (!bots || bots.length == 0) return;

    setSelectedBotId(bots[0].id)
  }, [bots])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-white h-12 w-12 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-2xl">
              🏢
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Workspace
              </p>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">
                Demo Workspace
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Credits Left
              </p>
              <p className="text-sm font-bold text-indigo-600 tracking-tight">
                {credits.totalCredits - credits.usedCredits}{" "}
                <span className="text-slate-400">/ {credits.totalCredits}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900">
              Bot Playground
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {bots && bots.filter((b) => b.bot_settings?.active).length} Active Bots
              </span>
            </div>
          </div>

          {/* Bot Selection Grid */}
          {bots && bots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bots.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBotId(bot.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left group hover:shadow-lg ${selectedBotId === bot.id
                    ? "bg-white border-indigo-500 shadow-md scale-[1.02]"
                    : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {selectedBotId === bot.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0"
                      style={{
                        backgroundColor:
                          selectedBotId === bot.id
                            ? bot.widgets?.primary_color ?? "#ffffff"
                            : "#f1f5f9",
                      }}
                    >
                      🤖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate tracking-tight mb-1 ${selectedBotId === bot.id ? "text-indigo-600" : "text-slate-800"}`}
                      >
                        {bot.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                          {bot.tone}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-4xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Agents Available</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                You haven't created any agents yet. Create your first agent to start using the playground.
              </p>
            </div>
          )}

          {/* Playground */}
          {bots && bots.length > 0 && selectedBot && (
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 p-6 shadow-lg">
              <Playground
                selectedBot={selectedBot}
                credits={credits}
                setCredits={setCredits}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;