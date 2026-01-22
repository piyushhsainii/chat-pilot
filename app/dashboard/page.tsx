"use client";
import { AnswerStyle, BotTone } from "@/lib/types";
import { supabase } from "@/services/supabase";
import React, { useEffect, useState } from "react";

const page = () => {
  const [workspaceName, setWorkspaceName] = useState("Acme Global Tech");
  const DEFAULT_BOT = {
    id: "bot-persistent-test",
    workspaceId: "Demo Workspace",
    name: "Global Support Bot",
    systemPrompt: "You are an AI assistant for the global support team.",
    tone: BotTone.PROFESSIONAL,
    status: "active",
    answerStyle: AnswerStyle.DETAILED,
    fallbackBehavior: "I cannot find that in the documents.",
    embedSettings: { theme: "light", primaryColor: "#6366f1" },
  };
  const [bots, setbots] = useState([DEFAULT_BOT]);
  const [credits, setCredits] = useState<any>({
    totalCredits: 500,
    usedCredits: 142,
    planName: "Starter",
    costPerQuery: 1,
  });

  const Playground = ({
    bots,
    credits,
    setCredits,
  }: {
    bots: any[];
    credits: any;
    setCredits: any;
  }) => {
    const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id || "");
    const [messages, setMessages] = useState<{
      [botId: string]: { role: "user" | "bot"; text: string }[];
    }>({});
    const [input, setInput] = useState("");

    const activeBot = bots.find((b) => b.id === selectedBotId);
    const currentMessages = messages[selectedBotId] || [];

    const handleSend = () => {
      if (!input.trim() || !activeBot) return;
      if (credits.usedCredits >= credits.totalCredits) {
        alert("Credit limit reached! Please upgrade your plan.");
        return;
      }

      const userMsg = input;
      setMessages((prev) => ({
        ...prev,
        [selectedBotId]: [
          ...(prev[selectedBotId] || []),
          { role: "user", text: userMsg },
        ],
      }));
      setInput("");

      // Deduct Credit
      setCredits((prev: any) => ({
        ...prev,
        usedCredits: prev.usedCredits + 1,
      }));

      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [selectedBotId]: [
            ...(prev[selectedBotId] || []),
            {
              role: "bot",
              text: `Response from ${activeBot.name}: Context analyzed. This query cost 1 credit.`,
            },
          ],
        }));
      }, 1000);
    };

    const theme = activeBot?.embedSettings?.theme || "light";
    const primaryColor = activeBot?.embedSettings?.primaryColor || "#6366f1";

    return (
      <div className="flex flex-col lg:flex-row gap-8 w-full h-full overflow-hidden">
        <div className="lg:w-64 flex-shrink-0 space-y-4 h-full overflow-y-auto pr-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-1">
            Select Agent
          </h3>
          <div className="space-y-2 pb-10">
            {bots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBotId(bot.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group ${
                  selectedBotId === bot.id
                    ? "bg-white border-indigo-600 shadow-md"
                    : "bg-white/40 border-slate-100"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                  🤖
                </div>
                <p
                  className={`text-xs font-bold truncate tracking-tighter ${selectedBotId === bot.id ? "text-indigo-600" : "text-slate-700"}`}
                >
                  {bot.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex justify-end items-start h-full pr-1">
          <div
            className={`w-full max-w-[420px] h-[580px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 ${theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            <div
              className="p-5 flex justify-between items-center border-b"
              style={{ borderTop: `6px solid ${primaryColor}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shadow-sm">
                  🤖
                </div>
                <div>
                  <h5 className="font-bold text-xs tracking-tighter">
                    {activeBot?.name}
                  </h5>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                    Live Preview
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-5 flex flex-col overflow-y-auto scrollbar-hide">
              {currentMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm tracking-tighter ${m.role === "bot" ? "bg-slate-50 border border-slate-100 rounded-tl-none" : "rounded-tr-none"}`}
                    style={
                      m.role === "user"
                        ? { backgroundColor: primaryColor, color: "#fff" }
                        : {}
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border bg-white border-slate-200">
                <input
                  placeholder="Type your message..."
                  className="bg-transparent text-xs w-full outline-none font-medium h-10 tracking-tighter"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl text-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const yo = async () => {
      const { data } = await supabase.auth.getSession();
      console.log(data);
    };
    yo();
  }, []);

  return (
    <div>
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-white h-10 w-10 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-lg text-indigo-600 font-bold">
            🏢
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter tracking-widest">
              Workspace
            </p>
            <h1 className="text-xs font-bold text-slate-800 uppercase tracking-tighter">
              {workspaceName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Credits Left
            </p>
            <p className="text-xs font-black text-indigo-600 tracking-tighter">
              {credits.totalCredits - credits.usedCredits}{" "}
              <span className="text-slate-400">/ {credits.totalCredits}</span>
            </p>
          </div>
          <button
            onClick={() => (window.location.hash = "#home")}
            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 tracking-tighter uppercase"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-180px)] flex flex-col">
        <h2 className="text-2xl font-black tracking-tighter">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <h4 className="text-[9px] uppercase opacity-70 font-bold tracking-tighter">
              Active Agents
            </h4>
            <div className="text-2xl font-black mt-1 tracking-tighter">
              {/* {bots.length} */}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
            <h4 className="text-[9px] uppercase text-slate-400 font-bold tracking-tighter">
              Messages
            </h4>
            <div className="text-2xl font-black mt-1 text-slate-900 tracking-tighter">
              {credits.usedCredits}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
            <h4 className="text-[9px] uppercase text-slate-400 font-bold tracking-tighter">
              Credits Used
            </h4>
            <div className="text-2xl font-black mt-1 text-slate-900 tracking-tighter">
              {Math.round((credits.usedCredits / credits.totalCredits) * 100)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
            <h4 className="text-[9px] uppercase text-slate-400 font-bold tracking-tighter">
              Plan
            </h4>
            <div className="text-2xl font-black mt-1 text-emerald-600 tracking-tighter">
              {credits.planName}
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Playground bots={bots} credits={credits} setCredits={setCredits} />
        </div>
      </div>
    </div>
  );
};

export default page;
